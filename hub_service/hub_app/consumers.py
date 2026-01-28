import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from .models import Message

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Получаем токен из query параметров: ws://.../?token=xyz
        query_string = self.scope['query_string'].decode()
        token = None
        if 'token=' in query_string:
            token = query_string.split('token=')[1]

        try:
            # Проверка токена
            access = AccessToken(token)
            user_id = access["user_id"]
            self.user = await self.get_user(user_id)
            
            # Имя комнаты создаем на основе ID двух пользователей (всегда одинаково для пары)
            self.other_username = self.scope['url_route']['kwargs']['username']
            self.other_user = await self.get_user_by_name(self.other_username)
            
            ids = sorted([self.user.id, self.other_user.id])
            self.room_name = f"chat_{ids[0]}_{ids[1]}"
            self.room_group_name = f"group_{self.room_name}"

            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
            
        except Exception as e:
            print(f"Connection error: {e}")
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']

        # Сохраняем в БД
        await self.save_message(self.user, self.other_user, message)

        # Отправляем в группу
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': self.user.username
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender': event['sender']
        }))

    @database_sync_to_async
    def get_user(self, user_id):
        return User.objects.get(id=user_id)

    @database_sync_to_async
    def get_user_by_name(self, username):
        return User.objects.get(username=username)

    @database_sync_to_async
    def save_message(self, sender, receiver, content):
        return Message.objects.create(sender=sender, receiver=receiver, content=content)