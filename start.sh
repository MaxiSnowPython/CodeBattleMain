#!/bin/bash

BASE="/home/maxastya/Desktop/CodeBattleMain"
PY="$BASE/venv/bin/python"
DAPHNE="$BASE/venv/bin/daphne"

cd $BASE && docker compose up -d
echo "Ждём пока Kafka запустится..."
sleep 8

tmux kill-session -t codebattle 2>/dev/null
tmux new-session -d -s codebattle

tmux rename-window -t codebattle:0 'docker'
tmux send-keys -t codebattle:0 "cd $BASE && docker compose logs -f" Enter

tmux new-window -t codebattle -n 'auth'
tmux send-keys -t codebattle:1 "cd $BASE/auth_service && $PY manage.py runserver 8000" Enter

tmux new-window -t codebattle -n 'match'
tmux send-keys -t codebattle:2 "cd $BASE/matchmaking_service && $DAPHNE -p 8001 matchmaking_service.asgi:application" Enter

tmux new-window -t codebattle -n 'game'
tmux send-keys -t codebattle:3 "cd $BASE/game_service && $DAPHNE -p 8002 game_service.asgi:application" Enter

tmux new-window -t codebattle -n 'hub'
tmux send-keys -t codebattle:4 "cd $BASE/hub_service && $DAPHNE -p 8003 hub_service.asgi:application" Enter

tmux new-window -t codebattle -n 'kafka'
tmux send-keys -t codebattle:5 "cd $BASE/hub_service && $PY manage.py kafka_consumer" Enter

tmux attach -t codebattle