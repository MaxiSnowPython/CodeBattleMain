from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model

User = get_user_model()


def _parse_cookies(scope):
    headers = dict(scope.get("headers", []))
    cookie_header = headers.get(b"cookie", b"").decode()
    cookies = {}
    for chunk in cookie_header.split(";"):
        chunk = chunk.strip()
        if "=" in chunk:
            key, val = chunk.split("=", 1)
            cookies[key.strip()] = val.strip()
    return cookies


@database_sync_to_async
def get_user_from_cookies(cookies):
    access_str = cookies.get("access_token")
    refresh_str = cookies.get("refresh_token")

    # пробуем access_token
    if access_str:
        try:
            payload = AccessToken(access_str)
            return _user_from_payload(payload)
        except TokenError:
            pass  # протух — пробуем refresh

    # пробуем refresh_token
    if refresh_str:
        try:
            refresh = RefreshToken(refresh_str)
            payload = AccessToken(str(refresh.access_token))
            return _user_from_payload(payload)
        except TokenError:
            pass

    return AnonymousUser()


def _user_from_payload(payload):
    user_id = payload.get("user_id")
    username = payload.get("username")
    if not user_id:
        return AnonymousUser()
    user, created = User.objects.get_or_create(
        id=user_id,
        defaults={"username": username or f"user_{user_id}"},
    )
    if not created and username and user.username != username:
        user.username = username
        user.save()
    return user


class JWTWebSocketMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        cookies = _parse_cookies(scope)
        scope["user"] = await get_user_from_cookies(cookies)
        return await super().__call__(scope, receive, send)
