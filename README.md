# CodeBattle

Платформа для соревновательного программирования в реальном времени. Два игрока решают одну и ту же задачу, код выполняется в изолированном sandbox, победитель определяется по результатам тестов.

## Что умеет

- Регистрация и вход с JWT авторизацией через httponly cookies
- Автоматический поиск соперника через очередь (matchmaking)
- Редирект обоих игроков в одну игровую комнату при нахождении матча
- Выполнение кода пользователя в изолированном Docker контейнере с лимитами памяти и CPU
- Профиль с историей матчей, статистикой побед и системой друзей
- Чат между друзьями в реальном времени
- Таблица рейтинга

## Стек

| Технология | Для чего |
|---|---|
| Django | HTTP сервисы |
| Django Channels + Daphne | WebSocket (matchmaking, чат) |
| Redis | Очередь matchmaking, channel layer |
| Kafka | Обновление статистики после матча |
| Docker | Sandbox для выполнения кода |
| JWT (SimpleJWT) | Авторизация через cookies |
| Prometheus | Метрики каждого сервиса |

## Архитектура

Проект разбит на 4 независимых сервиса:

```
auth_service      :8000  — регистрация, вход
matchmaking_service :8001  — поиск матча (WebSocket)
game_service      :8002  — игровая комната, sandbox, история
hub_service       :8003  — профиль, друзья, чат, рейтинг
```

Общая JWT авторизация вынесена в `shared/auth/` и подключена во все сервисы как middleware.

## Запуск локально

**Требования:** Python 3.11+, Docker, tmux

```bash
git clone https://github.com/MaxiSnowPython/CodeBattleMain.git
cd CodeBattleMain

# Создать виртуальное окружение
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt  # или установить зависимости вручную

# Создать .env файл (скопировать из примера и заполнить)
cp .env.example .env

# Добавить домены в /etc/hosts
echo "127.0.0.1 auth.codebattle.local" | sudo tee -a /etc/hosts
echo "127.0.0.1 match.codebattle.local" | sudo tee -a /etc/hosts
echo "127.0.0.1 game.codebattle.local" | sudo tee -a /etc/hosts
echo "127.0.0.1 hub.codebattle.local" | sudo tee -a /etc/hosts

# Собрать Docker образ для sandbox
docker build -t game-service-image ./game_service/game_app/sandbox/

# Запустить всё одной командой
./start.sh
```

После запуска открыть: http://auth.codebattle.local:8000/auth/register/

Остановить: `./stop.sh`

## Переменные окружения

Все настройки хранятся в `.env` файле. Пример в `.env.example`.

| Переменная | Описание |
|---|---|
| `DJANGO_SECRET_KEY` | Секретный ключ Django |
| `DEBUG` | True/False |
| `SECURE_COOKIES` | True на проде (HTTPS), False локально |
| `COOKIE_DOMAIN` | Домен для куков (.codebattle.local) |
| `AUTH_URL` / `MATCH_URL` / `GAME_URL` / `HUB_URL` | URL каждого сервиса |
| `REDIS_HOST` / `REDIS_PORT` | Подключение к Redis |
| `KAFKA_BOOTSTRAP_SERVERS` | Подключение к Kafka |

## Безопасность

- JWT токены в httponly cookies — недоступны через JS
- Access token живёт 15 минут, refresh token 7 дней
- Middleware автоматически обновляет access token через refresh без участия клиента
- Sandbox: лимит памяти 128MB, CPU 0.5 ядра, нет сети, лимит процессов 64
- Таймаут выполнения кода: 3 сек на весь файл, 2 сек на один тест
