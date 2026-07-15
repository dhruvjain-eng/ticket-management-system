# Support Ticket Management System

A full-stack support ticket application for creating, tracking, and updating tickets with a enforced status workflow, comments, and server-side search and filtering.

**Stack:** Next.js (App Router) · Express · PostgreSQL · Prisma · TypeScript

This repository implements the **Core** assessment scope. Authentication, user management UI, pagination, and Docker are not included.

---

## Project overview

The system lets support agents:

- Create tickets with title, description, priority, creator, and optional assignee
- View and search tickets, and filter by status
- Open ticket details, edit fields, and transition status through a defined state machine
- Add comments to tickets

Data is stored in PostgreSQL. The backend exposes a REST API; the frontend is a separate Next.js app that consumes it.

There is no login. An **Acting as** selector in the header picks which seeded user represents the current operator for create/comment forms (stored in `localStorage`).

### Status workflow

| Current status | Allowed next statuses |
|----------------|----------------------|
| `OPEN` | `IN_PROGRESS`, `CANCELLED` |
| `IN_PROGRESS` | `RESOLVED`, `CANCELLED` |
| `RESOLVED` | `CLOSED` |
| `CLOSED` | *(terminal)* |
| `CANCELLED` | *(terminal)* |

Invalid transitions are rejected by the API with `INVALID_STATUS_TRANSITION`.

---

## Architecture

Three-tier, decoupled layout:

```
┌─────────────────────┐     HTTP/JSON      ┌─────────────────────┐
│  Next.js Frontend   │ ◄────────────────► │  Express API        │
│  localhost:3000     │                    │  localhost:3001     │
└─────────────────────┘                    └──────────┬──────────┘
                                                    │
                                                    ▼
                                         ┌─────────────────────┐
                                         │  PostgreSQL         │
                                         └─────────────────────┘
```

| Layer | Responsibility |
|-------|----------------|
| **Frontend** | UI, forms, loading/error states, API client |
| **Backend** | REST API, Zod validation, status machine, Prisma data access |
| **Database** | Users, tickets, comments |

**API base path:** `http://localhost:3001/api/v1`

**Response shape:** `{ "data": ... }` on success; `{ "error": { "code", "message", "details?" } }` on failure.

---

## Folder structure

```
ticket-management-system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Data models and enums
│   │   ├── seed.ts                # Seed users, tickets, comments
│   │   └── migrations/            # SQL migrations
│   ├── src/
│   │   ├── app.ts                 # Express app (exported for tests)
│   │   ├── server.ts              # HTTP entry point
│   │   ├── config/                # Environment config
│   │   ├── controllers/           # Request handlers
│   │   ├── services/              # Business logic (incl. status machine)
│   │   ├── routes/                # API routes
│   │   ├── middleware/            # Validation, errors, not-found
│   │   ├── validators/            # Zod schemas
│   │   └── lib/                   # Prisma client
│   ├── tests/
│   │   └── integration/           # Status machine integration tests
│   └── .env.example
│
├── frontend/
│   └── src/
│       ├── app/                   # Next.js routes (App Router)
│       ├── components/            # UI and ticket components
│       ├── hooks/                 # Data-fetching hooks
│       ├── lib/                   # API client, errors, labels
│       ├── context/               # Acting user context
│       └── types/                 # Frontend DTO types
│
├── tool-specific/cursor-workflow/   # Planning and acceptance docs
└── README.md
```

---

## Prerequisites

- **Node.js** 20 or later
- **npm**
- **PostgreSQL** (local or hosted, e.g. Neon)

---

## Setup

Clone the repository, then configure and install each app separately.

### Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set `DATABASE_URL` to your PostgreSQL connection string.

```bash
npm install
```

### Frontend

```bash
cd frontend
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

```bash
npm install
```

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `PORT` | No | `3001` | API server port |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Allowed frontend origin |
| `NODE_ENV` | No | `development` | Runtime environment |

Example:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ticket_management"
PORT=3001
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL (include `/api/v1`) |

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

Do not commit `.env` or `.env.local` files with real credentials.

---

## Database migration

From the `backend` directory, apply migrations to create tables:

```bash
cd backend
npx prisma migrate deploy
```

For local development with migration history updates:

```bash
npx prisma migrate dev
```

Schema and models are defined in `backend/prisma/schema.prisma`.

---

## Seed

Populate the database with sample users, tickets, and comments:

```bash
cd backend
npm run db:seed
```

The seed script (`backend/prisma/seed.ts`) creates:

- 5 users (mixed `AGENT` and `ADMIN` roles)
- 10 sample tickets across statuses
- 15 comments

Re-running the seed clears existing data in those tables before inserting.

---

## Run backend

Development (with hot reload):

```bash
cd backend
npm run dev
```

API available at **http://localhost:3001**
Base path: **http://localhost:3001/api/v1**

Production build:

```bash
npm run build
npm start
```

### API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/users` | List seeded users |
| `GET` | `/users/:id` | Get one user |
| `GET` | `/tickets` | List tickets (`?search=`, `?status=`) |
| `POST` | `/tickets` | Create ticket (status always `OPEN`) |
| `GET` | `/tickets/:id` | Ticket detail with comments |
| `PATCH` | `/tickets/:id` | Update title, description, priority, assignee |
| `PATCH` | `/tickets/:id/status` | Status transition |
| `POST` | `/tickets/:id/comments` | Add comment |

---

## Run frontend

Development:

```bash
cd frontend
npm run dev
```

UI available at **http://localhost:3000**

- `/` redirects to `/tickets`
- `/tickets` — ticket list with search and status filter
- `/tickets/new` — create ticket
- `/tickets/[id]` — detail, edit, status transitions, comments

Production build:

```bash
npm run build
npm start
```

---

## Run tests

Integration tests live in the backend and cover the ticket status state machine against a real database.

```bash
cd backend
npm test
```

`DATABASE_URL` must be set (via `.env` or `.env.test`). Tests run `prisma migrate deploy` on startup and clean up tickets they create.

Coverage includes:

- Valid transitions (`OPEN` → `IN_PROGRESS`, etc.)
- Invalid transitions (400 `INVALID_STATUS_TRANSITION`)
- Not found (404)
- Invalid status enum (400 `VALIDATION_ERROR`)
- Idempotent same-status transition

---

## Screenshots

### Ticket List

![Ticket List](docs/screenshots/ticket-list.png)

*Search tickets, filter by status, and view priority badges.*

---

### Create Ticket

![Create Ticket](docs/screenshots/create-ticket.png)

*Create a new support ticket with validation.*

---

### Ticket Details

![Ticket Details](docs/screenshots/ticket-details.png)

*View and edit ticket information with comments.*

---

### Status Transition

![Status Transition](docs/screenshots/status-transition.png)

*Transition tickets through the enforced workflow.*

---

### Comments

![Comments](docs/screenshots/comments.png)

*Add and view comments for a ticket.*

---

## Acting user pattern

Because there is no authentication, the header **Acting as** dropdown selects which seeded user is treated as the operator. That choice:

- Pre-fills **Created By** on the create-ticket form
- Pre-fills **Author** on the comment form
- Persists in `localStorage` between visits

You can override the selection on each form before submitting.

---

## License

ISC (per package `package.json` files).
