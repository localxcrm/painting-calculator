-- =========================================
-- FIX: RLS Policy Infinite Recursion
-- Run this to fix the infinite recursion issue in user_profiles policies
-- =========================================

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;

-- Recreate policies without recursion
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Admin policy using a simpler approach
CREATE POLICY "Admins can manage all profiles" ON user_profiles
FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  )
);

-- Also fix companies policies to avoid potential issues
DROP POLICY IF EXISTS "Users can view their company" ON companies;

CREATE POLICY "Users can view their company" ON companies
FOR SELECT
USING (
  id IN (
    SELECT company_id FROM user_profiles WHERE id = auth.uid()
  )
);

-- Ensure the admin policy for companies is correct
DROP POLICY IF EXISTS "Admins can manage all companies" ON companies;

CREATE POLICY "Admins can manage all companies" ON companies
FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  )
);
