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
| PostgreSQL | localhost:5433 in hybrid mode, localhost:5432 inside Docker |
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
   npm run prisma:migrate -- --name sprint3_data_foundation
   npm run prisma:seed
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

For hybrid mode, `DATABASE_URL` must use `localhost`, not `postgres`. The current hybrid template uses:

```txt
DATABASE_URL=postgresql://alpii:alpii_password@localhost:5433/alpii?schema=public
```

## Backend Database Commands

Run these from `backend/` after Docker infra is running:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name sprint3_data_foundation
npm run prisma:seed
```

Useful optional commands:

```bash
npm run prisma:studio
npm run db:reset
```

The Sprint 3 seed creates:

- `admin@alpii.local` with role `SUPER_ADMIN`
- `partner@alpii.local` with role `PARTNER`
- `user@alpii.local` with role `USER`
- one approved demo partner profile
- 6 cities
- 6 categories
- 8 published demo activities with pricing, media, availability, and marketplace content

Sprint 4 replaces the original placeholder password hashes with bcrypt hashes for the demo credentials below.

## Sprint 4 Auth Foundation

Seeded demo credentials:

```txt
admin@alpii.local / Password123!
partner@alpii.local / Password123!
user@alpii.local / Password123!
```

Backend auth endpoints:

```txt
POST /auth/register
POST /auth/register-partner
POST /auth/login
GET /auth/me
POST /auth/logout
```

Run backend locally:

```bash
cd backend
npm run prisma:generate
npm run prisma:seed
npm run start:dev
```

Example login test:

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alpii.local","password":"Password123!"}'
```

Use the returned token for `/auth/me`:

```bash
curl http://localhost:4000/auth/me \
  -H "Authorization: Bearer <access-token>"
```

Frontend auth routes:

```txt
http://localhost:3000/login
http://localhost:3000/register
http://localhost:3000/register/partner
http://localhost:3000/dashboard
http://localhost:3000/dashboard/partner
http://localhost:3000/dashboard/admin
```

Sprint 4 only adds authentication and route protection foundations. Admin CRUD, partner activity submission, booking, and payment flows are intentionally not implemented yet.

## Full Docker Development

Use this mode when backend and frontend also run inside Docker.

```bash
cp .env.docker.example .env
docker compose --env-file .env up --build
```

In full Docker mode, `DATABASE_URL` must use the Compose service host `postgres`.

## Database Connection Troubleshooting

The local hybrid setup expects Docker PostgreSQL to be reachable from the host on `localhost:5433`. Docker still maps that host port to PostgreSQL's container port `5432`.

Use this backend connection string in `backend/.env`:

```txt
DATABASE_URL=postgresql://alpii:alpii_password@localhost:5433/alpii?schema=public
```

If Prisma reports `P1001: Can't reach database server`, start or inspect the infra containers:

```bash
docker compose -f docker-compose.infra.yml --env-file .env.local up -d
docker compose -f docker-compose.infra.yml ps
```

If Prisma reports `P1010: User was denied access on the database`, compare `backend/.env` with `docker-compose.infra.yml` and `.env.local`. These values must agree:

```txt
POSTGRES_USER=alpii
POSTGRES_PASSWORD=alpii_password
POSTGRES_DB=alpii
POSTGRES_PORT=5433
```

This project uses `5433` for hybrid mode because macOS or another local PostgreSQL instance can already occupy `127.0.0.1:5432`. If you intentionally switch back to `5432`, stop the local PostgreSQL service first and update `POSTGRES_PORT` and every `DATABASE_URL` reference consistently. Do not leave mixed `5432` and `5433` values.

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

For a clean local dev start after cache issues:

```bash
cd frontend
npm run dev:clean
```

Open the design system preview page:

```txt
http://localhost:3000/dev/design-system
```

The preview route uses mock data only and is intended for reviewing reusable UI, layout shells, and domain display components before product pages are built.

### Frontend Dev Cache Notes

Do not run `npm run build` while `npm run dev` is still running. Stop the dev server first, then run the production build verification.

Recommended production build check:

```bash
cd frontend
npm run clean
npm run build
```

After a production build check, clean again before restarting local development:

```bash
cd frontend
npm run clean
npm run dev
```

If local development fails with a missing vendor chunk such as:

```txt
ENOENT: no such file or directory, open frontend/.next/server/vendor-chunks/lucide-react.js
```

reset the local Next.js cache:

```bash
cd frontend
npm run clean
npm run dev
```

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
