# Taskify Architecture README

This document consolidates the architectural walkthrough and explanations that map how the Taskify frontend and backend work together. Treat it as a guide to the moving parts, the intent behind each layer, and the way data flows through the system.

---

## 1. Big Picture (Restaurant Analogy)

-   **Frontend (React + Vite)** → the dining area where users interact with menus.
-   **Backend (Express + TypeScript)** → the kitchen that prepares everything.
-   **API Endpoints** → the waiters ferrying orders and meals between guests and kitchen.
-   **PostgreSQL via Prisma** → the pantry that stores all ingredients (data).
-   **Prisma ORM** → the recipe book that turns high-level requests into exact database actions.

The application follows a layered design so each “station” has one job and is easy to reason about, test, and change.

---

## 2. Layer-by-Layer Breakdown

### 2.1 Database Schema (Prisma)

_File: `backend/prisma/schema.prisma`_

Prisma defines the canonical shape of the database. Example (trimmed for clarity):

```prisma
model Project {
  id             Int             @id @default(autoincrement())
  title          String
  description    String?
  status         ProjectStatus   @default(ACTIVE)
  startDate      DateTime?
  endDate        DateTime?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  ownerId        Int
  workflowType   WorkflowType    @default(CUSTOM)
  customColumns  CustomColumn[]
  owner          User            @relation("ProjectOwner", fields: [ownerId], references: [id])
}
```

Key points:

-   `@default(autoincrement())` is a ticket dispenser that hands out IDs automatically.
-   `DateTime?` means the field is optional.
-   `@default(now())` stamps creation time; `@updatedAt` auto-updates on every change.
-   Relations (`@relation`) are the hyperlinks between tables.

### 2.2 TypeScript Models

_File: `backend/src/models/Project.ts`_

Interfaces give us type safety between layers.

-   `Project` represents the full entity returned from the database.
-   `CreateProjectDTO` / `ProjectUpdateDTO` define what the API accepts when creating or updating.
-   DTOs deliberately exclude fields such as `id`, `createdAt`, `updatedAt` because the database owns them.

### 2.3 Service Layer

_File: `backend/src/services/projectService.ts`_

Handles business logic and all Prisma calls. Example snippets:

```ts
const parsedStartDate = data.startDate ? new Date(data.startDate) : null;

const project = await prisma.project.create({
	data: {
		...projectData,
		startDate: parsedStartDate,
		endDate: parsedEndDate,
	},
	include: {
		owner: true,
		customColumns: true,
	},
});
```

Highlights:

-   Destructures incoming DTOs so it can parse dates safely.
-   Uses Prisma `include` to eagerly fetch related owner and custom column data.
-   Houses all database touchpoints so controllers stay thin.

### 2.4 Controller Layer

_File: `backend/src/controllers/projectController.ts`_

Acts like a receptionist: collects data from `req`, calls the service, and shapes the HTTP response.

-   Uses `try/catch` to translate thrown errors into meaningful HTTP status codes.
-   Relies on DTOs to make TypeScript catch shape mismatches early.

### 2.5 Routes

_File: `backend/src/routes/projectRoutes.ts`_

Connects HTTP verbs + paths to controller functions, e.g.:

```ts
router.post("/projects", projectController.createProject);
router.get("/projects", projectController.getProjects);
router.get("/projects/:id", projectController.getProjectById);
```

The REST pattern keeps each operation predictable:

-   `GET /projects` → list
-   `POST /projects` → create
-   `GET /projects/:id` → read
-   `PUT /projects/:id` → update
-   `DELETE /projects/:id` → remove

### 2.6 Frontend API Client

_File: `frontend/src/lib/api.ts`_

Wraps `fetch` so React components have a single place to call backend endpoints.

Key behaviors:

-   Injects the base URL from `VITE_API_URL` with a localhost fallback.
-   Sets headers (e.g., `Content-Type: application/json`).
-   Throws custom errors when responses are not `response.ok`.

### 2.7 React Component Layer

_File: `frontend/src/pages/Dashboard.tsx`_

The `handleCreateProject` handler illustrates the full request/response cycle:

```tsx
const response = await api.createProject({
	title: newProject.name,
	description: newProject.description || undefined,
	startDate: newProject.startDate || undefined,
	endDate: newProject.endDate || undefined,
	workflowType,
});

const updatedProjects = await api.getProjects();
setProjects(updatedProjects || []);
```

Key concepts:

-   `useState` maintains form state.
-   `await` ensures project creation finishes before refreshing the list.
-   Errors bubble into the `catch` block for user feedback.

---

## 3. End-to-End Data Flow

1. **User submits the form** → React gathers values into a DTO.
2. **Frontend API client** converts the DTO to JSON and sends it via `fetch`.
3. **Express route** maps the URL to the controller.
4. **Controller** validates input shape and delegates to the service.
5. **Service** performs domain logic, converts strings to Dates, and calls Prisma.
6. **Prisma** generates SQL, talks to PostgreSQL, and returns the created record.
7. **Service** returns the entity to the controller.
8. **Controller** sends an HTTP 201 response with project data.
9. **Frontend** parses the JSON and updates state/UI accordingly.

This one-directional flow keeps concerns isolated and prevents tangled code.

---

## 4. Architectural Patterns Employed

-   **Layered Architecture** — presentation → API → business logic → data access → database.
-   **DTO Pattern** — isolates inbound/outbound payloads from database entity shapes.
-   **Repository Pattern (via Prisma)** — database access is centralized and type-safe.
-   **RESTful Design** — consistent and discoverable endpoints.
-   **Async/Await** — keeps asynchronous code readable and sequenced correctly.
-   **Environment-Based Configuration** — `VITE_API_URL` and `DATABASE_URL` enable easy environment switching.

---

## 5. Glossary of Terms

| Term / Decorator            | Meaning                                                         |
| --------------------------- | --------------------------------------------------------------- |
| `@default(autoincrement())` | Auto-increments numeric IDs.                                    |
| `@default(now())`           | Sets timestamp fields when records are created.                 |
| `@updatedAt`                | Prisma-managed timestamp updated on every write.                |
| DTO                         | Data Transfer Object — a shaped payload for requests/responses. |
| `include` (Prisma)          | Fetch related entities in one query (eager loading).            |
| REST verbs                  | `GET`, `POST`, `PUT`, `DELETE` mapping to CRUD operations.      |

---

## 6. Why This Structure Matters

-   **Maintainability**: Each layer has a single responsibility, limiting ripple effects.
-   **Testability**: Services can be unit-tested without the HTTP layer; controllers can be integration-tested; React components test state and UI logic separately.
-   **Scalability**: Adding features (e.g., project cloning, new workflows) affects isolated layers instead of requiring wholesale rewrites.
-   **Team Collaboration**: Frontend and backend teams can develop and test against stable contracts (DTOs, REST endpoints).

---

## 7. Suggested Next Steps for Deeper Understanding

1. **Trace another feature** — e.g., task creation — to reinforce the patterns.
2. **Add logging** in services to see real-time data transformations.
3. **Write a unit test** for `projectService.createProject` to experience DTO parsing and Prisma mocks.
4. **Experiment with Prisma Studio** (`npx prisma studio`) to inspect database state visually.

---

Use this README as a map: revisit each layer when you modify or extend functionality so you always know where a change belongs and how it propagates through the stack.
