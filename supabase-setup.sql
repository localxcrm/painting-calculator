-- =========================================
-- SUPABASE SETUP FOR PAINTING CALCULATOR
-- Execute this in Supabase SQL Editor
-- =========================================

-- 1. Create companies table
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  status TEXT DEFAULT 'active',
  settings JSONB DEFAULT '{
    "defaultPricePerSq": 4.00,
    "defaultHourlyRate": 65,
    "defaultCommissionSales": 10,
    "defaultCommissionPM": 5,
    "defaultMaterialPercentage": 12,
    "defaultMarginPercentage": 25
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create user profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  full_name TEXT,
  role TEXT DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  project_name TEXT,
  project_data JSONB,
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Insert default company
INSERT INTO companies (name, domain, status, settings) VALUES (
  'Default Company',
  'default',
  'active',
  '{
    "defaultPricePerSq": 4.00,
    "defaultHourlyRate": 65,
    "defaultCommissionSales": 10,
    "defaultCommissionPM": 5,
    "defaultMaterialPercentage": 12,
    "defaultMarginPercentage": 25
  }'
);

-- 5. Function to automatically set first user as admin
CREATE OR REPLACE FUNCTION set_first_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if any admin exists
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE role = 'admin') THEN
    NEW.role = 'admin';
    -- Also assign to default company
    IF NEW.company_id IS NULL THEN
      NEW.company_id = (SELECT id FROM companies WHERE domain = 'default' LIMIT 1);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for first admin
CREATE TRIGGER trigger_set_first_admin
  BEFORE INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_first_admin();

-- 7. Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger for new user signup
CREATE TRIGGER trigger_handle_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 9. Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies for companies
CREATE POLICY "Admins can manage all companies" ON companies
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can view their company" ON companies
FOR SELECT USING (
  id = (SELECT company_id FROM user_profiles WHERE id = auth.uid())
);

-- 11. RLS Policies for user profiles
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can manage all profiles" ON user_profiles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 12. RLS Policies for projects
CREATE POLICY "Users can manage own company projects" ON projects
FOR ALL USING (
  company_id = (SELECT company_id FROM user_profiles WHERE id = auth.uid())
);

-- 13. Configure auth settings (disable email confirmation)
-- Note: These settings should be configured in Supabase Dashboard → Authentication → Settings
-- For now, we'll handle this in the application code

-- 14. Create indexes for performance
CREATE INDEX idx_user_profiles_company_id ON user_profiles(company_id);
CREATE INDEX idx_projects_company_id ON projects(company_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);

-- =========================================
-- SETUP COMPLETE!
--
-- Next steps:
-- 1. Update .env.local with your Supabase credentials
-- 2. Run: npm run dev
-- 3. Go to /login and create your first account
-- 4. You'll automatically become the admin user!
-- =========================================

-- =========================================
-- PATCH: Settings Page Support (idempotent)
-- Safe to run multiple times. This ensures the policies/columns
-- needed by the Settings page are present and secure.
-- =========================================

-- 0) Ensure required extension exists (for gen_random_uuid if needed)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Ensure settings columns exist and are non-null
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;
UPDATE user_profiles SET settings = '{}'::jsonb WHERE settings IS NULL;

-- 2) Harden user_profiles UPDATE policy with WITH CHECK to prevent cross-user writes
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 3) Ensure user can view own profile (create if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT
    USING (id = auth.uid());
  END IF;
END $$;

-- 4) Ensure users can view their company (create if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'companies'
      AND policyname = 'Users can view their company'
  ) THEN
    CREATE POLICY "Users can view their company" ON companies
    FOR SELECT
    USING (
      id = (SELECT company_id FROM user_profiles WHERE id = auth.uid())
    );
  END IF;
END $$;

-- 5) Optional: normalize default company's settings keys to match UI expectations
UPDATE companies
SET settings = jsonb_build_object(
  'defaultPricePerSq', 4.00,
  'defaultHourlyRate', 65,
  'defaultCommissionSales', 10,
  'defaultCommissionPM', 5,
  'defaultMaterialPercentage', 12,
  'defaultMarginPercentage', 25
)
WHERE domain = 'default';
