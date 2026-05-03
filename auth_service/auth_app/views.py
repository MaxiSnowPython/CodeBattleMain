from django.http import HttpResponseRedirect
from django.views.generic import FormView
from django.contrib.auth import login
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.views import LoginView

COOKIE_SETTINGS = {
    "httponly": True,
    "secure": False,
    "samesite": "Lax",
    "domain": ".codebattle.local",
}


def set_auth_cookies(response, user):
    refresh = RefreshToken.for_user(user)
    refresh["username"] = user.username
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    response.set_cookie("access_token", access_token, max_age=15 * 60, **COOKIE_SETTINGS)
    response.set_cookie("refresh_token", refresh_token, max_age=7 * 24 * 3600, **COOKIE_SETTINGS)


class RegView(FormView):
    template_name = "reg_form.html"
    form_class = UserCreationForm

    def form_valid(self, form):
        user = form.save()
        response = HttpResponseRedirect("http://match.codebattle.local:8001/match/hub/")
        set_auth_cookies(response, user)
        return response

    def form_invalid(self, form):
        return super().form_invalid(form)


class LogView(LoginView):
    template_name = "log_form.html"

    def form_valid(self, form):
        user = form.get_user()
        response = HttpResponseRedirect("http://match.codebattle.local:8001/match/hub/")
        set_auth_cookies(response, user)
        return response

    def form_invalid(self, form):
        return super().form_invalid(form)
