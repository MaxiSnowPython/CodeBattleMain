from django.urls import path
from .views import *
urlpatterns = [
    
    path('<str:match_id>/', GameRoomView.as_view(), name='game_room'),
]
