import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hub_service.settings')
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from hub_app.consumers import ChatConsumer # Убедитесь, что путь правильный

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter([
            # Маршрут для сокета: ws://127.0.0.1:8000/ws/chat/имя_друга/
            path("ws/chat/<str:username>/", ChatConsumer.as_asgi()),
        ])
    ),
})