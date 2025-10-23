# Database Structure Design Prompt for Taskify Project Management System

## System Overview
Taskify is an executive-level project management platform that enables teams to collaborate on projects, manage tasks through Kanban boards, track timelines, and monitor team performance. The system requires a robust database structure to support user authentication, project management, task tracking, team collaboration, notifications, and activity logging.

## Core Requirements

### 1. User Management
- User profiles with authentication credentials
- User roles and permissions (Admin, Manager, Member, Viewer)
- Personal information (name, email, job title, bio, avatar)
- User preferences and settings
- Account status (active, suspended, deleted)
- Email verification and password reset tokens
- Login history and session management

### 2. Project Management
- Project creation with metadata (name, description, dates)
- Project status tracking (Planning, Active, On Hold, Completed, Archived)
- Project visibility (Public, Private, Team-only)
- Project ownership and creation tracking
- Project statistics (tasks, members, progress)
- Project settings and configurations
- Project archives and soft delete capability

### 3. Task Management
- Task creation with comprehensive details
- Task properties:
  - Title and description
  - Status (Backlog, Upcoming, In Progress, Review, Complete)
  - Priority (Low, Medium, High, Critical)
  - Start and due dates
  - Time estimates and actual time spent
  - Progress percentage (0-100%)
  - Labels/tags for categorization
- Task assignments (single or multiple team members)
- Task dependencies and subtasks
- Task attachments and files
- Task comments and discussions
- Task history and audit trail

### 4. Team Management
- Project team memberships
- Team member roles within projects (Owner, Admin, Member, Viewer)
- Member invitation system with pending/accepted status
- Team member activity tracking
- Member join/leave dates
- Permission levels per project

### 5. Collaboration Features
- Comments on tasks with threading
- @mentions of team members
- File attachments with metadata (name, size, type, URL)
- Activity feed for projects and tasks
- Real-time notifications
- Task watchers (users following specific tasks)

### 6. Notifications System
- Notification types (mention, assignment, comment, deadline, status_change)
- Read/unread status
- Notification preferences per user
- Email notification settings
- In-app notification delivery
- Notification grouping and batching

### 7. Activity Logging
- Comprehensive audit trail for all actions
- Activity types (create, update, delete, assign, comment, complete)
- Actor (who performed the action)
- Target (what was affected)
- Timestamp and metadata
- Activity filtering and search

### 8. Analytics & Reporting
- Project statistics (completion rates, velocity)
- User productivity metrics
- Task completion trends
- Time tracking data
- Team performance indicators
- Custom dashboard metrics

## Database Design Requirements

### Technical Specifications
1. **Database Type**: Choose between:
   - PostgreSQL (recommended for complex relationships and ACID compliance)
   - MongoDB (for flexibility and document-oriented data)
   - MySQL/MariaDB (for traditional relational approach)

2. **Schema Design Principles**:
   - Normalized structure to reduce redundancy
   - Appropriate indexes for query performance
   - Foreign key constraints for data integrity
   - Soft deletes for data recovery
   - Timestamp tracking (created_at, updated_at, deleted_at)
   - UUID or auto-increment primary keys

3. **Relationship Types Needed**:
   - One-to-Many: User → Projects (created by), Project → Tasks
   - Many-to-Many: Users ↔ Projects (team members), Users ↔ Tasks (assignees), Tasks ↔ Labels
   - One-to-One: User → UserPreferences
   - Self-referencing: Tasks → Tasks (subtasks/dependencies)

4. **Data Constraints**:
   - Email uniqueness and format validation
   - Required fields (non-nullable)
   - Enum types for status, priority, role fields
   - Date validations (start_date < due_date)
   - String length limits
   - Cascading deletes where appropriate

5. **Performance Optimization**:
   - Indexes on frequently queried columns (user_id, project_id, status, created_at)
   - Full-text search indexes for titles and descriptions
   - Composite indexes for common query patterns
   - Efficient pagination support
   - Caching strategy considerations

## Required Tables/Collections

### Core Tables
1. **users** - User accounts and profiles
2. **projects** - Project information and metadata
3. **tasks** - Task details and tracking
4. **project_members** - Team membership and roles
5. **task_assignees** - Task assignments (many-to-many)
6. **comments** - Comments on tasks
7. **attachments** - File attachments for tasks
8. **notifications** - User notifications
9. **activities** - Activity logs and audit trail
10. **labels** - Task categorization labels
11. **task_labels** - Many-to-many relationship for task labels
12. **task_dependencies** - Task dependencies and blocking relationships
13. **user_preferences** - User settings and preferences
14. **invitations** - Project invitation management
15. **sessions** - User session management for authentication

## Sample Data Requirements

### Users
- At least 5 sample users with different roles
- Mix of active and inactive accounts
- Varied job titles and departments

### Projects
- 3-5 sample projects in different statuses
- Projects with varying team sizes (2-10 members)
- Different visibility levels
- Projects at various completion stages

### Tasks
- 20-30 sample tasks distributed across projects
- Tasks in all status columns (Backlog through Complete)
- Various priority levels
- Mix of assigned and unassigned tasks
- Tasks with different completion percentages
- Some tasks with multiple assignees
- Tasks with comments and attachments

### Activities & Notifications
- Recent activity logs for all projects
- Mix of read and unread notifications
- Various notification types

## Relationships to Define

1. **User ↔ Project**:
   - A user can create many projects (one-to-many)
   - A user can be a member of many projects (many-to-many through project_members)
   - A project has one creator/owner (many-to-one)
   - A project has many team members (many-to-many through project_members)

2. **Project ↔ Task**:
   - A project contains many tasks (one-to-many)
   - A task belongs to one project (many-to-one)

3. **User ↔ Task**:
   - A user can be assigned to many tasks (many-to-many through task_assignees)
   - A task can have multiple assignees (many-to-many through task_assignees)
   - A user creates many tasks (one-to-many)

4. **Task ↔ Comment**:
   - A task has many comments (one-to-many)
   - A comment belongs to one task (many-to-one)
   - A user authors many comments (one-to-many)

5. **Task ↔ Attachment**:
   - A task can have many attachments (one-to-many)
   - An attachment belongs to one task (many-to-one)

6. **Task ↔ Label**:
   - A task can have many labels (many-to-many through task_labels)
   - A label can be applied to many tasks (many-to-many through task_labels)

7. **Task ↔ Task** (Dependencies):
   - A task can depend on many tasks (self-referencing many-to-many)
   - A task can block many tasks (self-referencing many-to-many)

## Key Fields by Table

### users
- id (PK), email (unique), password_hash, first_name, last_name, job_title, bio, avatar_url, role, status, email_verified, created_at, updated_at, last_login_at, deleted_at

### projects
- id (PK), name, description, creator_id (FK), status, visibility, start_date, end_date, progress_percentage, color, created_at, updated_at, deleted_at

### tasks
- id (PK), project_id (FK), creator_id (FK), title, description, status, priority, start_date, due_date, estimated_hours, actual_hours, progress_percentage, position (for ordering), created_at, updated_at, completed_at, deleted_at

### project_members
- id (PK), project_id (FK), user_id (FK), role, status (invited/active), invited_by (FK), joined_at, left_at, created_at, updated_at

### task_assignees
- id (PK), task_id (FK), user_id (FK), assigned_by (FK), assigned_at, created_at

### comments
- id (PK), task_id (FK), user_id (FK), content, parent_comment_id (FK, for threading), created_at, updated_at, deleted_at

### attachments
- id (PK), task_id (FK), uploaded_by (FK), filename, file_size, mime_type, storage_url, created_at, deleted_at

### notifications
- id (PK), user_id (FK), type, title, message, related_entity_type, related_entity_id, is_read, read_at, created_at

### activities
- id (PK), user_id (FK), project_id (FK), task_id (FK, nullable), action_type, entity_type, entity_id, changes (JSON/JSONB), ip_address, created_at

### labels
- id (PK), project_id (FK), name, color, created_at

### task_labels
- id (PK), task_id (FK), label_id (FK), created_at

### task_dependencies
- id (PK), task_id (FK), depends_on_task_id (FK), dependency_type (blocks/blocked_by), created_at

## Query Patterns to Optimize For

1. **Dashboard Queries**:
   - Get all projects for a user with stats
   - Get recent activities across all user's projects
   - Get task counts by status for projects
   - Get upcoming deadlines for user's assigned tasks

2. **Project Queries**:
   - Get project with all team members and their roles
   - Get all tasks for a project grouped by status
   - Get project timeline with task start/end dates
   - Get project activity feed

3. **Task Queries**:
   - Get task with assignees, comments, and attachments
   - Get all tasks assigned to a user
   - Get overdue tasks
   - Search tasks by title/description
   - Get task dependencies

4. **User Queries**:
   - Get user profile with statistics
   - Get user's projects and task assignments
   - Get user's notifications (unread count)
   - Get user activity history

5. **Analytics Queries**:
   - Task completion rate by project
   - User productivity metrics
   - Project progress over time
   - Team performance statistics

## Security Considerations

1. **Data Protection**:
   - Password hashing (bcrypt with salt)
   - Sensitive data encryption at rest
   - Row-level security for multi-tenant data
   - API key/token storage for integrations

2. **Access Control**:
   - User role-based permissions
   - Project-level access control
   - Task visibility based on project membership
   - Audit trail for sensitive operations

3. **Data Integrity**:
   - Foreign key constraints
   - Check constraints for valid enum values
   - Unique constraints where needed
   - Transaction support for multi-step operations

## Migration Strategy

1. Initial schema creation with all tables
2. Seed data for development/testing
3. Versioned migrations for schema changes
4. Rollback procedures for failed migrations
5. Data backup strategy before migrations

## Output Format Requested

Please provide:
1. **Complete ERD (Entity Relationship Diagram)** showing all tables and relationships
2. **Detailed schema** for each table with:
   - Column names and data types
   - Primary keys and foreign keys
   - Indexes and constraints
   - Default values
3. **SQL DDL statements** (CREATE TABLE) for PostgreSQL or your chosen database
4. **Sample data** in SQL INSERT statements or JSON format
5. **Index creation statements** for performance optimization
6. **Documentation** of key design decisions and trade-offs

## Additional Notes

- This system will eventually support real-time collaboration (WebSocket/Socket.io)
- File attachments will be stored externally (AWS S3/Cloudinary) with URLs in database
- Email notifications will be queued and sent asynchronously
- Consider partitioning strategy for large activity logs
- Plan for data archival of old projects/tasks
- Support for soft deletes across all main tables for data recovery

---

**Target Database**: PostgreSQL 14+ (recommended)  
**Expected Scale**: 1,000+ users, 10,000+ projects, 100,000+ tasks  
**Performance Target**: <100ms for 95% of queries  
**Backup Frequency**: Daily with point-in-time recovery capability
