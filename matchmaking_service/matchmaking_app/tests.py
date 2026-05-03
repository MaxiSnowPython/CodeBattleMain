import json
from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from asgiref.sync import async_to_sync

from channels.testing import WebsocketCommunicator
from channels.routing import URLRouter
from django.urls import path

from matchmaking_app.consumers import MatchConsumer

User = get_user_model()

TEST_CHANNEL_LAYERS = {
    "default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}
}


def get_app():
    return URLRouter([path("ws/match/", MatchConsumer.as_asgi())])


@override_settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS)
class MatchConsumerTests(TestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(username="player1", password="pass")
        self.user2 = User.objects.create_user(username="player2", password="pass")

    # --- тест 1: матч не найден ---

    def test_match_not_found(self):
        """Один игрок в очереди — соперника нет, сообщение не приходит."""
        async_to_sync(self._match_not_found)()

    async def _match_not_found(self):
        mock_r = MagicMock()
        mock_r.lrange.return_value = []
        # rpop: первый раз возвращает самого игрока, второй — None (второго нет)
        mock_r.rpop.side_effect = [str(self.user1.id).encode(), None]

        with patch("matchmaking_app.consumers.redis.Redis", return_value=mock_r):
            comm = WebsocketCommunicator(get_app(), "/ws/match/")
            comm.scope["user"] = self.user1

            connected, _ = await comm.connect()
            self.assertTrue(connected)

            await comm.send_json_to({"action": "find_match"})

            # Никакого сообщения не должно прийти — матч не найден
            self.assertTrue(await comm.receive_nothing(timeout=0.3))

            await comm.disconnect()

    # --- тест 2: матч найден ---

    def test_match_found(self):
        """Два игрока в очереди — оба получают редирект на одну игру."""
        async_to_sync(self._match_found)()

    async def _match_found(self):
        mock_r = MagicMock()
        mock_r.lrange.return_value = []
        # rpop возвращает обоих игроков — матч состоится
        mock_r.rpop.side_effect = [
            str(self.user1.id).encode(),
            str(self.user2.id).encode(),
        ]

        with patch("matchmaking_app.consumers.redis.Redis", return_value=mock_r):
            app = get_app()

            comm1 = WebsocketCommunicator(app, "/ws/match/")
            comm1.scope["user"] = self.user1
            comm2 = WebsocketCommunicator(app, "/ws/match/")
            comm2.scope["user"] = self.user2

            connected1, _ = await comm1.connect()
            connected2, _ = await comm2.connect()
            self.assertTrue(connected1)
            self.assertTrue(connected2)

            # Второй игрок инициирует поиск — в очереди уже есть первый
            await comm2.send_json_to({"action": "find_match"})

            msg1 = await comm1.receive_json_from(timeout=1)
            msg2 = await comm2.receive_json_from(timeout=1)

            # Оба должны получить redirect на одну и ту же игру
            self.assertEqual(msg1["action"], "redirect")
            self.assertEqual(msg2["action"], "redirect")
            self.assertEqual(msg1["url"], msg2["url"])

            await comm1.disconnect()
            await comm2.disconnect()
