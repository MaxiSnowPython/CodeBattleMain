import json
from confluent_kafka import Producer
from django.conf import settings

class KafkaProducerService:
    def __init__(self):
        conf = {
            'bootstrap.servers': 'localhost:29092', # Для Docker используй kafka:9092 если Django тоже в докере
            'client.id': 'django-backend'
        }
        self.producer = Producer(conf)

    def send_event(self, topic, data):
        payload = json.dumps(data).encode('utf-8')
        try:
            self.producer.produce(topic, value=payload)
            self.producer.flush() # Принудительная отправка
            print(f"📡 Событие отправлено в {topic}: {data}")
        except Exception as e:
            print(f"❌ Ошибка отправки в Kafka: {e}")

# Создаем один экземпляр для переиспользования
kafka_producer = KafkaProducerService()