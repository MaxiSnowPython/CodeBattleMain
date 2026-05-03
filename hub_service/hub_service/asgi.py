import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hub_service.settings')
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from hub_app.consumers import ChatConsumer
from shared.auth.jwt_ws_middleware import JWTWebSocketMiddleware

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTWebSocketMiddleware(
        URLRouter([
            path("ws/chat/<str:username>/", ChatConsumer.as_asgi()),
        ])
    ),
})