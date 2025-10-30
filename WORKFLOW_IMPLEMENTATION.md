# Workflow Implementation Summary

## What's Been Set Up:

### 1. Database Migration
Location: `backend/prisma/migrations/add_workflow_support.sql`

**Run this SQL in your Neon DB** to:
- Add `workflowType` column to Projects table (CUSTOM or AUTOMATED)
- Add `columnId` column to Tasks table (for custom workflow)
- Add `startDate` column to Tasks table
- Rename `dueDate` to `endDate` for clarity
- Create new `CustomColumns` table
- Add indexes for performance

### 2. Updated Models

#### Project Model (`backend/src/models/Project.ts`)
- Added `WorkflowType` enum (CUSTOM, AUTOMATED)
- Added `workflowType` field to Project interface
- workflowType is required on creation but CANNOT be changed after

#### Task Model (`backend/src/models/Task.ts`)
- Renamed `dueDate` → `endDate`
- Added `startDate` field
- Added `columnId` field (for custom workflow)
- Both dates are optional (nullable)

#### CustomColumn Model (`backend/src/models/CustomColumn.ts`) - NEW
- Stores custom columns for projects with CUSTOM workflow
- Fields: id, projectId, title, color, order, timestamps

### 3. Automated Workflow Calculator
Location: `backend/src/utils/automatedWorkflow.ts`

**Option C Implementation** - Real-time status calculation:
- `calculateAutomatedStatus()` - Computes task status based on dates
- Logic:
  - Before startDate → TODO (Upcoming)
  - Between start/end → IN_PROGRESS (In Progress)
  - After endDate → IN_REVIEW (Review)
  - Manually marked → COMPLETED (Complete) or BLOCKED (Backlog)

## How It Works:

### Custom Workflow
1. User creates project with `workflowType: 'CUSTOM'`
2. User can create custom columns (stored in CustomColumns table)
3. Tasks use `columnId` to reference which column they're in
4. Tasks can be dragged between columns
5. startDate and endDate are OPTIONAL

### Automated Workflow
1. User creates project with `workflowType: 'AUTOMATED'`
2. Fixed columns: Upcoming, In Progress, Review, Complete, Backlog
3. Tasks REQUIRE startDate and endDate
4. When loading the board, backend calculates current status based on dates
5. Tasks automatically appear in correct columns
6. Users can manually mark as Complete or Blocked

## Next Steps:

1. **Run the migration SQL in Neon DB**
2. **Create API endpoints** for:
   - CustomColumns CRUD
   - Task creation/update with workflow validation
   - Get tasks with calculated status for automated workflow
3. **Update frontend** to:
   - Show workflow selection on project creation
   - Make dates required/optional based on workflow type
   - Display calculated status for automated workflow
   - Store/retrieve custom columns for custom workflow

## API Examples Needed:

```typescript
// POST /api/projects
{
  title: "My Project",
  workflowType: "AUTOMATED", // or "CUSTOM"
  ownerId: 1
}

// POST /api/custom-columns
{
  projectId: 1,
  title: "In Design",
  color: "purple",
  order: 1
}

// GET /api/tasks?projectId=1
// Should return tasks with calculated status if automated workflow
```
