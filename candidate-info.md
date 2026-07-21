# Candidate Information

| Field | Value |
|-------|-------|
| **Name** | Dhruv Jain |
| **Role** | Software Engineer |
| **Primary Technology Stack** | TypeScript, Node.js (Express), Next.js (App Router), PostgreSQL, Prisma |
| **Primary AI Tool Used** | Cursor |
| **Project Option Selected** | Support Ticket Management System (Core only) |
| **Assessment Start Date** | 14-07-26 |
| **Submission Date** | 21-07-26 |

---

## Project Summary

This repository contains a **Support Ticket Management System** built for the JS–AI Capability Exercise. It implements the **mandatory Core** scope only:

- Create, list, view, and update support tickets
- Enforced ticket status state machine (backend + frontend)
- Comments on tickets
- Keyword search and status filter
- PostgreSQL persistence with Prisma migrations and seed data
- Backend integration tests for the status machine

**Stretch features were intentionally excluded:** authentication, user CRUD UI, pagination, priority/assignee filters, Swagger/OpenAPI, Docker, CI, and health endpoint.

---

## Tools Used

| Category | Tool / Library |
|----------|----------------|
| AI assistant | Cursor |
| Frontend | Next.js 16, React, Tailwind CSS, TypeScript |
| Backend | Express 5, TypeScript, Zod |
| Database | PostgreSQL, Prisma 7 |
| Testing | Jest, Supertest |
| Dev runtime | `tsx` (backend), Next.js dev server (frontend) |

---

## Setup Summary

1. **Backend:** `cd backend` → copy `.env.example` to `.env` → set `DATABASE_URL` → `npm install` → `npx prisma migrate deploy` → `npm run db:seed` → `npm run dev`
2. **Frontend:** `cd frontend` → create `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1` → `npm install` → `npm run dev`
3. **Tests:** `cd backend` → `npm test` (requires reachable `DATABASE_URL`)

Full instructions: [README.md](README.md)

---

## Repository Layout (submission mapping)

The assessment guide suggests a flat `src/` layout. This project uses a practical split:

| Guide artifact | Location in this repo |
|----------------|----------------------|
| Application source | `backend/src/`, `frontend/src/` |
| Tests | `backend/tests/` |
| Schema / migrations / seed | `backend/prisma/` |
| Cursor workflow & prompt history | `tool-specific/cursor-workflow/` |
| Screenshots | `docs/screenshots/` |
| Lifecycle submission docs | Repository root (`*.md` files) |
