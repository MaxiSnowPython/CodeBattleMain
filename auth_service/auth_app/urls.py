from django.urls import path,include
from .views import RegView,LogView


urlpatterns = [
    path('register/',RegView.as_view(), name="register"),
    path('login/',LogView.as_view(),name="login"),

]