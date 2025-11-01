-- Migration to update MemberRole enum from ADMIN to PROJECT_MANAGER
-- This migration updates the enum and existing data

-- First, add the new enum value
ALTER TYPE "MemberRole" ADD VALUE 'PROJECT_MANAGER';

-- Update existing ADMIN roles to PROJECT_MANAGER
UPDATE "ProjectMember" SET role = 'PROJECT_MANAGER' WHERE role = 'ADMIN';

-- Note: We cannot directly remove the ADMIN value from the enum in PostgreSQL
-- The old ADMIN value will remain in the enum but won't be used
-- If you need to completely remove it, you would need to:
-- 1. Create a new enum
-- 2. Update the column to use the new enum
-- 3. Drop the old enum
-- For now, we'll leave ADMIN in the enum but not use it

-- Verify the update
-- SELECT role, COUNT(*) FROM "ProjectMember" GROUP BY role;