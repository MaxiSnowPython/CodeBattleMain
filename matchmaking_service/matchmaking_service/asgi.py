import os
import sys
import django
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'matchmaking_service.settings')

# asgi.py -> matchmaking_service -> matchmaking_service -> CodeBattleMain
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, BASE_DIR)

django.setup()

django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from matchmaking_app.routing import websocket_urlpatterns
from shared.auth.jwt_ws_middleware import JWTWebSocketMiddleware

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTWebSocketMiddleware(
        URLRouter(websocket_urlpatterns)
    ),
})