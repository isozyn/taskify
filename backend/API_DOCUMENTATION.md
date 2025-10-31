# Taskify API Documentation

## Table of Contents
- [Overview](#overview)
- [Workflow System](#workflow-system)
- [Authentication](#authentication)
- [Projects API](#projects-api)
- [Custom Columns API](#custom-columns-api)
- [Tasks API](#tasks-api)
- [Data Models](#data-models)

---

## Overview

**Base URL:** `http://localhost:5000/api/v1`

**Authentication:** All endpoints require JWT authentication via Bearer token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Workflow System

Taskify supports two distinct workflow types:

### 1. CUSTOM Workflow
- **User-defined columns:** Users can create, edit, reorder, and delete columns
- **Flexible dates:** Start and end dates are optional for tasks
- **Column-based:** Tasks are organized by `columnId`
- **Default columns:** "To Do", "In Progress", "Done" (created automatically)

### 2. AUTOMATED Workflow
- **Fixed columns:** Upcoming, In Progress, Review, Complete, Backlog
- **Required dates:** Tasks must have both `startDate` and `endDate`
- **Auto-status calculation:** Task status is calculated in real-time based on dates:
  - `TODO` (Upcoming): `startDate` is in the future
  - `IN_PROGRESS`: Current date is between `startDate` and `endDate`
  - `IN_REVIEW` (Review): `endDate` has passed
  - `COMPLETED` (Complete): Manually set when task is done
  - `BLOCKED` (Backlog): Manually set when task is blocked

**Important:** Workflow type is set during project creation and **cannot be changed** afterward.

---

## Authentication

### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe"
}
```

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

---

## Projects API

### Create Project
```http
POST /api/v1/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My New Project",
  "description": "Project description",
  "workflowType": "CUSTOM"  // or "AUTOMATED"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "My New Project",
  "description": "Project description",
  "workflowType": "CUSTOM",
  "ownerId": 1,
  "createdAt": "2025-10-30T10:00:00.000Z",
  "updatedAt": "2025-10-30T10:00:00.000Z"
}
```

**Note:** For CUSTOM workflow projects, default columns are automatically created.

### Get All Projects
```http
GET /api/v1/projects
Authorization: Bearer <token>
```

### Get Project by ID
```http
GET /api/v1/projects/:projectId
Authorization: Bearer <token>
```

### Update Project
```http
PUT /api/v1/projects/:projectId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

**Note:** `workflowType` cannot be updated and will be ignored if included.

### Delete Project
```http
DELETE /api/v1/projects/:projectId
Authorization: Bearer <token>
```

---

## Custom Columns API

**Note:** These endpoints only work with CUSTOM workflow projects. Attempting to use them with AUTOMATED workflow projects will return an error.

### Get Columns for Project
```http
GET /api/v1/projects/:projectId/columns
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "col_1",
    "projectId": 1,
    "title": "To Do",
    "color": "#3B82F6",
    "order": 0,
    "createdAt": "2025-10-30T10:00:00.000Z",
    "updatedAt": "2025-10-30T10:00:00.000Z"
  },
  {
    "id": "col_2",
    "projectId": 1,
    "title": "In Progress",
    "color": "#F59E0B",
    "order": 1,
    "createdAt": "2025-10-30T10:00:00.000Z",
    "updatedAt": "2025-10-30T10:00:00.000Z"
  }
]
```

### Create Column
```http
POST /api/v1/projects/:projectId/columns
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Testing",
  "color": "#10B981",
  "order": 2
}
```

**Validation:**
- Project must use CUSTOM workflow
- Title is required
- Color is optional (defaults to #3B82F6)
- Order is optional (defaults to highest + 1)

### Update Column
```http
PUT /api/v1/columns/:columnId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "QA Testing",
  "color": "#8B5CF6"
}
```

### Delete Column
```http
DELETE /api/v1/columns/:columnId
Authorization: Bearer <token>
```

**Behavior:** All tasks in this column will be moved to the first column (order: 0) of the project.

### Reorder Columns
```http
PUT /api/v1/projects/:projectId/columns/reorder
Authorization: Bearer <token>
Content-Type: application/json

{
  "columnOrders": [
    { "id": "col_3", "order": 0 },
    { "id": "col_1", "order": 1 },
    { "id": "col_2", "order": 2 }
  ]
}
```

**Note:** Updates multiple columns in a single transaction.

---

## Tasks API

### Create Task

#### For CUSTOM Workflow:
```http
POST /api/v1/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": 1,
  "title": "Implement login page",
  "description": "Create login UI with form validation",
  "priority": "HIGH",
  "columnId": "col_1",
  "assignedTo": 2,
  "tags": ["frontend", "authentication"]
}
```

#### For AUTOMATED Workflow:
```http
POST /api/v1/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": 1,
  "title": "Design database schema",
  "description": "Create ERD and schema definition",
  "priority": "HIGH",
  "startDate": "2025-11-01T00:00:00.000Z",
  "endDate": "2025-11-05T23:59:59.999Z",
  "assignedTo": 2,
  "tags": ["backend", "database"]
}
```

**Response:**
```json
{
  "id": 1,
  "projectId": 1,
  "title": "Implement login page",
  "description": "Create login UI with form validation",
  "status": "TODO",
  "priority": "HIGH",
  "startDate": null,
  "endDate": null,
  "columnId": "col_1",
  "assignedTo": 2,
  "createdBy": 1,
  "tags": ["frontend", "authentication"],
  "createdAt": "2025-10-30T10:00:00.000Z",
  "updatedAt": "2025-10-30T10:00:00.000Z"
}
```

**Validation:**
- For AUTOMATED workflow: `startDate` and `endDate` are **required**
- For CUSTOM workflow: dates are optional, `columnId` is used for organization

### Get Tasks by Project
```http
GET /api/v1/projects/:projectId/tasks
Authorization: Bearer <token>
```

**Response for AUTOMATED workflow:**
```json
[
  {
    "id": 1,
    "title": "Design database schema",
    "status": "TODO",  // Calculated in real-time
    "startDate": "2025-11-01T00:00:00.000Z",
    "endDate": "2025-11-05T23:59:59.999Z",
    "calculatedColumn": "Upcoming"  // Visual column name
  }
]
```

**Note:** For AUTOMATED workflow tasks, the `status` is calculated in real-time based on dates and the `calculatedColumn` field shows which visual column it belongs to.

### Get Tasks by Column (CUSTOM Workflow only)
```http
GET /api/v1/columns/:columnId/tasks
Authorization: Bearer <token>
```

### Get Tasks by Status (AUTOMATED Workflow only)
```http
GET /api/v1/tasks/status/:status
Authorization: Bearer <token>
```

**Valid status values:** `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`, `BLOCKED`

### Update Task

#### For CUSTOM Workflow:
```http
PUT /api/v1/tasks/:taskId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "columnId": "col_2",
  "priority": "MEDIUM"
}
```

#### For AUTOMATED Workflow:
```http
PUT /api/v1/tasks/:taskId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "startDate": "2025-11-02T00:00:00.000Z",
  "endDate": "2025-11-06T23:59:59.999Z",
  "status": "COMPLETED"  // Manual override
}
```

**Note:** For AUTOMATED workflow, you can manually set status to `COMPLETED` or `BLOCKED` to override automatic calculation.

### Delete Task
```http
DELETE /api/v1/tasks/:taskId
Authorization: Bearer <token>
```

---

## Data Models

### Project
```typescript
{
  id: number;
  name: string;
  description: string | null;
  workflowType: 'CUSTOM' | 'AUTOMATED';  // Cannot be changed after creation
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### CustomColumn (CUSTOM workflow only)
```typescript
{
  id: string;
  projectId: number;
  title: string;
  color: string;  // Hex color code
  order: number;  // Display order (0-indexed)
  createdAt: Date;
  updatedAt: Date;
}
```

### Task
```typescript
{
  id: number;
  projectId: number;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'BLOCKED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  
  // Date fields (required for AUTOMATED, optional for CUSTOM)
  startDate: Date | null;
  endDate: Date | null;
  
  // For CUSTOM workflow only
  columnId: string | null;
  
  assignedTo: number | null;
  createdBy: number;
  tags: string[];
  
  createdAt: Date;
  updatedAt: Date;
}
```

### User
```typescript
{
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Status Calculation (AUTOMATED Workflow)

The status for AUTOMATED workflow tasks is calculated automatically based on the following logic:

1. **Manual Overrides (Highest Priority):**
   - If status is `COMPLETED` or `BLOCKED`, it stays as-is

2. **Date-Based Calculation:**
   - `TODO` → Start date is in the future
   - `IN_PROGRESS` → Current date is between start and end date
   - `IN_REVIEW` → End date has passed

3. **Column Mapping:**
   - `TODO` → "Upcoming"
   - `IN_PROGRESS` → "In Progress"
   - `IN_REVIEW` → "Review"
   - `COMPLETED` → "Complete"
   - `BLOCKED` → "Backlog"

This calculation happens in real-time when fetching tasks, ensuring the UI always shows the current state without database updates.

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (validation errors, missing required fields)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Example Workflows

### Creating a CUSTOM Workflow Project
```bash
# 1. Create project
POST /api/v1/projects
{
  "name": "Website Redesign",
  "workflowType": "CUSTOM"
}
# Default columns "To Do", "In Progress", "Done" are auto-created

# 2. Add a custom column
POST /api/v1/projects/1/columns
{
  "title": "Design Review",
  "color": "#A855F7",
  "order": 1
}

# 3. Create a task
POST /api/v1/tasks
{
  "projectId": 1,
  "title": "Create homepage mockup",
  "columnId": "col_1",
  "priority": "HIGH"
}

# 4. Move task to another column
PUT /api/v1/tasks/1
{
  "columnId": "col_2"
}
```

### Creating an AUTOMATED Workflow Project
```bash
# 1. Create project
POST /api/v1/projects
{
  "name": "Sprint 5",
  "workflowType": "AUTOMATED"
}

# 2. Create a task with dates
POST /api/v1/tasks
{
  "projectId": 1,
  "title": "Implement user authentication",
  "startDate": "2025-11-01T00:00:00.000Z",
  "endDate": "2025-11-03T23:59:59.999Z",
  "priority": "HIGH"
}
# Task automatically appears in "Upcoming" until Nov 1
# Then moves to "In Progress" during Nov 1-3
# Then moves to "Review" after Nov 3

# 3. Mark as completed
PUT /api/v1/tasks/1
{
  "status": "COMPLETED"
}
# Task moves to "Complete" column
```

---

## Implementation Files Reference

- **Models:** `backend/src/models/` (Project.ts, Task.ts, CustomColumn.ts)
- **Services:** `backend/src/services/` (projectService.ts, taskService.ts, customColumnService.ts)
- **Controllers:** `backend/src/controllers/` (customColumnController.ts)
- **Routes:** `backend/src/routes/` (customColumnRoutes.ts)
- **Utilities:** `backend/src/utils/automatedWorkflow.ts`
- **Database Schema:** `backend/prisma/schema.prisma`
- **Migration:** `backend/prisma/migrations/20251030090220_add_workflow_support/`
