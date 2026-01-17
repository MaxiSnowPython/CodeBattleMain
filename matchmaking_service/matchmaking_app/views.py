from django.shortcuts import render
from django.views import View
# Create your views here.
class MatchmakingPageView(View):
    def get(self, request):
        token = request.GET.get("token")
        return render(request, 'matchmaking.html', {'token': token})