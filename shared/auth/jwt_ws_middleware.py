# shared/auth/jwt_ws_middleware.py
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

User = get_user_model()

@database_sync_to_async
def get_user_from_token(token_str):
    try:
        access = AccessToken(token_str)
        user_id = access.get("user_id")
        username = access.get("username")
        if not user_id:
            return AnonymousUser()
        user, created = User.objects.get_or_create(
            id=user_id,
            defaults={'username': username or f'user_{user_id}'}
        )
        if not created and username and user.username != username:
            user.username = username
            user.save()
        return user
    except Exception:
        return AnonymousUser()

class JWTWebSocketMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        headers = dict(scope.get("headers", []))
        cookie_header = headers.get(b"cookie", b"").decode()
        
        cookies = {}
        for chunk in cookie_header.split(";"):
            chunk = chunk.strip()
            if "=" in chunk:
                key, val = chunk.split("=", 1)
                cookies[key.strip()] = val.strip()
        
        token = cookies.get("access_token")
        scope["user"] = await get_user_from_token(token) if token else AnonymousUser()
        
        return await super().__call__(scope, receive, send)