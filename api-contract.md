# API Contract

**Base URL:** `http://localhost:3001/api/v1`  
**Content-Type:** `application/json`  
**Scope:** Core endpoints only (no auth headers required)

---

## Common Envelopes

### Success
```json
{ "data": <payload> }
```

### Error
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": [{ "field": "fieldName", "message": "..." }]
  }
}
```

### Error codes (implemented)

| Code | HTTP | When |
|------|------|------|
| `VALIDATION_ERROR` | 400 | Zod or request validation failure |
| `INVALID_STATUS_TRANSITION` | 400 | Disallowed status change |
| `NOT_FOUND` | 404 | Ticket or user not found |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Endpoint: List Users

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/users` |
| **Purpose** | Return all seeded users (for dropdowns) |

### Response `200`
```json
{
  "data": [
    { "id": "uuid", "name": "Jane Agent", "email": "jane@example.com", "role": "AGENT" }
  ]
}
```

---

## Endpoint: Get User

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/users/:id` |
| **Purpose** | Return one seeded user |

### Response `200`
```json
{ "data": { "id": "uuid", "name": "...", "email": "...", "role": "AGENT" } }
```

### Error `404`
`NOT_FOUND` — user does not exist.

---

## Endpoint: List Tickets

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/tickets` |
| **Purpose** | List tickets with optional search and status filter |

### Query parameters

| Param | Type | Description |
|-------|------|-------------|
| `search` | string (optional) | Case-insensitive match on title or description |
| `status` | enum (optional) | `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `CANCELLED` |

### Response `200`
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Cannot log in",
      "description": "...",
      "priority": "HIGH",
      "status": "OPEN",
      "assignedTo": { "id": "uuid", "name": "Jane Agent" },
      "createdBy": { "id": "uuid", "name": "Admin User" },
      "createdAt": "2026-07-14T00:00:00.000Z",
      "updatedAt": "2026-07-14T00:00:00.000Z"
    }
  ]
}
```

### Validation rules
- `search` max 200 characters; empty string ignored
- `status` must be valid enum if provided

---

## Endpoint: Create Ticket

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/tickets` |
| **Purpose** | Create ticket (status always `OPEN`) |

### Request
```json
{
  "title": "Printer not working",
  "description": "Details...",
  "priority": "MEDIUM",
  "createdById": "uuid",
  "assignedToId": "uuid"
}
```

### Response `201`
Returns full ticket detail shape.

### Validation rules
| Field | Rules |
|-------|-------|
| `title` | Required, 1–200 chars, trimmed |
| `description` | Required, 1–10,000 chars, trimmed |
| `priority` | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `createdById` | Required UUID; must reference existing user |
| `assignedToId` | Optional UUID |

---

## Endpoint: Get Ticket

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/tickets/:id` |
| **Purpose** | Ticket detail with comments |

### Response `200`
```json
{
  "data": {
    "id": "uuid",
    "title": "...",
    "description": "...",
    "priority": "HIGH",
    "status": "IN_PROGRESS",
    "assignedTo": { "id": "uuid", "name": "..." },
    "createdBy": { "id": "uuid", "name": "..." },
    "createdAt": "...",
    "updatedAt": "...",
    "comments": [
      {
        "id": "uuid",
        "message": "Investigating.",
        "createdAt": "...",
        "createdBy": { "id": "uuid", "name": "..." }
      }
    ]
  }
}
```

### Error `404`
`NOT_FOUND` — ticket does not exist.

---

## Endpoint: Update Ticket Fields

| | |
|---|---|
| **Method** | `PATCH` |
| **Path** | `/tickets/:id` |
| **Purpose** | Update title, description, priority, assignee (**not status**) |

### Request (at least one field)
```json
{
  "title": "Updated title",
  "assignedToId": null
}
```

### Response `200`
Updated ticket detail.

### Validation rules
- At least one of: `title`, `description`, `priority`, `assignedToId`
- `status` field **not accepted** on this endpoint
- `assignedToId` may be `null` to unassign

---

## Endpoint: Transition Ticket Status

| | |
|---|---|
| **Method** | `PATCH` |
| **Path** | `/tickets/:id/status` |
| **Purpose** | Change status via state machine |

### Request
```json
{ "status": "IN_PROGRESS" }
```

### Allowed transitions

| From | To |
|------|-----|
| `OPEN` | `IN_PROGRESS`, `CANCELLED` |
| `IN_PROGRESS` | `RESOLVED`, `CANCELLED` |
| `RESOLVED` | `CLOSED` |

### Response `200`
Updated ticket detail.

### Error `400` — `INVALID_STATUS_TRANSITION`
```json
{
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "message": "Cannot transition from 'OPEN' to 'CLOSED'. Allowed transitions: IN_PROGRESS, CANCELLED."
  }
}
```

### Edge behavior
- Same status as current → `200` (idempotent)
- Terminal states → `400` with terminal message

---

## Endpoint: Add Comment

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/tickets/:id/comments` |
| **Purpose** | Add comment to ticket |

### Request
```json
{
  "message": "Customer called back.",
  "createdById": "uuid"
}
```

### Response `201`
```json
{
  "data": {
    "id": "uuid",
    "message": "Customer called back.",
    "createdAt": "...",
    "createdBy": { "id": "uuid", "name": "..." }
  }
}
```

### Validation rules
| Field | Rules |
|-------|-------|
| `message` | Required, trimmed, min 1 char |
| `createdById` | Required UUID |

---

## Not Implemented (Stretch)

- `GET /health`
- Authentication / authorization headers
- Pagination query params
- OpenAPI/Swagger document

Full spec reference: [tool-specific/cursor-workflow/spec.md](tool-specific/cursor-workflow/spec.md)
