-- =========================================
-- CLEAN FIX: User Creation Issues
-- This version handles existing policies properly
-- =========================================

-- 1. Ensure user_profiles table has all required columns
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- 2. Drop ALL existing RLS policies (including the ones that exist)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON user_profiles;

-- 3. Create new simple policies with unique names
CREATE POLICY "user_profiles_select_policy" ON user_profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "user_profiles_insert_policy" ON user_profiles
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "user_profiles_update_policy" ON user_profiles
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Fix companies table policies too
DROP POLICY IF EXISTS "Users can view their company" ON companies;
DROP POLICY IF EXISTS "Admins can manage all companies" ON companies;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON companies;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON companies;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON companies;

CREATE POLICY "companies_select_policy" ON companies
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "companies_insert_policy" ON companies
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "companies_update_policy" ON companies
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Update the handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name, role, is_active)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'user',
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Recreate the trigger
DROP TRIGGER IF EXISTS trigger_handle_new_user ON auth.users;
CREATE TRIGGER trigger_handle_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 7. Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON companies TO authenticated;

-- Success message
SELECT 'User creation fix applied successfully!' as status;
