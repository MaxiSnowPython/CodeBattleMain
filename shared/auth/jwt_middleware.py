from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model

User = get_user_model()

COOKIE_SETTINGS = {
    "httponly": True,
    "secure": False,
    "samesite": "Lax",
    "domain": ".codebattle.local",
}


class JWTAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        new_access_token = None

        token = request.COOKIES.get("access_token")
        if token:
            try:
                self._attach_user(request, AccessToken(token))
            except TokenError:
                # access протух — пробуем refresh
                refresh_str = request.COOKIES.get("refresh_token")
                if refresh_str:
                    try:
                        refresh = RefreshToken(refresh_str)
                        new_access_token = str(refresh.access_token)
                        self._attach_user(request, AccessToken(new_access_token))
                    except TokenError:
                        pass  # refresh тоже невалиден — останется AnonymousUser

        if not hasattr(request, "user") or request.user is None:
            request.user = AnonymousUser()

        response = self.get_response(request)

        if new_access_token:
            response.set_cookie(
                "access_token",
                new_access_token,
                max_age=15 * 60,
                **COOKIE_SETTINGS,
            )

        return response

    def _attach_user(self, request, payload):
        user_id = payload.get("user_id")
        username = payload.get("username")
        if not user_id:
            return
        user, created = User.objects.get_or_create(
            id=user_id,
            defaults={"username": username or f"user_{user_id}"},
        )
        if not created and username and user.username != username:
            user.username = username
            user.save()
        request.user = user
        request.user_id = user_id
