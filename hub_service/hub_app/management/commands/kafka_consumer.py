import json
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from confluent_kafka import Consumer, KafkaError
# Предположим, у тебя есть модель Profile с полем wins и losses
from ...models import UserProfile 

class Command(BaseCommand):
    help = 'Обновление статистики профилей из Kafka'

    def handle(self, *args, **options):
        conf = {
            'bootstrap.servers': 'localhost:9092',
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
                    winner_id = data["winner_id"]
                    loser_id = data["loser_id"]
                    if winner_id:
                        winner_profile, _ = UserProfile.objects.get_or_create(user_id=winner_id)
                        winner_profile.games_won += 1
                        winner_profile.games_played += 1 
                        winner_profile.save()

                    if loser_id:
                        loser_profile, _ = UserProfile.objects.get_or_create(user_id=loser_id)
                        loser_profile.games_played += 1 
                        loser_profile.save()

                    self.stdout.write(f"📈 Статистика обновлена: Победитель {winner_id}, Проигравший {loser_id}")

        except KeyboardInterrupt:
            pass
        finally:
            consumer.close()