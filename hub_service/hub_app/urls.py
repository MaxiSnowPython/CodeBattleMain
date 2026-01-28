from django.urls import path
from .views import *


urlpatterns = [
    # Страница профиля
    path("", ProfileView.as_view(), name="profile"),

    # Друзья
    path("add-friend/", AddFriendView.as_view(), name="add_friend"),
    path("accept-friend/<int:friendship_id>/", AcceptFriendView.as_view(), name="accept_friend"),
    path("reject-friend/<int:friendship_id>/", RejectFriendView.as_view(), name="reject_friend"),
    path("remove-friend/<int:user_id>/", RemoveFriendView.as_view(), name="remove_friend"),

    # Обновление профиля
    path("update/", UpdateProfileView.as_view(), name="update_profile"),
]