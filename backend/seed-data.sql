-- Taskify Mock Data Seed Script
-- This script seeds test data into the Neon PostgreSQL database
-- Run this after running migrations: psql -h your-neon-host -U postgres -d neondb -f seed-data.sql

-- ============================================
-- 1. SEED USERS
-- ============================================
-- Password hashing note: These use bcrypt hashes
-- Password for all test users: "password123"
-- Hash: $2b$10$8DY8G8aeK9n5WDX5R5ZUC.NE5lVZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z

INSERT INTO "User" (name, email, username, password, role, "isEmailVerified", "createdAt", "updatedAt")
VALUES 
  (
    'Byron Young',
    'devbybyron@gmail.com',
    'byron',
    '$2b$10$8DY8G8aeK9n5WDX5R5ZUC.NE5lVZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z',
    'USER',
    true,
    NOW(),
    NOW()
  ),
  (
    'Alice Johnson',
    'alice@taskify.com',
    'alice',
    '$2b$10$8DY8G8aeK9n5WDX5R5ZUC.NE5lVZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z',
    'USER',
    true,
    NOW(),
    NOW()
  ),
  (
    'Bob Smith',
    'bob@taskify.com',
    'bob',
    '$2b$10$8DY8G8aeK9n5WDX5R5ZUC.NE5lVZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z',
    'USER',
    true,
    NOW(),
    NOW()
  ),
  (
    'Charlie Brown',
    'charlie@taskify.com',
    'charlie',
    '$2b$10$8DY8G8aeK9n5WDX5R5ZUC.NE5lVZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z',
    'USER',
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 2. GET USER IDS FOR REFERENCE
-- ============================================
-- Note: Adjust these based on actual user IDs in your database
-- Run this query first to see the actual IDs:
-- SELECT id, name, email FROM "User" WHERE email IN ('byron@taskify.com', 'alice@taskify.com', 'bob@taskify.com', 'charlie@taskify.com');

-- Store user IDs (example - adjust based on your actual IDs)
-- Byron: 1, Alice: 2, Bob: 3, Charlie: 4

-- ============================================
-- 3. SEED PROJECTS
-- ============================================
INSERT INTO "Project" (title, description, "ownerId", status, "workflowType", color, "createdAt", "updatedAt")
VALUES 
  (
    'Website Redesign',
    'Complete redesign of the company website with modern UI/UX',
    1, -- Byron is the owner
    'ACTIVE',
    'CUSTOM',
    '#3B82F6',
    NOW(),
    NOW()
  ),
  (
    'Mobile App Development',
    'Build a native mobile app for iOS and Android',
    1, -- Byron is the owner
    'ACTIVE',
    'CUSTOM',
    '#8B5CF6',
    NOW(),
    NOW()
  ),
  (
    'Marketing Campaign Q4',
    'Launch Q4 marketing campaign and track results',
    2, -- Alice is the owner
    'ACTIVE',
    'AUTOMATED',
    '#EC4899',
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. SEED PROJECT MEMBERS
-- ============================================
-- Add team members to projects
-- Project 1: Website Redesign (owner: Byron)
INSERT INTO "ProjectMember" ("projectId", "userId", role, "joinedAt")
VALUES 
  (1, 2, 'MEMBER', NOW()),      -- Alice joins Website Redesign
  (1, 3, 'PROJECT_MANAGER', NOW()), -- Bob joins as PM on Website Redesign
  (1, 4, 'MEMBER', NOW())       -- Charlie joins Website Redesign
ON CONFLICT ("projectId", "userId") DO NOTHING;

-- Project 2: Mobile App Development (owner: Byron)
INSERT INTO "ProjectMember" ("projectId", "userId", role, "joinedAt")
VALUES 
  (2, 2, 'PROJECT_MANAGER', NOW()), -- Alice joins as PM on Mobile App
  (2, 3, 'MEMBER', NOW()),      -- Bob joins Mobile App
  (2, 4, 'MEMBER', NOW())       -- Charlie joins Mobile App
ON CONFLICT ("projectId", "userId") DO NOTHING;

-- Project 3: Marketing Campaign Q4 (owner: Alice)
INSERT INTO "ProjectMember" ("projectId", "userId", role, "joinedAt")
VALUES 
  (3, 1, 'MEMBER', NOW()),      -- Byron joins Marketing Campaign
  (3, 3, 'MEMBER', NOW()),      -- Bob joins Marketing Campaign
  (3, 4, 'PROJECT_MANAGER', NOW()) -- Charlie joins as PM on Marketing Campaign
ON CONFLICT ("projectId", "userId") DO NOTHING;

-- ============================================
-- 5. SEED CONVERSATIONS
-- ============================================
-- Create conversations for Project 1 (Website Redesign)
INSERT INTO "Conversation" (name, type, "projectId", "createdAt", "updatedAt")
VALUES 
  ('Website Redesign General', 'GROUP', 1, NOW(), NOW()),
  ('Frontend Team', 'GROUP', 1, NOW(), NOW()),
  ('Byron & Alice Chat', 'DIRECT', 1, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create conversations for Project 2 (Mobile App Development)
INSERT INTO "Conversation" (name, type, "projectId", "createdAt", "updatedAt")
VALUES 
  ('Mobile App General', 'GROUP', 2, NOW(), NOW()),
  ('iOS Development', 'GROUP', 2, NOW(), NOW()),
  ('Android Development', 'GROUP', 2, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create conversations for Project 3 (Marketing Campaign Q4)
INSERT INTO "Conversation" (name, type, "projectId", "createdAt", "updatedAt")
VALUES 
  ('Marketing Team Chat', 'GROUP', 3, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. SEED CONVERSATION MEMBERS
-- ============================================
-- Add members to Website Redesign conversations
-- Conversation 1: Website Redesign General
INSERT INTO "ConversationMember" ("conversationId", "userId", "joinedAt", "lastReadAt")
VALUES 
  (1, 1, NOW(), NOW()),  -- Byron
  (1, 2, NOW(), NOW()),  -- Alice
  (1, 3, NOW(), NOW()),  -- Bob
  (1, 4, NOW(), NOW())   -- Charlie
ON CONFLICT ("conversationId", "userId") DO NOTHING;

-- Conversation 2: Frontend Team
INSERT INTO "ConversationMember" ("conversationId", "userId", "joinedAt", "lastReadAt")
VALUES 
  (2, 1, NOW(), NOW()),  -- Byron
  (2, 2, NOW(), NOW()),  -- Alice
  (2, 3, NOW(), NOW())   -- Bob
ON CONFLICT ("conversationId", "userId") DO NOTHING;

-- Conversation 3: Byron & Alice Chat (Direct)
INSERT INTO "ConversationMember" ("conversationId", "userId", "joinedAt", "lastReadAt")
VALUES 
  (3, 1, NOW(), NOW()),  -- Byron
  (3, 2, NOW(), NOW())   -- Alice
ON CONFLICT ("conversationId", "userId") DO NOTHING;

-- Add members to Mobile App conversations
-- Conversation 4: Mobile App General
INSERT INTO "ConversationMember" ("conversationId", "userId", "joinedAt", "lastReadAt")
VALUES 
  (4, 1, NOW(), NOW()),  -- Byron
  (4, 2, NOW(), NOW()),  -- Alice
  (4, 3, NOW(), NOW()),  -- Bob
  (4, 4, NOW(), NOW())   -- Charlie
ON CONFLICT ("conversationId", "userId") DO NOTHING;

-- Conversation 5: iOS Development
INSERT INTO "ConversationMember" ("conversationId", "userId", "joinedAt", "lastReadAt")
VALUES 
  (5, 2, NOW(), NOW()),  -- Alice
  (5, 3, NOW(), NOW())   -- Bob
ON CONFLICT ("conversationId", "userId") DO NOTHING;

-- Conversation 6: Android Development
INSERT INTO "ConversationMember" ("conversationId", "userId", "joinedAt", "lastReadAt")
VALUES 
  (6, 2, NOW(), NOW()),  -- Alice
  (6, 4, NOW(), NOW())   -- Charlie
ON CONFLICT ("conversationId", "userId") DO NOTHING;

-- Add members to Marketing Campaign conversation
-- Conversation 7: Marketing Team Chat
INSERT INTO "ConversationMember" ("conversationId", "userId", "joinedAt", "lastReadAt")
VALUES 
  (7, 1, NOW(), NOW()),  -- Byron
  (7, 2, NOW(), NOW()),  -- Alice
  (7, 3, NOW(), NOW()),  -- Bob
  (7, 4, NOW(), NOW())   -- Charlie
ON CONFLICT ("conversationId", "userId") DO NOTHING;

-- ============================================
-- 7. SEED MESSAGES
-- ============================================
-- Add sample messages to Website Redesign General conversation
INSERT INTO "Message" ("conversationId", "senderId", content, "isEdited", "createdAt", "updatedAt")
VALUES 
  (1, 1, 'Hey team! Let''s kick off the website redesign. I''ve prepared a design mockup.', false, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
  (1, 2, 'Great! I''ve reviewed the mockups. The color scheme looks amazing! 🎨', false, NOW() - INTERVAL '1 hour 50 minutes', NOW() - INTERVAL '1 hour 50 minutes'),
  (1, 3, 'I can start working on the responsive design for mobile. Should we use Tailwind CSS?', false, NOW() - INTERVAL '1 hour 30 minutes', NOW() - INTERVAL '1 hour 30 minutes'),
  (1, 1, 'Yes, Tailwind CSS is perfect for this project. Let''s also implement dark mode support.', false, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
  (1, 4, 'I can help with the dark mode implementation. Count me in! 👍', false, NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '45 minutes');

-- Add sample messages to Frontend Team conversation
INSERT INTO "Message" ("conversationId", "senderId", content, "isEdited", "createdAt", "updatedAt")
VALUES 
  (2, 1, 'Frontend team, let''s sync up on the component library setup.', false, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
  (2, 2, 'I started setting up Storybook for component documentation.', false, NOW() - INTERVAL '55 minutes', NOW() - INTERVAL '55 minutes'),
  (2, 3, 'Great! I''ll work on creating the base components next.', false, NOW() - INTERVAL '50 minutes', NOW() - INTERVAL '50 minutes');

-- Add sample messages to Direct conversation (Byron & Alice)
INSERT INTO "Message" ("conversationId", "senderId", content, "isEdited", "createdAt", "updatedAt")
VALUES 
  (3, 1, 'Hi Alice! How are the design revisions coming along?', false, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),
  (3, 2, 'Hi Byron! Almost done. I''ll send them over by end of day.', false, NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '25 minutes'),
  (3, 1, 'Perfect! No rush. Let''s review them together tomorrow.', false, NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '20 minutes');

-- Add sample messages to Mobile App General conversation
INSERT INTO "Message" ("conversationId", "senderId", content, "isEdited", "createdAt", "updatedAt")
VALUES 
  (4, 1, 'Mobile app project is officially live! Let''s build something amazing together.', false, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
  (4, 2, 'Excited to get started! I''ve set up the React Native environment.', false, NOW() - INTERVAL '2 hours 50 minutes', NOW() - INTERVAL '2 hours 50 minutes'),
  (4, 3, 'I''m working on the backend API. Should be ready by end of week.', false, NOW() - INTERVAL '2 hours 30 minutes', NOW() - INTERVAL '2 hours 30 minutes'),
  (4, 4, 'I can handle the database schema design. Let me know what we need!', false, NOW() - INTERVAL '2 hours 10 minutes', NOW() - INTERVAL '2 hours 10 minutes');

-- ============================================
-- 8. VERIFICATION QUERIES
-- ============================================
-- Run these queries to verify the data was seeded correctly:
/*

-- Check all users
SELECT id, name, email, username FROM "User" ORDER BY id;

-- Check all projects
SELECT id, title, "ownerId" FROM "Project" ORDER BY id;

-- Check project members
SELECT pm.id, pm."projectId", pm."userId", pm.role, u.name 
FROM "ProjectMember" pm
JOIN "User" u ON pm."userId" = u.id
ORDER BY pm."projectId", pm."userId";

-- Check conversations
SELECT id, name, type, "projectId" FROM "Conversation" ORDER BY id;

-- Check conversation members
SELECT cm.id, cm."conversationId", cm."userId", u.name
FROM "ConversationMember" cm
JOIN "User" u ON cm."userId" = u.id
ORDER BY cm."conversationId", cm."userId";

-- Check messages
SELECT m.id, m."conversationId", m."senderId", u.name, m.content, m."createdAt"
FROM "Message" m
JOIN "User" u ON m."senderId" = u.id
ORDER BY m."createdAt" DESC;

*/

-- ============================================
-- END OF SEED SCRIPT
-- ============================================
