#!/bin/bash
tmux kill-session -t codebattle
docker compose -f /home/maxastya/Desktop/CodeBattleMain/docker-compose.yaml down