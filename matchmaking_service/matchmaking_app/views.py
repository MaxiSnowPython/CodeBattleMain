from django.shortcuts import render
from django.views import View
from django.http import HttpResponseRedirect, HttpResponse

class MatchmakingPageView(View):
    def get(self, request):
        if not request.user or request.user.is_anonymous:
            return HttpResponseRedirect("http://auth.codebattle.local:8000/auth/login/")
        user = request.user

        print(user.username)

        return render(request, 'matchmaking.html', {'username': user.username, 'user_id': user.id})