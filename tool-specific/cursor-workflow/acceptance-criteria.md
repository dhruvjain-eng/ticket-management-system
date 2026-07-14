# Acceptance Criteria: Support Ticket Management System (Core)

Format: **Given / When / Then**
Scope: Mandatory Core only
Stack: Next.js · Express · PostgreSQL · Prisma

---

## 1. Create Ticket

### AC-CT-01: Create ticket with required fields
- **Given** the user is on the Create Ticket page (`/tickets/new`)
- **And** seeded users are available in the Created By dropdown
- **When** the user enters a valid title, description, and priority, selects a creator, and submits the form
- **Then** the ticket is persisted in PostgreSQL with status `OPEN`
- **And** the user is redirected to the ticket detail page
- **And** the new ticket appears on the ticket list

### AC-CT-02: Create ticket with assignee
- **Given** the user is on the Create Ticket page
- **When** the user fills required fields and selects an assignee from seeded users
- **Then** the ticket is created with the selected `assignedTo` user
- **And** the assignee name is visible on the ticket detail page

### AC-CT-03: Create ticket without assignee
- **Given** the user is on the Create Ticket page
- **When** the user fills required fields and leaves assignee as "Unassigned"
- **Then** the ticket is created with `assignedTo` set to null
- **And** the detail page shows "Unassigned"

### AC-CT-04: Default status on creation
- **Given** a valid create-ticket request
- **When** the ticket is created via UI or `POST /api/v1/tickets`
- **Then** the ticket status is always `OPEN`
- **And** the client cannot set a different initial status

### AC-CT-05: Timestamps set on creation
- **Given** a successfully created ticket
- **When** the ticket is retrieved from the API
- **Then** `createdAt` and `updatedAt` are populated with valid ISO 8601 timestamps

### AC-CT-06: Acting user pre-fills creator
- **Given** the user has selected an "Acting as" user in the app header
- **When** the user navigates to the Create Ticket page
- **Then** the Created By field is pre-filled with the acting user
- **And** the user may change it to another seeded user before submitting

### AC-CT-07: Cancel create flow
- **Given** the user is on the Create Ticket page with partially filled fields
- **When** the user clicks Cancel
- **Then** the user is navigated back to the ticket list
- **And** no ticket is created in the database

---

## 2. View Tickets

### AC-VT-01: View all tickets from database
- **Given** tickets exist in PostgreSQL
- **When** the user navigates to `/tickets`
- **Then** all tickets are loaded from the backend API (not hardcoded or in-memory data)
- **And** each row shows at minimum: title, priority, status, assignee, creator, and created date

### AC-VT-02: Navigate to ticket detail from list
- **Given** the ticket list is displayed
- **When** the user clicks a ticket title
- **Then** the user is navigated to `/tickets/[id]` for that ticket

### AC-VT-03: Empty ticket list
- **Given** no tickets exist in the database (and no filters are applied)
- **When** the user opens the ticket list page
- **Then** an empty state message is shown (e.g. "No tickets found")
- **And** no error is displayed

### AC-VT-04: Loading state on list page
- **Given** the user navigates to the ticket list page
- **When** ticket data is being fetched from the API
- **Then** a loading indicator (spinner or skeleton) is shown
- **And** the list is not shown until data arrives

### AC-VT-05: Tickets ordered by recency
- **Given** multiple tickets exist with different `createdAt` values
- **When** the user views the ticket list with no search or filter applied
- **Then** tickets are ordered by created date, newest first

### AC-VT-06: Data persists after restart
- **Given** tickets exist in the database
- **When** the backend, frontend, and PostgreSQL are restarted
- **Then** the ticket list still shows the same tickets with unchanged data

---

## 3. Ticket Details

### AC-TD-01: View full ticket details
- **Given** a ticket exists in the database
- **When** the user navigates to `/tickets/[id]`
- **Then** the page displays: title, description, priority, status, assignee, creator, `createdAt`, and `updatedAt`

### AC-TD-02: View comments on detail page
- **Given** a ticket has one or more comments
- **When** the user opens the ticket detail page
- **Then** all comments are displayed in chronological order (oldest first)
- **And** each comment shows message, author name, and `createdAt`

### AC-TD-03: Empty comments state
- **Given** a ticket has no comments
- **When** the user opens the ticket detail page
- **Then** the comments section shows an empty state (e.g. "No comments yet")
- **And** the add-comment form is still available

### AC-TD-04: Loading state on detail page
- **Given** the user navigates to a valid ticket detail URL
- **When** ticket data is being fetched
- **Then** a loading indicator is shown until the detail view renders

### AC-TD-05: Ticket not found
- **Given** no ticket exists with the requested ID
- **When** the user navigates to `/tickets/[invalid-or-missing-id]`
- **Then** a "Ticket not found" message is displayed
- **And** a link or button to return to the ticket list is provided

### AC-TD-06: Detail reflects latest data
- **Given** a ticket was updated or commented on in another browser tab or via API
- **When** the user refreshes the ticket detail page
- **Then** the page shows the latest field values and comments from the database

---

## 4. Edit Ticket

### AC-ET-01: Update ticket title and description
- **Given** the user is on the ticket detail page
- **When** the user edits the title and/or description and clicks Save
- **Then** the changes are persisted via `PATCH /api/v1/tickets/:id`
- **And** the updated values are shown on the detail page
- **And** `updatedAt` is refreshed

### AC-ET-02: Update ticket priority
- **Given** the user is on the ticket detail page
- **When** the user changes priority to a valid value and saves
- **Then** the new priority is persisted and displayed with the correct badge

### AC-ET-03: Reassign ticket
- **Given** the user is on the ticket detail page
- **And** seeded users are available in the assignee dropdown
- **When** the user selects a different assignee and saves
- **Then** the ticket's `assignedTo` is updated in the database
- **And** the new assignee name appears on the detail page and ticket list

### AC-ET-04: Unassign ticket
- **Given** a ticket currently has an assignee
- **When** the user sets assignee to "Unassigned" and saves
- **Then** `assignedTo` is set to null in the database
- **And** the UI shows "Unassigned"

### AC-ET-05: Status not editable via field update
- **Given** the user is editing ticket fields on the detail page
- **When** the user saves changes to title, description, priority, or assignee
- **Then** the ticket status remains unchanged
- **And** status can only be changed through the status transition control

### AC-ET-06: Save success feedback
- **Given** the user submits valid field changes
- **When** the update succeeds
- **Then** a success indication is shown (toast, banner, or inline message)
- **And** no error banner is displayed

### AC-ET-07: Partial field update via API
- **Given** a ticket exists
- **When** `PATCH /api/v1/tickets/:id` is called with only one field (e.g. `title`)
- **Then** only that field is updated
- **And** all other fields retain their previous values

---

## 5. Change Status

### AC-CS-01: Open → In Progress
- **Given** a ticket with status `OPEN`
- **When** the user transitions the status to `IN_PROGRESS`
- **Then** the transition succeeds with HTTP 200
- **And** the ticket status is `IN_PROGRESS` in the database
- **And** the UI reflects the new status

### AC-CS-02: In Progress → Resolved
- **Given** a ticket with status `IN_PROGRESS`
- **When** the user transitions the status to `RESOLVED`
- **Then** the transition succeeds
- **And** the ticket status is `RESOLVED` in the database

### AC-CS-03: Resolved → Closed
- **Given** a ticket with status `RESOLVED`
- **When** the user transitions the status to `CLOSED`
- **Then** the transition succeeds
- **And** the ticket status is `CLOSED` in the database

### AC-CS-04: Open → Cancelled
- **Given** a ticket with status `OPEN`
- **When** the user transitions the status to `CANCELLED`
- **Then** the transition succeeds
- **And** the ticket status is `CANCELLED` in the database

### AC-CS-05: In Progress → Cancelled
- **Given** a ticket with status `IN_PROGRESS`
- **When** the user transitions the status to `CANCELLED`
- **Then** the transition succeeds
- **And** the ticket status is `CANCELLED` in the database

### AC-CS-06: Only valid transitions shown in UI
- **Given** the user is viewing a ticket detail page
- **When** the status transition control renders
- **Then** only allowed next statuses for the current status are offered as actions
- **And** no invalid transition options are presented

### AC-CS-07: Terminal states have no transitions
- **Given** a ticket with status `CLOSED` or `CANCELLED`
- **When** the user views the status transition control
- **Then** no further status actions are available
- **And** the current status badge is displayed as read-only

### AC-CS-08: Reject invalid transition — Open → Resolved
- **Given** a ticket with status `OPEN`
- **When** `PATCH /api/v1/tickets/:id/status` is called with `status: "RESOLVED"`
- **Then** the API returns HTTP 400 with code `INVALID_STATUS_TRANSITION`
- **And** the ticket status remains `OPEN` in the database

### AC-CS-09: Reject invalid transition — Resolved → Cancelled
- **Given** a ticket with status `RESOLVED`
- **When** a transition to `CANCELLED` is attempted
- **Then** the API returns HTTP 400 with code `INVALID_STATUS_TRANSITION`
- **And** the status remains `RESOLVED` in the database

### AC-CS-10: Reject transition from terminal state
- **Given** a ticket with status `CLOSED` or `CANCELLED`
- **When** any status transition is attempted via the API
- **Then** the API returns HTTP 400 with code `INVALID_STATUS_TRANSITION`
- **And** the status is unchanged in the database

### AC-CS-11: Invalid transition error shown in UI
- **Given** a status transition is rejected by the backend
- **When** the error response is received
- **Then** a clear error message is displayed to the user (e.g. in an error banner)
- **And** the displayed status matches the unchanged database value

### AC-CS-12: Idempotent same-status transition (if supported)
- **Given** a ticket with status `OPEN`
- **When** `PATCH /api/v1/tickets/:id/status` is called with `status: "OPEN"`
- **Then** the request succeeds without error (or returns a clear no-op response per implementation)
- **And** the status remains `OPEN`

### AC-CS-13: Integration tests cover state machine
- **Given** the backend test suite is run
- **When** `npm test` is executed in the backend package
- **Then** all state-machine integration tests pass
- **And** both valid and invalid transitions are covered

---

## 6. Add Comment

### AC-AC-01: Add comment to ticket
- **Given** the user is on a ticket detail page
- **When** the user enters a message, selects an author (seeded user), and submits
- **Then** the comment is persisted via `POST /api/v1/tickets/:id/comments`
- **And** the comment appears in the comment list without a full page reload

### AC-AC-02: Comment metadata
- **Given** a comment is successfully created
- **When** the comment is displayed
- **Then** it shows the message, author name, and `createdAt` timestamp

### AC-AC-03: Comments ordered chronologically
- **Given** a ticket has multiple comments
- **When** the detail page loads
- **Then** comments are ordered by `createdAt` ascending (oldest first)

### AC-AC-04: Acting user pre-fills comment author
- **Given** the user has selected an "Acting as" user in the header
- **When** the user opens the add-comment form
- **Then** the author field is pre-filled with the acting user

### AC-AC-05: Comment persists after restart
- **Given** a comment has been added to a ticket
- **When** the application and database are restarted
- **Then** the comment is still visible on the ticket detail page

### AC-AC-06: Comment linked to correct ticket
- **Given** comments exist on multiple tickets
- **When** the user views a specific ticket's detail page
- **Then** only comments belonging to that ticket are displayed

### AC-AC-07: Submitting state on comment form
- **Given** the user submits a comment
- **When** the API request is in progress
- **Then** the submit button is disabled
- **And** a loading indication is shown

---

## 7. Search

### AC-SR-01: Keyword search by title
- **Given** tickets exist with distinguishable titles
- **When** the user enters a keyword matching a ticket title in the search box
- **Then** only tickets whose title contains the keyword (case-insensitive) are shown

### AC-SR-02: Keyword search by description
- **Given** tickets exist with distinguishable descriptions
- **When** the user enters a keyword matching a ticket description
- **Then** tickets with matching descriptions are included in the results

### AC-SR-03: Search is case-insensitive
- **Given** a ticket with title "Login page broken"
- **When** the user searches for "login"
- **Then** the ticket appears in the results

### AC-SR-04: Search via backend API
- **Given** multiple tickets exist in the database
- **When** the user performs a search on the ticket list page
- **Then** the frontend calls `GET /api/v1/tickets?search=<keyword>`
- **And** results are returned from PostgreSQL, not filtered client-side from a partial fetch

### AC-SR-05: No results for search
- **Given** tickets exist in the database
- **When** the user searches for a keyword that matches no title or description
- **Then** the list shows an empty state (e.g. "No tickets found")
- **And** no error is displayed

### AC-SR-06: Clear search restores full list
- **Given** the user has an active search term applied
- **When** the user clears the search input
- **Then** the full ticket list (subject to any active status filter) is displayed again

### AC-SR-07: Debounced search input
- **Given** the user is typing in the search box
- **When** the user pauses typing
- **Then** the API is called after a short debounce delay (not on every keystroke)

### AC-SR-08: Empty search string
- **Given** the search input is empty or whitespace only
- **When** the list is loaded
- **Then** no search filter is applied
- **And** all tickets (subject to status filter) are returned

---

## 8. Filter

### AC-FL-01: Filter by status
- **Given** tickets exist in multiple statuses
- **When** the user selects a specific status from the filter dropdown (e.g. `OPEN`)
- **Then** only tickets with that status are displayed

### AC-FL-02: Filter via backend API
- **Given** tickets exist in the database
- **When** the user applies a status filter
- **Then** the frontend calls `GET /api/v1/tickets?status=<status>`
- **And** filtering is performed server-side against PostgreSQL

### AC-FL-03: Show all statuses
- **Given** a status filter is active
- **When** the user selects "All Statuses"
- **Then** tickets of all statuses are shown (subject to any active search term)

### AC-FL-04: Combined search and filter
- **Given** tickets exist with varied titles and statuses
- **When** the user applies both a keyword search and a status filter
- **Then** the API is called with both query params (`search` and `status`)
- **And** only tickets matching **both** criteria are shown

### AC-FL-05: No results for filter
- **Given** no tickets exist with the selected status (or none match combined search+filter)
- **When** the filter is applied
- **Then** an empty state is shown
- **And** no error is displayed

### AC-FL-06: Filter preserves search
- **Given** the user has an active search term
- **When** the user changes the status filter
- **Then** the search term remains applied
- **And** results match both the search and the new filter

### AC-FL-07: Invalid status filter rejected by API
- **Given** a request to `GET /api/v1/tickets?status=INVALID`
- **When** the backend processes the request
- **Then** HTTP 400 is returned with code `VALIDATION_ERROR`
- **And** a meaningful error message is included

---

## 9. Validation

### AC-VA-01: Required fields on ticket create
- **Given** a create-ticket request is submitted
- **When** `title`, `description`, `priority`, or `createdById` is missing or empty
- **Then** the backend returns HTTP 400 with code `VALIDATION_ERROR`
- **And** field-level error details are included
- **And** no ticket is created

### AC-VA-02: Title length limits
- **Given** a ticket create or update request
- **When** the title exceeds 200 characters or is whitespace-only
- **Then** the backend returns HTTP 400 with `VALIDATION_ERROR`

### AC-VA-03: Description length limits
- **Given** a ticket create or update request
- **When** the description exceeds 10,000 characters or is whitespace-only
- **Then** the backend returns HTTP 400 with `VALIDATION_ERROR`

### AC-VA-04: Invalid priority enum
- **Given** a ticket create or update request
- **When** `priority` is not one of `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- **Then** the backend returns HTTP 400 with `VALIDATION_ERROR`

### AC-VA-05: Invalid createdById reference
- **Given** a ticket create request
- **When** `createdById` references a non-existent user UUID
- **Then** the backend returns HTTP 400 with code `INVALID_REFERENCE`
- **And** no ticket is created

### AC-VA-06: Invalid assignedToId reference
- **Given** a ticket create or update request
- **When** `assignedToId` references a non-existent user UUID
- **Then** the backend returns HTTP 400 with code `INVALID_REFERENCE`

### AC-VA-07: Status rejected on field update endpoint
- **Given** a ticket update request to `PATCH /api/v1/tickets/:id`
- **When** the request body includes a `status` field
- **Then** the backend returns HTTP 400 with `VALIDATION_ERROR`
- **And** the ticket status is unchanged

### AC-VA-08: Update requires at least one field
- **Given** a ticket update request to `PATCH /api/v1/tickets/:id`
- **When** the request body is empty or contains no updatable fields
- **Then** the backend returns HTTP 400 with `VALIDATION_ERROR`

### AC-VA-09: Required comment message
- **Given** a comment create request
- **When** `message` is missing, empty, or whitespace-only
- **Then** the backend returns HTTP 400 with `VALIDATION_ERROR`
- **And** no comment is created

### AC-VA-10: Comment message length limit
- **Given** a comment create request
- **When** `message` exceeds 5,000 characters
- **Then** the backend returns HTTP 400 with `VALIDATION_ERROR`

### AC-VA-11: Invalid comment author reference
- **Given** a comment create request
- **When** `createdById` references a non-existent user
- **Then** the backend returns HTTP 400 with code `INVALID_REFERENCE`

### AC-VA-12: Invalid ticket ID format
- **Given** a request to any `/tickets/:id` endpoint
- **When** `:id` is not a valid UUID
- **Then** the backend returns HTTP 400 with `VALIDATION_ERROR`

### AC-VA-13: Invalid status enum on transition
- **Given** a status transition request
- **When** `status` is not a valid `TicketStatus` value
- **Then** the backend returns HTTP 400 with `VALIDATION_ERROR`
- **And** the ticket status is unchanged

### AC-VA-14: Frontend shows field validation errors
- **Given** the backend returns `VALIDATION_ERROR` with `details[]`
- **When** the user submits a form (create ticket, edit ticket, add comment)
- **Then** field-level error messages are displayed inline next to the relevant inputs

### AC-VA-15: Client-side required field hints
- **Given** the user is on a form with required fields
- **When** the user attempts to submit with missing required fields
- **Then** the form provides immediate feedback (disabled submit and/or inline hints) before or alongside the server response

---

## 10. Error Handling

### AC-EH-01: Consistent API error shape
- **Given** any API error response (4xx or 5xx)
- **When** the response body is inspected
- **Then** it follows the shape `{ error: { code, message, details? } }`

### AC-EH-02: Not found — ticket
- **Given** a request for a non-existent ticket ID (valid UUID format)
- **When** `GET`, `PATCH`, or `POST /comments` is called for that ID
- **Then** the backend returns HTTP 404 with code `NOT_FOUND`

### AC-EH-03: Not found — user
- **Given** a request for a non-existent user ID
- **When** `GET /api/v1/users/:id` is called
- **Then** the backend returns HTTP 404 with code `NOT_FOUND`

### AC-EH-04: No stack traces in API responses
- **Given** an unexpected server error occurs
- **When** the backend returns HTTP 500
- **Then** the response contains a generic message with code `INTERNAL_ERROR`
- **And** no stack trace or internal details are exposed to the client

### AC-EH-05: Network failure on ticket list
- **Given** the backend is unreachable
- **When** the user opens the ticket list page
- **Then** an error banner is displayed with a user-friendly message
- **And** a retry action is available

### AC-EH-06: Network failure on ticket detail
- **Given** the backend is unreachable
- **When** the user opens a ticket detail page
- **Then** an error message is displayed
- **And** a retry action is available

### AC-EH-07: Server error on form submit
- **Given** the backend returns HTTP 500 during a form submission
- **When** the error response is received
- **Then** a user-friendly error banner is shown (e.g. "Something went wrong. Please try again.")
- **And** the form retains the user's entered values

### AC-EH-08: Invalid status transition error details
- **Given** an invalid status transition is attempted
- **When** the backend returns HTTP 400
- **Then** `error.code` is `INVALID_STATUS_TRANSITION`
- **And** `error.message` states the current status and why the transition is invalid

### AC-EH-09: Unknown API route
- **Given** a request to an undefined API path
- **When** the backend processes the request
- **Then** HTTP 404 is returned with code `NOT_FOUND`

### AC-EH-10: Frontend error boundary
- **Given** an unexpected rendering error occurs in the frontend
- **When** the error boundary catches it
- **Then** a fallback UI is shown instead of a blank page
- **And** the user can navigate back to the ticket list

### AC-EH-11: Prisma foreign key violation
- **Given** a request references a deleted or non-existent related record
- **When** the database raises a foreign key constraint error
- **Then** the backend maps it to HTTP 400 with code `INVALID_REFERENCE`

### AC-EH-12: Errors cleared on successful retry
- **Given** an error banner is displayed from a failed API call
- **When** the user retries and the request succeeds
- **Then** the error banner is dismissed
- **And** the expected data or success state is shown

---

## Cross-Cutting Acceptance Criteria

### AC-X-01: Seeded users available without user management UI
- **Given** the database has been seeded
- **When** the user opens create ticket, edit ticket, or add comment forms
- **Then** seeded users are available in dropdowns
- **And** there is no UI to create, edit, or delete users

### AC-X-02: No authentication required
- **Given** the application is running
- **When** the user accesses any page or
