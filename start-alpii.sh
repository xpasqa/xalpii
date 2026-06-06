#!/bin/bash

echo "Starting Alpii infrastructure..."
docker compose -f docker-compose.infra.yml up -d

echo ""
echo "Cleaning frontend cache..."
cd /Users/pasqa/Code/aplii/frontend
rm -rf .next node_modules/.cache

echo ""
echo "Starting backend and frontend..."
cd /Users/pasqa/Code/aplii

trap "echo 'Stopping Alpii...'; kill 0" SIGINT

(cd backend && npm run start:dev) &
(cd frontend && npm run dev) &

wait
