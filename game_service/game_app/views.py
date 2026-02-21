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
from django.utils import timezone
from django.db.models import Q
# Create your views here.

@method_decorator(csrf_exempt, name="dispatch")
class GameRoomView(View):
    def get(self,request,match_id):
        token_str = request.COOKIES.get("access_token")
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
                        
            parts = match_id.split("_")
            if len(parts) < 3:
                return HttpResponse("Invalid Match ID", status=400)

            p1_id = parts[1]
            p2_id = parts[2]

            try:
                player1 = User.objects.get(id=p1_id)
                player2 = User.objects.get(id=p2_id)
            except User.DoesNotExist:
                return HttpResponse("❌ Один из игроков не найден в базе игрового сервиса", status=404)
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
        token = request.COOKIES.get("access_token")
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
                        room.finished_at = timezone.now()
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
                        print(f"🚀 Отправляем в Kafka: winner={winner_id}, loser={loser_id}")
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
                        "results": test_results
                    }

        return render(
            request,
            "game_room.html",
            {
                "match_id": match_id, # Чтобы JS не выдавал /game/status//
                "user": user, 
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


class MatchHistoryView(View):
    def get(self, request):
        token_str = request.COOKIES.get("access_token")
        if not token_str:
            return HttpResponse("No token pls go away", status=403)
        
        try:
            access = AccessToken(token_str)
            user_id = access["user_id"]
            username = access.get("username", f"user_{user_id}")
            
            # Получаем или создаем пользователя
            user, created = User.objects.get_or_create(id=user_id)
            if user.username != username:
                user.username = username
                user.save()
            
            # Получаем ВСЕ матчи пользователя (оптимизация N+1)
            matches = GameRoom.objects.filter(
                Q(player1=user) | Q(player2=user)
            ).select_related(
                'player1', 'player2', 'task'
            ).order_by('-id')  # Новые сверху
            
            # Формируем данные для истории
            match_history = []
            total_wins = 0
            total_losses = 0
            
            for match in matches:
                # Определяем кто был противником
                if match.player1 and match.player1.id == user.id:
                    opponent = match.player2
                    is_player1 = True
                else:
                    opponent = match.player1
                    is_player1 = False
                
                # Определяем результат
                if match.is_finished:
                    if match.winner_name == user.username:
                        result = 'win'
                        total_wins += 1
                    else:
                        result = 'loss'
                        total_losses += 1
                else:
                    result = 'unfinished'
                
                match_history.append({
                    'match_id': match.match_id,
                    'opponent': opponent.username if opponent else 'Бот',
                    'task_title': match.task.title if match.task else 'Неизвестная задача',
                    'result': result,
                    'is_finished': match.is_finished,
                    'created_at': match.created_at if hasattr(match, 'created_at') else None,
                    'finished_at': match.finished_at if hasattr(match, 'finished_at') else None,
                })
            
            # Статистика
            total_matches = total_wins + total_losses
            win_rate = round((total_wins / total_matches * 100), 1) if total_matches > 0 else 0
            
            context = {
                'username': user.username,
                'match_history': match_history,
                'total_matches': total_matches,
                'total_wins': total_wins,
                'total_losses': total_losses,
                'win_rate': win_rate,
            }
            
            return render(request, 'match_history.html', context)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return HttpResponse(f"Ошибка: {e}", status=403)
