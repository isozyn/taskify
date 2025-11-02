# Taskify Architecture: Backend-Frontend Integration (In-Depth Guide)

This guide explains how Taskify’s backend and frontend work together, using analogies and detailed breakdowns to help you truly understand the implementation.

---

## 🏗️ The Big Picture: Restaurant Analogy

-   **Frontend (React)**: The dining area where users interact with menus and place orders.
-   **Backend (Express/TypeScript)**: The kitchen where orders are prepared.
-   **API**: The waiter who takes orders from customers and brings food back.
-   **Database (PostgreSQL via Prisma)**: The pantry/storage where all ingredients (data) are kept.
-   **Prisma ORM**: The recipe book that translates high-level requests into exact database actions.

Each “station” has a clear job, making the system easy to reason about, test, and change.

---

## 📚 Layer-by-Layer Breakdown

### 1. Database Schema (Prisma)

**File:** `backend/prisma/schema.prisma`

Defines the canonical shape of your data.

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

**Key Concepts:**

-   `@default(autoincrement())`: Like a ticket dispenser, hands out IDs automatically.
-   `DateTime?`: Optional field (can be blank).
-   `@default(now())`: Stamps creation time.
-   `@updatedAt`: Auto-updates on every change.
-   Relations (`@relation`): Hyperlinks between tables (like a library card linking to your account).
-   Arrays (`CustomColumn[]`): One project can have many custom columns (like a folder with many documents).

---

### 2. TypeScript Models

**File:** `backend/src/models/Project.ts`

Interfaces give type safety between layers.

-   `Project`: The full entity returned from the database.
-   `CreateProjectDTO` / `ProjectUpdateDTO`: What the API accepts when creating/updating.

**DTO = Data Transfer Object**  
Think of it as a delivery package—only what’s needed to ship data from point A to B.

---

### 3. Service Layer

**File:** `backend/src/services/projectService.ts`

Handles business logic and all Prisma calls.

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

**Highlights:**

-   Destructures incoming DTOs to safely parse dates.
-   Uses Prisma `include` to fetch related owner and custom column data.
-   Centralizes all database touchpoints so controllers stay thin.

---

### 4. Controller Layer

**File:** `backend/src/controllers/projectController.ts`

Acts like a receptionist: collects data from `req`, calls the service, and shapes the HTTP response.

-   Uses `try/catch` to translate errors into meaningful HTTP status codes.
-   Relies on DTOs for early error catching.

---

### 5. Routes

**File:** `backend/src/routes/projectRoutes.ts`

Connects HTTP verbs and paths to controller functions.

```ts
router.post("/projects", projectController.createProject);
router.get("/projects", projectController.getProjects);
router.get("/projects/:id", projectController.getProjectById);
```

**REST Pattern:**

-   `GET /projects`: List
-   `POST /projects`: Create
-   `GET /projects/:id`: Read
-   `PUT /projects/:id`: Update
-   `DELETE /projects/:id`: Remove

---

### 6. Frontend API Client

**File:** `frontend/src/lib/api.ts`

Wraps `fetch` so React components have a single place to call backend endpoints.

-   Injects the base URL from `VITE_API_URL` (with localhost fallback).
-   Sets headers (e.g., `Content-Type: application/json`).
-   Throws custom errors when responses are not `response.ok`.

---

### 7. React Component Layer

**File:** `frontend/src/pages/Dashboard.tsx`

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

**Key Concepts:**

-   `useState` maintains form state.
-   `await` ensures project creation finishes before refreshing the list.
-   Errors bubble into the `catch` block for user feedback.

---

## 🔄 The Complete Data Flow

Let’s trace what happens when you create a project:

1. **User submits the form** → React gathers values into a DTO.
2. **Frontend API client** converts the DTO to JSON and sends it via `fetch`.
3. **Express route** maps the URL to the controller.
4. **Controller** validates input and delegates to the service.
5. **Service** performs logic, converts strings to Dates, and calls Prisma.
6. **Prisma** generates SQL, talks to PostgreSQL, and returns the created record.
7. **Service** returns the entity to the controller.
8. **Controller** sends an HTTP 201 response with project data.
9. **Frontend** parses the JSON and updates state/UI accordingly.

---

## 🛠️ Architectural Patterns Used

-   **Layered Architecture**: Presentation → API → business logic → data access → database.
-   **DTO Pattern**: Isolates inbound/outbound payloads from database entity shapes.
-   **Repository Pattern (via Prisma)**: Centralized, type-safe database access.
-   **RESTful Design**: Consistent, discoverable endpoints.
-   **Async/Await**: Keeps asynchronous code readable and sequenced.
-   **Environment-Based Configuration**: `VITE_API_URL` and `DATABASE_URL` enable easy environment switching.

---

## 📖 Glossary

| Term / Decorator            | Meaning                                                         |
| --------------------------- | --------------------------------------------------------------- |
| `@default(autoincrement())` | Auto-increments numeric IDs.                                    |
| `@default(now())`           | Sets timestamp fields when records are created.                 |
| `@updatedAt`                | Prisma-managed timestamp updated on every write.                |
| DTO                         | Data Transfer Object — a shaped payload for requests/responses. |
| `include` (Prisma)          | Fetch related entities in one query (eager loading).            |
| REST verbs                  | `GET`, `POST`, `PUT`, `DELETE` mapping to CRUD operations.      |

---

## 🚀 Why This Structure Matters

-   **Maintainability**: Each layer has a single responsibility, limiting ripple effects.
-   **Testability**: Services can be unit-tested without the HTTP layer; controllers can be integration-tested; React components test state and UI logic separately.
-   **Scalability**: Adding features (e.g., project cloning, new workflows) affects isolated layers instead of requiring wholesale rewrites.
-   **Team Collaboration**: Frontend and backend teams can develop and test against stable contracts (DTOs, REST endpoints).

---

## 🧭 Next Steps for Deeper Understanding

1. **Trace another feature** (e.g., task creation) to reinforce the patterns.
2. **Add logging** in services to see real-time data transformations.
3. **Write a unit test** for `projectService.createProject` to experience DTO parsing and Prisma mocks.
4. **Experiment with Prisma Studio** (`npx prisma studio`) to inspect database state visually.

---

Use this README as a map: revisit each layer when you modify or extend functionality so you always know where a change belongs and how it propagates through the stack.
