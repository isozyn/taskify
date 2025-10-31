-- Migration: Add workflow support to Taskify
-- Date: 2025-10-30

-- Add workflowType to Projects table
ALTER TABLE "Projects" 
ADD COLUMN IF NOT EXISTS "workflowType" VARCHAR(20) CHECK ("workflowType" IN ('CUSTOM', 'AUTOMATED')) DEFAULT 'CUSTOM';

-- Add columnId to Tasks table for custom workflow
ALTER TABLE "Tasks" 
ADD COLUMN IF NOT EXISTS "columnId" VARCHAR(50);

-- Add startDate to Tasks table
ALTER TABLE "Tasks" 
ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP;

-- Rename dueDate to endDate for clarity
DO $$ 
BEGIN
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='Tasks' AND column_name='dueDate') THEN
    ALTER TABLE "Tasks" RENAME COLUMN "dueDate" TO "endDate";
  END IF;
END $$;

-- Create CustomColumns table
CREATE TABLE IF NOT EXISTS "CustomColumns" (
  "id" SERIAL PRIMARY KEY,
  "projectId" INTEGER NOT NULL REFERENCES "Projects"("id") ON DELETE CASCADE,
  "title" VARCHAR(100) NOT NULL,
  "color" VARCHAR(50) NOT NULL DEFAULT 'slate',
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS "idx_custom_columns_project" ON "CustomColumns"("projectId");
CREATE INDEX IF NOT EXISTS "idx_tasks_column" ON "Tasks"("columnId");
CREATE INDEX IF NOT EXISTS "idx_tasks_project" ON "Tasks"("projectId");

-- Add trigger to update updatedAt on CustomColumns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_custom_columns_updated_at BEFORE UPDATE ON "CustomColumns"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
