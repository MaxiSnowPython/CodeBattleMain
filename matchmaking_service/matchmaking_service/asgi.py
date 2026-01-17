"""
ASGI config for matchmaking_service project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""

import os
import django # Добавь этот импорт
from django.core.asgi import get_asgi_application

# 1. Сначала устанавливаем переменную настроек
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'matchmaking_service.settings')

# 2. Инициализируем Django
django.setup()

# 3. Создаем базовое HTTP приложение
django_asgi_app = get_asgi_application()

# 4. ТОЛЬКО ТЕПЕРЬ импортируем сокеты
from channels.routing import ProtocolTypeRouter, URLRouter
from matchmaking_app.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": URLRouter(
        websocket_urlpatterns
    ),
})