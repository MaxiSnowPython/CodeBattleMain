from django.shortcuts import render
from django.views import View
from rest_framework_simplejwt.tokens import AccessToken, TokenError
# Create your views here.
class MatchmakingPageView(View):
    def get(self, request):
        token = request.GET.get("token")
        access = AccessToken(token)
        user_id = access["user_id"]
        username = access.get("username")
        return render(request, 'matchmaking.html', {'token': token,'username': username})