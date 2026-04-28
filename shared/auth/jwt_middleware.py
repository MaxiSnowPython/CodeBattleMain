from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model

User = get_user_model()

class JWTAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        token = request.COOKIES.get("access_token")
        if token:
            try:
                payload = AccessToken(token)
                user_id = payload.get("user_id")
                username = payload.get("username")
                if user_id:
                    # Создаём юзера локально если его нет
                    user, created = User.objects.get_or_create(
                        id=user_id,
                        defaults={'username': username or f'user_{user_id}'}
                    )
                    if not created and username and user.username != username:
                        user.username = username 
                        user.save()
                    request.user = user
                    request.user_id = user_id
            except Exception as e:
                print(f"❌ Ошибка токена: {e}")

        if not hasattr(request, 'user') or request.user is None:
            request.user = AnonymousUser()

        return self.get_response(request)



