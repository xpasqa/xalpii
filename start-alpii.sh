#!/bin/bash
set -e

ROOT="/Users/pasqa/Code/aplii"

echo "Starting Alpii infra..."
cd "$ROOT"
docker compose -f docker-compose.infra.yml --env-file .env.local up -d

echo "Waiting for Postgres on localhost:5433..."
until nc -z localhost 5433; do
  sleep 1
done

echo "Freeing ports..."
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
lsof -ti :4000 | xargs kill -9 2>/dev/null || true

echo "Cleaning frontend cache..."
rm -rf "$ROOT/frontend/.next" "$ROOT/frontend/node_modules/.cache"

echo "Starting backend and frontend..."
trap "echo 'Stopping Alpii...'; kill 0" SIGINT

(cd "$ROOT/backend" && npm run start:dev) &
sleep 4

(cd "$ROOT/frontend" && npm run dev) &

echo ""
echo "Alpii starting:"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:4000/health"
echo ""
echo "Admin login:"
echo "admin@alpii.local / Password123!"
echo ""

wait
