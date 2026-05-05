# CodeBattle

A real-time competitive programming platform. Two players solve the same problem simultaneously — code runs inside an isolated sandbox, winner is determined by test results.

## Features

- Registration and login with JWT auth via httponly cookies
- Automatic opponent search via matchmaking queue
- Both players get redirected to the same game room once a match is found
- User code runs inside an isolated Docker container with memory and CPU limits
- Profile with match history, win stats, and a friends system
- Real-time chat between friends
- Global leaderboard

## Stack

| Technology | Purpose |
|---|---|
| Django | HTTP services |
| Django Channels + Daphne | WebSocket (matchmaking, chat) |
| Redis | Matchmaking queue, channel layer |
| Kafka | Stats update after match ends |
| Docker | Sandbox for code execution |
| JWT (SimpleJWT) | Cookie-based auth |
| Prometheus | Per-service metrics |

## Architecture

The project is split into 4 independent services:

```
auth_service        :8000  — registration, login
matchmaking_service :8001  — matchmaking (WebSocket)
game_service        :8002  — game room, sandbox, history
hub_service         :8003  — profile, friends, chat, leaderboard
```

Shared JWT auth lives in `shared/auth/` and is plugged into every service as middleware.

## Running locally

**Requirements:** Python 3.11+, Docker, tmux

```bash
git clone https://github.com/MaxiSnowPython/CodeBattleMain.git
cd CodeBattleMain

python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env

echo "127.0.0.1 auth.codebattle.local" | sudo tee -a /etc/hosts
echo "127.0.0.1 match.codebattle.local" | sudo tee -a /etc/hosts
echo "127.0.0.1 game.codebattle.local" | sudo tee -a /etc/hosts
echo "127.0.0.1 hub.codebattle.local" | sudo tee -a /etc/hosts

docker build -t game-service-image ./game_service/game_app/sandbox/

./start.sh
```

Open in browser: http://auth.codebattle.local:8000/auth/register/

Stop: `./stop.sh`

## Environment variables

All settings are stored in the `.env` file. See `.env.example` for reference.

| Variable | Description |
|---|---|
| `DJANGO_SECRET_KEY` | Django secret key |
| `DEBUG` | True/False |
| `SECURE_COOKIES` | True in production (HTTPS), False locally |
| `COOKIE_DOMAIN` | Cookie domain (.codebattle.local) |
| `AUTH_URL` / `MATCH_URL` / `GAME_URL` / `HUB_URL` | URL of each service |
| `REDIS_HOST` / `REDIS_PORT` | Redis connection |
| `KAFKA_BOOTSTRAP_SERVERS` | Kafka connection |

## Security

- JWT tokens in httponly cookies — not accessible via JS
- Access token lifetime: 15 minutes, refresh token: 7 days
- Middleware silently refreshes the access token using the refresh token
- Sandbox: 128MB memory limit, 0.5 CPU, no network, 64 process limit
- Code execution timeout: 3s total, 2s per test
