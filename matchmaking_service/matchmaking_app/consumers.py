import json
import uuid
import os
import redis

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()


class MatchConsumer(AsyncWebsocketConsumer):

    @database_sync_to_async
    def get_user_from_token(self, token_str):
        try:
            if not token_str:
                return None
            access = AccessToken(token_str)
            user_id = int(access.get("user_id"))
            if not user_id:
                return None
            user, _ = User.objects.get_or_create(id=user_id)
            return user
        except Exception:
            return None

    async def connect(self):
        self.user = self.scope["user"]
        if self.user is None or self.user.is_anonymous:
            await self.close()
            return
        await self.accept()
        self.user_group = f"user_{self.user.id}"
        await self.channel_layer.group_add(self.user_group, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except Exception:
            return

        if data.get("action") != "find_match":
            return

        r = redis.Redis(host=os.environ.get("REDIS_HOST", "127.0.0.1"), port=int(os.environ.get("REDIS_PORT", 6379)), db=0)

        queue = r.lrange("match_queue", 0, -1)
        print(f"🔍 Очередь до добавления: {queue}")
        print(f"👤 Игрок: {self.user.id}")
        if str(self.user.id).encode() in queue:
            print("⚠️ Игрок уже в очереди")
            return

        r.lpush("match_queue", self.user.id)

        p1 = r.rpop("match_queue")
        p2 = r.rpop("match_queue")
        print(f"🎯 p1={p1}, p2={p2}")

        if not p1 or not p2:
            if p1:
                r.lpush("match_queue", p1)
            return

        p1 = p1.decode()
        p2 = p2.decode()

        if p1 == p2:
            r.lpush("match_queue", p1)
            return

        match_id = f"match_{p1}_{p2}_{uuid.uuid4().hex[:6]}"

        for player_id in [p1, p2]:
            await self.channel_layer.group_send(
                f"user_{player_id}",
                {
                    "type": "match_found",
                    "match_id": match_id
                }
            )

    async def match_found(self, event):
        game_url = f"http://game.codebattle.local:8002/game/{event['match_id']}"
        await self.send(text_data=json.dumps({
            "action": "redirect",
            "url": game_url
        }))

    async def disconnect(self, close_code):
        r = redis.Redis(host=os.environ.get("REDIS_HOST", "127.0.0.1"), port=int(os.environ.get("REDIS_PORT", 6379)), db=0)
        user = getattr(self, "user", None)
        if user:
            r.lrem("match_queue", 1, user.id)
            if hasattr(self, "user_group"):
                await self.channel_layer.group_discard(
                    self.user_group,
                    self.channel_name
                )