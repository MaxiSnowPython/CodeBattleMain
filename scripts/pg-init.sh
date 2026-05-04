#!/bin/bash
set -e

for db in auth_db matchmaking_db game_db hub_db; do
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<EOF
CREATE DATABASE $db;
EOF
done
