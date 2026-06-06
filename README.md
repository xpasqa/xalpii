# Alpii Travel

Initial Sprint 0 foundation for Alpii.

## Stack

- Frontend: Next.js
- Backend: NestJS
- Database: PostgreSQL
- Object storage: MinIO
- Cache/queue: Redis
- ORM: Prisma
- Package manager: npm

## Services

| Service | URL |
| --- | --- |
| Frontend | http://localhost:3000 |
| Backend | http://localhost:4000 |
| Backend health | http://localhost:4000/health |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |
| MinIO API | http://localhost:9000 |
| MinIO console | http://localhost:9001 |

## Hybrid Local Development

Use this mode when infrastructure runs in Docker but the backend runs manually on your machine.

1. Copy the local environment template:

   ```bash
   cp .env.local.example .env.local
   cp .env.local.example backend/.env
   ```

2. Start infrastructure only:

   ```bash
   docker compose -f docker-compose.infra.yml --env-file .env.local up -d
   ```

3. Install and run the backend:

   ```bash
   cd backend
   npm install
   npm run prisma:generate
   npm run start:dev
   ```

4. Check the backend health endpoint from another terminal:

   ```bash
   curl http://localhost:4000/health
   ```

Expected response:

```json
{
  "status": "ok",
  "service": "alpii-api",
  "database": "ok"
}
```

For hybrid mode, `DATABASE_URL` must use `localhost`, not `postgres`.

## Full Docker Development

Use this mode when backend and frontend also run inside Docker.

```bash
cp .env.docker.example .env
docker compose --env-file .env up --build
```

In full Docker mode, `DATABASE_URL` must use the Compose service host `postgres`.

## Environment Files

- `.env.local.example`: hybrid local mode, host machine reaches Docker infra through `localhost`.
- `.env.docker.example`: full Docker mode, services reach each other through Compose hostnames.
- `.env.example`: default Docker-compatible template kept for simple Compose usage.
- `backend/.env`: local backend env file. In hybrid mode, copy `.env.local.example` here.

The backend loads env files in this order when run manually from `backend/`:

```txt
backend/.env
backend/.env.local
.env.local
.env
```

This keeps `backend/.env` from being accidentally overridden by a root Docker-mode `.env`.

## MinIO Buckets

The `minio-init` service creates these buckets on startup:

- `public`: anonymously readable
- `private`: private

The MinIO console is available at http://localhost:9001 with the credentials from your env file.

## Frontend

Run the frontend manually:

```bash
cd frontend
npm install
npm run dev
```

Open the design system preview page:

```txt
http://localhost:3000/dev/design-system
```

The preview route uses mock data only and is intended for reviewing reusable UI, layout shells, and domain display components before product pages are built.

## Project Structure

```text
.
├── backend/
├── frontend/
├── docker/
│   └── minio/
├── docker-compose.yml
├── docker-compose.infra.yml
├── .env.example
├── .env.local.example
├── .env.docker.example
└── README.md
```
