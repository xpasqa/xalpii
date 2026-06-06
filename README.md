# Alpii Travel

Initial Dockerized project foundation for Alpii.

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

## Setup

1. Copy the environment example:

   ```bash
   cp .env.example .env
   ```

2. Start the full stack:

   ```bash
   docker compose --env-file .env up --build
   ```

3. Check the backend health endpoint:

   ```bash
   curl http://localhost:4000/health
   ```

## MinIO Buckets

The `minio-init` service creates these buckets on startup:

- `public`: anonymously readable
- `private`: private

The MinIO console is available at http://localhost:9001 with the credentials from `.env`.

## Local Development

Install and run the backend:

```bash
cd backend
npm install
npm run prisma:generate
npm run start:dev
```

Install and run the frontend:

```bash
cd frontend
npm install
npm run dev
```

When running outside Docker, set `DATABASE_URL` to a host-reachable PostgreSQL URL, for example:

```bash
DATABASE_URL=postgresql://alpii:alpii_password@localhost:5432/alpii?schema=public
```

## Project Structure

```text
.
├── backend/
├── frontend/
├── docker/
│   └── minio/
├── docker-compose.yml
├── .env.example
└── README.md
```
# xalpii
