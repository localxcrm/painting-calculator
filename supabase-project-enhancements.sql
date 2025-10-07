-- =========================================
-- PROJECT TABLE ENHANCEMENTS
-- Run this in Supabase SQL Editor to add missing columns
-- =========================================

-- Add missing columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS calculated_values JSONB;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(project_name);

-- Update existing RLS policy to be more specific
DROP POLICY IF EXISTS "Users can manage own company projects" ON projects;

-- Admins can manage all projects in their company
CREATE POLICY "Admins can manage all company projects" ON projects
FOR ALL USING (
  company_id = (SELECT company_id FROM user_profiles WHERE id = auth.uid())
  AND (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
);

-- Regular users can view their own projects
CREATE POLICY "Users can view own projects" ON projects
FOR SELECT USING (
  user_id = auth.uid()
  AND company_id = (SELECT company_id FROM user_profiles WHERE id = auth.uid())
);

-- Regular users can manage their own projects
CREATE POLICY "Users can manage own projects" ON projects
FOR ALL USING (
  user_id = auth.uid()
  AND company_id = (SELECT company_id FROM user_profiles WHERE id = auth.uid())
);

-- Create function to get user role for use in policies
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM user_profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
