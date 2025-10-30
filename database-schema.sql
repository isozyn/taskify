-- ================================================================================
-- TASKIFY DATABASE SCHEMA
-- ================================================================================
-- Created: October 29, 2025
-- Database: Neon PostgreSQL
-- Purpose: Create all tables for Taskify Kanban application
-- ================================================================================

-- Drop existing tables if they exist (BE CAREFUL - this deletes data!)
-- Uncomment the lines below only if you need to start fresh
-- DROP TABLE IF EXISTS activity_log CASCADE;
-- DROP TABLE IF EXISTS comments CASCADE;
-- DROP TABLE IF EXISTS subtasks CASCADE;
-- DROP TABLE IF EXISTS task_assignees CASCADE;
-- DROP TABLE IF EXISTS project_members CASCADE;
-- DROP TABLE IF EXISTS tasks CASCADE;
-- DROP TABLE IF EXISTS columns CASCADE;
-- DROP TABLE IF EXISTS projects CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ================================================================================
-- 1. USERS TABLE
-- ================================================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    job_title VARCHAR(100),
    description TEXT,
    avatar VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================================
-- 2. PROJECTS TABLE
-- ================================================================================
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(20) NOT NULL CHECK (template_type IN ('auto-sync', 'custom')),
    invite_code VARCHAR(50) UNIQUE,
    start_date DATE,
    end_date DATE,
    visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'public')),
    owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================================
-- 3. COLUMNS TABLE (For Custom Workflow Only)
-- ================================================================================
CREATE TABLE IF NOT EXISTS columns (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    color VARCHAR(50) DEFAULT 'slate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================================
-- 4. TASKS TABLE
-- ================================================================================
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('backlog', 'upcoming', 'in-progress', 'review', 'complete')),
    column_id INTEGER REFERENCES columns(id) ON DELETE SET NULL,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    start_date DATE,
    end_date DATE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================================
-- 5. PROJECT MEMBERS TABLE
-- ================================================================================
CREATE TABLE IF NOT EXISTS project_members (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- ================================================================================
-- 6. TASK ASSIGNEES TABLE
-- ================================================================================
CREATE TABLE IF NOT EXISTS task_assignees (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, user_id)
);

-- ================================================================================
-- 7. SUBTASKS TABLE
-- ================================================================================
CREATE TABLE IF NOT EXISTS subtasks (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================================
-- 8. COMMENTS TABLE
-- ================================================================================
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================================
-- 9. ACTIVITY LOG TABLE
-- ================================================================================
CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ================================================================================

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_column_id ON tasks(column_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);

-- Columns indexes
CREATE INDEX IF NOT EXISTS idx_columns_project_id ON columns(project_id);
CREATE INDEX IF NOT EXISTS idx_columns_position ON columns(project_id, position);

-- Project members indexes
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);

-- Task assignees indexes
CREATE INDEX IF NOT EXISTS idx_task_assignees_task_id ON task_assignees(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_user_id ON task_assignees(user_id);

-- Activity log indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_project_id ON activity_log(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_template_type ON projects(template_type);

-- ================================================================================
-- INSERT TEST DATA
-- ================================================================================

-- Insert test users
INSERT INTO users (name, email, password, job_title, description) VALUES
('John Doe', 'john@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Product Manager', 'Experienced PM with 5+ years in tech'),
('Jane Smith', 'jane@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Lead Developer', 'Full-stack developer specializing in React and Node.js'),
('Mike Johnson', 'mike@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'UI/UX Designer', 'Creative designer passionate about user experience'),
('Sarah Wilson', 'sarah@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'QA Engineer', 'Quality assurance specialist ensuring bug-free releases')
ON CONFLICT (email) DO NOTHING;

-- Insert test project (auto-sync template)
INSERT INTO projects (name, description, template_type, invite_code, start_date, end_date, visibility, owner_id)
VALUES (
    'Website Redesign',
    'Complete overhaul of company website with modern design',
    'auto-sync',
    'INVITE123',
    '2025-01-01',
    '2025-03-31',
    'team',
    1
)
ON CONFLICT DO NOTHING;

-- Insert test project (custom template)
INSERT INTO projects (name, description, template_type, invite_code, start_date, end_date, visibility, owner_id)
VALUES (
    'Marketing Campaign',
    'Q1 2025 marketing initiatives and content creation',
    'custom',
    'INVITE456',
    '2025-01-15',
    '2025-04-15',
    'team',
    2
)
ON CONFLICT DO NOTHING;

-- Insert project members for first project
INSERT INTO project_members (project_id, user_id, role)
SELECT 1, id, CASE WHEN id = 1 THEN 'owner' ELSE 'member' END
FROM users WHERE id IN (1, 2, 3)
ON CONFLICT DO NOTHING;

-- Insert custom columns for custom workflow project (project id 2)
INSERT INTO columns (project_id, name, position, color) VALUES
(2, 'To Do', 0, 'blue'),
(2, 'In Progress', 1, 'yellow'),
(2, 'Done', 2, 'green')
ON CONFLICT DO NOTHING;

-- Insert test tasks for auto-sync project
INSERT INTO tasks (project_id, title, description, status, priority, progress, start_date, end_date, created_by)
VALUES 
(1, 'Design landing page mockup', 'Create high-fidelity mockups for the new landing page', 'in-progress', 'high', 65, '2025-01-10', '2025-01-20', 1),
(1, 'Implement authentication system', 'Build secure JWT-based authentication', 'upcoming', 'high', 0, '2025-02-01', '2025-02-15', 2),
(1, 'Write API documentation', 'Document all REST API endpoints', 'upcoming', 'medium', 0, '2025-02-20', '2025-03-05', 2)
ON CONFLICT DO NOTHING;

-- Insert test tasks for custom workflow project
INSERT INTO tasks (project_id, title, description, column_id, priority, progress, start_date, end_date, created_by)
SELECT 
    2,
    'Create social media content',
    'Design posts for Instagram and Twitter',
    c.id,
    'medium',
    40,
    '2025-01-20',
    '2025-02-10',
    3
FROM columns c WHERE c.project_id = 2 AND c.name = 'In Progress'
ON CONFLICT DO NOTHING;

-- Insert task assignees
INSERT INTO task_assignees (task_id, user_id)
SELECT t.id, u.id
FROM tasks t
CROSS JOIN users u
WHERE t.project_id = 1 AND u.id IN (1, 2)
LIMIT 3
ON CONFLICT DO NOTHING;

-- Insert test subtasks
INSERT INTO subtasks (task_id, title, completed, position)
SELECT id, 'Research competitor websites', false, 0 FROM tasks WHERE title = 'Design landing page mockup'
UNION ALL
SELECT id, 'Create wireframes', true, 1 FROM tasks WHERE title = 'Design landing page mockup'
UNION ALL
SELECT id, 'Design high-fidelity mockups', false, 2 FROM tasks WHERE title = 'Design landing page mockup'
ON CONFLICT DO NOTHING;

-- Insert test comments
INSERT INTO comments (task_id, user_id, content)
SELECT id, 2, 'Looking great! Can we make the header a bit larger?' 
FROM tasks WHERE title = 'Design landing page mockup' LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert test activity
INSERT INTO activity_log (project_id, user_id, action, target_type, target_id, description)
VALUES
(1, 1, 'created_task', 'task', 1, 'Created task "Design landing page mockup"'),
(1, 2, 'commented', 'task', 1, 'Added a comment on "Design landing page mockup"'),
(1, 1, 'updated_task', 'task', 1, 'Updated progress to 65%')
ON CONFLICT DO NOTHING;

-- ================================================================================
-- VERIFY INSTALLATION
-- ================================================================================

-- Check all tables were created
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Display data counts
SELECT 
    'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'columns', COUNT(*) FROM columns
UNION ALL
SELECT 'project_members', COUNT(*) FROM project_members
UNION ALL
SELECT 'task_assignees', COUNT(*) FROM task_assignees
UNION ALL
SELECT 'subtasks', COUNT(*) FROM subtasks
UNION ALL
SELECT 'comments', COUNT(*) FROM comments
UNION ALL
SELECT 'activity_log', COUNT(*) FROM activity_log;

-- ================================================================================
-- SUCCESS!
-- ================================================================================
-- If you see results above with no errors, the database is ready to use!
-- Share this with your backend teammate and start building the API.
-- ================================================================================
