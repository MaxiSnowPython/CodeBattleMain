from django.shortcuts import render
from django.http import HttpResponse
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import User
from django.views import View

# Create your views here.
class GameRoomView(View):
    def get(self,request,match_id):
        token_str = request.GET.get("token")
        if not token_str:
            return HttpResponse("No token pls go away",status = 403)
        try:
            # 2. Проверяем паспорт (токен) игрока
            access = AccessToken(token_str)
            user_id = access["user_id"]
            username = access.get("username", f"user_{user_id}")

            # 3. Синхронизируем юзера (твоя логика)
            user, created = User.objects.get_or_create(id=user_id)
            if user.username != username:
                user.username = username
                user.save() 


            return render(request, 'game_room.html', {
                'match_id': match_id,
                'user': user
            })

        except Exception as e:
            return HttpResponse(f"Ошибка авторизации: {e}", status=403)