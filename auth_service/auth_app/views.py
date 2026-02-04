from django.http import HttpResponseRedirect
from django.views.generic import FormView
from django.contrib.auth import login
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.views import LoginView


# Create your views here.

class RegView(FormView):
    template_name = "reg_form.html"
    form_class = UserCreationForm
    def form_valid(self, form):
        user = form.save()
        login(self.request,user)
        refresh = RefreshToken.for_user(user)
        refresh['username']=user.username
        access_token = str(refresh.access_token)
        print("Zaregalsa")
        response = HttpResponseRedirect("http://match.codebattle.local:8001/match/hub/")
        response.set_cookie(
            key = "access_token",
           # domain=".codebattle.local",
            value = access_token,
            httponly = True,
            samesite = "Lax"

        )
        return response
    def form_invalid(self, form):
        return FormView.form_invalid(self,form)
    
class LogView(LoginView):
    template_name = 'log_form.html'
    def form_valid(self, form):
        user = form.get_user()
        login(self.request,user)
        refresh = RefreshToken.for_user(user)
        refresh['username']=user.username
        access_token = str(refresh.access_token)
        print("Zaloginilsa")
        response = HttpResponseRedirect("http://match.codebattle.local:8001/match/hub/")
        response.set_cookie(
            key = "access_token",
            value = access_token,
            #domain=".codebattle.local",
            httponly = True,
            secure=False,
            samesite = "Lax",
            max_age=3600 * 24 * 7,

        )
        return response
    def form_invalid(self, form):
        return FormView.form_invalid(self,form)