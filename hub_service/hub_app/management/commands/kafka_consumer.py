import json
import os
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from confluent_kafka import Consumer, KafkaError

from ...models import UserProfile 

class Command(BaseCommand):
    help = 'Обновление статистики профилей из Kafka'

    def handle(self, *args, **options):
        conf = {
            'bootstrap.servers': os.environ.get("KAFKA_BOOTSTRAP_SERVERS", "localhost:29092"),
            'group.id': 'profile-update-group',
            'auto.offset.reset': 'earliest',
        }
        consumer = Consumer(conf)
        consumer.subscribe(['user_stats'])

        self.stdout.write(self.style.SUCCESS("📊 Воркер профилей запущен..."))

        try:
            while True:
                msg = consumer.poll(1.0)
                if msg is None: continue
                if msg.error():
                    continue

                data = json.loads(msg.value().decode('utf-8'))
                
                if data.get("event") == "match_finished":
                    winner_id = data.get("winner_id")
                    loser_id = data.get("loser_id")
                    winner_username = data.get("winner_username", f"user_{winner_id}")
                    loser_username = data.get("loser_username", f"user_{loser_id}")

                    if winner_id:
                        User.objects.get_or_create(id=winner_id, defaults={"username": winner_username})
                        winner_profile, _ = UserProfile.objects.get_or_create(user_id=winner_id)
                        winner_profile.games_won += 1
                        winner_profile.games_played += 1
                        winner_profile.save()

                    if loser_id:
                        User.objects.get_or_create(id=loser_id, defaults={"username": loser_username})
                        loser_profile, _ = UserProfile.objects.get_or_create(user_id=loser_id)
                        loser_profile.games_played += 1
                        loser_profile.save()

                    self.stdout.write(f"📈 Статистика обновлена: Победитель {winner_id}, Проигравший {loser_id}")

        except KeyboardInterrupt:
            pass
        finally:
            consumer.close()