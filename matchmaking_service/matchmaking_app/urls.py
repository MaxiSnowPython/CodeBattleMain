from django.urls import path,include
from .views import *
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('hub/', MatchmakingPageView.as_view(), name='search_page'),
]
