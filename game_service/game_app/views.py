from django.shortcuts import render, redirect
from django.http import HttpResponse
from rest_framework_simplejwt.tokens import AccessToken, TokenError
from django.contrib.auth.models import User
from django.views import View
from .models import *
from django.shortcuts import get_object_or_404
import json
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .sandbox.sandbox import run_in_sandbox
from django.core.cache import cache
from django.http import JsonResponse
from .kafka_service import kafka_producer
# Create your views here.

@method_decorator(csrf_exempt, name="dispatch")
class GameRoomView(View):
    def get(self,request,match_id):
        token_str = request.GET.get("token")
        if not token_str:
            return HttpResponse("No token pls go away",status = 403)
        try:

            access = AccessToken(token_str)
            user_id = access["user_id"]
            username = access.get("username", f"user_{user_id}")


            user, created = User.objects.get_or_create(id=user_id)
            if user.username != username:
                user.username = username
                user.save() 
            
            _, p1_id, p2_id = match_id.split("_")

            player1 = User.objects.get(id=p1_id)
            player2 = User.objects.get(id=p2_id)

            task = Task.objects.first()
            if not task:
                return HttpResponse("❌ Нет задач в базе", status=500)

       
            room, created = GameRoom.objects.get_or_create(
                match_id=match_id,
                defaults={
                    "player1": player1,
                    "player2": player2,
                    "task": task
                }
            )

            print(
                f"✅ Комната {match_id}: "
                f"{player1.username} vs {player2.username}"
            )

            return render(request, "game_room.html", {
                "match_id": match_id,
                "user": user,
                "room": room
            })

        except Exception as e:
            return HttpResponse(f"Ошибка авторизации: {e}", status=403)
    def post(self, request,match_id):
        
        room = get_object_or_404(GameRoom, match_id=match_id)
        result = None
        token = request.GET.get("token")
        try:
            access = AccessToken(token)
            user_id = access["user_id"]
            username = access.get("username")
        except TokenError:
            return HttpResponse("❌ JWT истёк")
        user = User.objects.get(id=user_id) 
        if "leave" in request.POST:
            if room.player1_id == user_id:
                room.player1 = None
            elif room.player2_id == user_id:
                room.player2 = None
            room.save()
            return redirect("/")

        if "submit_solution" in request.POST:
            code = request.POST.get("code", "").strip()
            if code:
               
                tests = room.task.tests
                if isinstance(tests, str):
                    tests = json.loads(tests)
                
                print(f"🔍 Type of tests: {type(tests)}")
                print(f"🔍 Tests value: {tests}")
                
                sandbox_result = run_in_sandbox(code, tests)

                if "error" in sandbox_result:
                    result = {
                        "is_correct": False,
                        "error": sandbox_result["error"]
                    }
                else:
                    test_results = sandbox_result["output"]
                    if isinstance(test_results, str):
                        test_results = json.loads(test_results)
                    
                    passed_all = all(t["passed"] for t in test_results)

                    if passed_all and not room.is_finished:
                        room.is_finished = True
                        room.winner_name = username
                        room.save()
                        cache.set(
                            f"match:{room.match_id}:result",
                            {
                                "is_finished": True,
                                "winner_name": room.winner_name
                            },
                            timeout=60 * 10  # 10 минут
                        )
                        winner_id = user.id
                        loser_id = room.player2_id if user.id == room.player1_id else room.player1_id
                        
                        match_result_event = {
                            "event": "match_finished",
                            "match_id": room.match_id,
                            "winner_id": winner_id,
                            "loser_id": loser_id,
                            "task_id": room.task_id,
                            "task_title": room.task.title
                        }
                        kafka_producer.send_event("user_stats", match_result_event)
                        # ----------------------------------------------

                        cache.set(
                            f"match:{room.match_id}:result",
                            {
                                "is_finished": True,
                                "winner_name": room.winner_name
                            },
                            timeout=60 * 10
                        )

                    TaskSubmission.objects.create(
                        user=user,
                        task=room.task,
                        code=code,
                        is_correct=passed_all
                    )

                    result = {
                        "is_correct": passed_all,
                        "tests": test_results
                    }

        return render(
            request,
            "game_room.html",
            {
                "username":username,
                "room": room,
                "result": result
            }
        )
    
class GameRoomResult(View):
    def get(self,request,match_id):
        cache_key = f"match:{match_id}:result"
        cached = cache.get(cache_key)
        if cached:
            return JsonResponse(cached)
        room = get_object_or_404(GameRoom, match_id = match_id)
        data = {
            "is_finished":room.is_finished,
            "winner_name":room.winner_name
        }
        if room.is_finished:
            cache.set(cache_key,data,timeout=600)
        return JsonResponse(data)