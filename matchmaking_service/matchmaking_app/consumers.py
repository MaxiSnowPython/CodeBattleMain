import json
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import User
from channels.db import database_sync_to_async
import redis
from urllib.parse import parse_qs
class MatchConsumer(AsyncWebsocketConsumer):
        
    @database_sync_to_async
    def get_or_create_user_from_token(self, token_str):

        try:
            access = AccessToken(token_str)
            user_id = access["user_id"]
            username = access.get("username", f"user_{user_id}")

            user, created = User.objects.get_or_create(id=user_id)
            if user.username != username:
                user.username = username
                user.save()

            if created:
                user.set_password("gey123e")
                user.save()
                
            return user
        except Exception:
            return None
    
    async def connect(self):
        query = parse_qs(self.scope["query_string"].decode())
        self.token_str = query.get("token", [None])[0]
        self.user = await self.get_or_create_user_from_token(self.token_str)
        if self.user is None:
            await self.close()
        else:
            await self.accept()
            self.user_group = f"user_{self.user.id}"
            await self.channel_layer.group_add(self.user_group, self.channel_name)
        
    
    async def receive(self,text_data):
        r = redis.Redis(host='127.0.0.1', port=6379, db=0)
        r.lpush("match_queue", self.user.id)
        if r.llen("match_queue") >= 2:
            p1 = r.rpop("match_queue").decode()
            p2 = r.rpop("match_queue").decode()
            match_id = f"match_{p1}_{p2}"

            for player_id in [p1,p2]:
                await self.channel_layer.group_send(
                    f"user_{player_id}",
                    {
                        "type": "match_notification",
                        "match_id": match_id
                    }
                )
    async def match_notification(self,event):
        game_url = f"http://game.codebattle.local:8002/game/{event['match_id']}/?token={self.token_str}"
        await self.send(text_data=json.dumps({
            "action": "redirect",
            "url": game_url
        }))
    async def disconnect(self, close_code):
        r = redis.Redis(host='127.0.0.1', port=6379, db=0)
        user = getattr(self, 'user', None)
        
        if user and hasattr(user, 'id'):
            r.lrem("match_queue", 1, user.id)
            if hasattr(self, 'user_group'):
                await self.channel_layer.group_discard(self.user_group, self.channel_name)
