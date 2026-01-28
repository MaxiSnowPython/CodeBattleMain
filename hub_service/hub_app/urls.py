from django.urls import path
from .views import *


urlpatterns = [
    path("", ProfileView.as_view(), name="profile"),
    path("add-friend/", AddFriendView.as_view(), name="add_friend"),
    path("accept-friend/<int:friendship_id>/", AcceptFriendView.as_view(), name="accept_friend"),
    path("reject-friend/<int:friendship_id>/", RejectFriendView.as_view(), name="reject_friend"),
    path("remove-friend/<int:user_id>/", RemoveFriendView.as_view(), name="remove_friend"),
    path("update/", UpdateProfileView.as_view(), name="update_profile"),
    path('chat/history/<str:username>/', ChatHistoryView.as_view(), name='chat_history'),
]