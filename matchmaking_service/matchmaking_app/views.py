from django.shortcuts import render
from django.views import View
from rest_framework_simplejwt.tokens import AccessToken, TokenError
from django.http import HttpResponseRedirect
# Create your views here.
class MatchmakingPageView(View):
    def get(self, request):
        token = request.COOKIES.get("access_token")
        print("COOKIES:", request.COOKIES)
        access = AccessToken(token)
        username = access.get("username")
        return render(request, 'matchmaking.html', {'token': token,'username': username})
    
