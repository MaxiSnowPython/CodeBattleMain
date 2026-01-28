from django.shortcuts import render,redirect
from django.views.generic import FormView
from django.contrib.auth import login
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.views import LoginView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt


# Create your views here.
@method_decorator(csrf_exempt, name="dispatch")
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
        return redirect(f"http://127.0.0.1:8001/match/hub/?token={access_token}")
    def form_invalid(self, form):
        return FormView.form_invalid(self,form)
@method_decorator(csrf_exempt, name="dispatch")    
class LogView(LoginView):
    template_name = 'log_form.html'
    def form_valid(self, form):
        user = form.get_user()
        login(self.request,user)
        refresh = RefreshToken.for_user(user)
        refresh['username']=user.username
        access_token = str(refresh.access_token)
        print("Zaloginilsa")
        return redirect(f"http://127.0.0.1:8001/match/hub/?token={access_token}")
    def form_invalid(self, form):
        return FormView.form_invalid(self,form)