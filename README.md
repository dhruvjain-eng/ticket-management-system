# Support Ticket Management System

Core assessment implementation: Express + Prisma + PostgreSQL backend, Next.js frontend.

## Prerequisites

- Node.js 20+
- PostgreSQL database

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL

npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Backend runs at **http://localhost:3001** (API base: `/api/v1`).

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local

npm install
npm run dev
```

Frontend runs at **http://localhost:3000**.

## Environment variables

| Variable | Package | Description |
|----------|---------|-------------|
| `DATABASE_URL` | backend | PostgreSQL connection string |
| `PORT` | backend | API port (default `3001`) |
| `CORS_ORIGIN` | backend | Frontend origin (default `http://localhost:3000`) |
| `NEXT_PUBLIC_API_URL` | frontend | Backend API URL (default `http://localhost:3001/api/v1`) |

## Tests

```bash
cd backend
npm test
```

Integration tests cover the ticket status state machine (valid transitions, invalid transitions, not-found, invalid enum, idempotent same-status).

## Acting user pattern

There is no authentication in Core. Use the **Acting as** selector in the header to pre-fill the creator on new tickets and the author on comments. Selection is stored in `localStorage`.

## Project structure

```
backend/     Express API, Prisma schema, migrations, seed, integration tests
frontend/    Next.js App Router UI
tool-specific/cursor-workflow/   Assessment planning artifacts
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/users` | List users |
| GET | `/api/v1/users/:id` | Get user by ID |
| GET | `/api/v1/tickets` | List tickets (`?search=`, `?status=`) |
| POST | `/api/v1/tickets` | Create ticket |
| GET | `/api/v1/tickets/:id` | Ticket detail with comments |
| PATCH | `/api/v1/tickets/:id` | Update ticket fields |
| PATCH | `/api/v1/tickets/:id/status` | Status transition |
| POST | `/api/v1/tickets/:id/comments` | Add comment |
