# Project Trash Recovery System

## Overview
The trash recovery system allows users to safely delete projects with the ability to recover them within 30 days. After 30 days, projects are permanently deleted automatically.

## Features

### 1. Soft Delete
- When a project is deleted, it's moved to trash (soft delete)
- Project is marked with `isDeleted: true`, `deletedAt: timestamp`, and `deletedBy: userId`
- Deleted projects are excluded from regular project queries

### 2. Trash View
- Users can view deleted projects in the "Trash" tab on the Dashboard
- Shows project details, deletion date, and days remaining until permanent deletion
- Visual indicators for projects nearing permanent deletion (color-coded warnings)

### 3. Recovery Options
- **Restore**: Moves project back to active state
- **Delete Forever**: Immediately and permanently deletes the project

### 4. Automatic Cleanup
- Background service runs daily to permanently delete projects older than 30 days
- Cleanup service starts automatically with the server

## API Endpoints

### Delete Project (Soft Delete)
```
DELETE /api/v1/projects/:projectId
```
Moves project to trash instead of permanent deletion.

### Get Deleted Projects
```
GET /api/v1/projects/trash
```
Returns all deleted projects for the authenticated user.

### Restore Project
```
PATCH /api/v1/projects/:projectId/restore
```
Restores a project from trash to active state.

### Permanent Delete
```
DELETE /api/v1/projects/:projectId/permanent
```
Permanently deletes a project (cannot be undone).

## Database Schema Changes

### Project Model Updates
```prisma
model Project {
  // ... existing fields
  isDeleted     Boolean         @default(false)
  deletedAt     DateTime?
  deletedBy     Int?
  
  @@index([isDeleted])
  @@index([deletedAt])
}
```

## Frontend Components

### 1. Dashboard Trash Tab
- New "Trash" tab in the main Dashboard
- Lists all deleted projects with recovery options
- Shows expiration countdown for each project

### 2. Updated Project Settings
- Delete button now performs soft delete
- Clear messaging about trash recovery period
- Confirmation dialog explains the recovery process

### 3. TrashModal Component
- Standalone modal for managing deleted projects
- Can be used in other parts of the application
- Handles restore and permanent delete operations

## User Experience

### Deletion Flow
1. User clicks "Delete Project" in project settings
2. Confirmation dialog explains trash recovery
3. Project is moved to trash (soft deleted)
4. User is redirected to dashboard
5. Project appears in "Trash" tab

### Recovery Flow
1. User navigates to "Trash" tab
2. Finds the project to recover
3. Clicks "Restore" button
4. Project is immediately restored to active state
5. Project reappears in main projects list

### Permanent Deletion
- Projects are automatically deleted after 30 days
- Users can manually delete forever from trash
- Both actions are irreversible

## Security Considerations

### Authorization
- Users can only delete/restore their own projects
- Project ownership is verified before any trash operations
- Deleted projects are filtered from regular queries

### Data Integrity
- Soft delete preserves all project data and relationships
- Related data (tasks, documents, etc.) remain intact during trash period
- Permanent deletion cascades to all related data

## Monitoring and Maintenance

### Cleanup Service
- Runs automatically every 24 hours
- Logs the number of projects permanently deleted
- Can be manually triggered if needed

### Database Indexes
- Optimized queries with indexes on `isDeleted` and `deletedAt`
- Efficient filtering of active vs deleted projects

## Future Enhancements

### Potential Improvements
1. **Bulk Operations**: Select multiple projects for restore/delete
2. **Extended Retention**: Configurable retention period per organization
3. **Audit Trail**: Detailed logging of all trash operations
4. **Email Notifications**: Warn users before automatic deletion
5. **Admin Override**: Allow admins to recover any project
6. **Export Before Delete**: Option to export project data before permanent deletion

### Analytics
- Track deletion patterns to improve UX
- Monitor recovery rates to optimize retention period
- Alert on unusual deletion activity