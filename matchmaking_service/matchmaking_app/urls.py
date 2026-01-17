from django.urls import path,include
from .views import *
urlpatterns = [
    path('hub/', MatchmakingPageView.as_view(), name='search_page'),
]