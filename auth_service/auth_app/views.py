from django.shortcuts import render,redirect
from django.views.generic import FormView
from django.contrib.auth import login
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
# Create your views here.

class RegView(FormView):
    template_name = ""
    form_class = UserCreationForm
    def form_valid(self, form):
        user = form.save()
        login(self.request,user)
        refresh = RefreshToken.for_user(user)
        refresh['username']=user.username
        access_token = str(refresh.access_token)

        return redirect(f"http://127.0.0.1:8001/match/hub/?token={access_token}")
    def form_invalid(self, form):
        return super.form_invalid(form)