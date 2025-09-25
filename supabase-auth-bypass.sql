-- =========================================
-- AUTH BYPASS: Direct User Creation
-- This allows creating users without Supabase Auth signup
-- =========================================

-- 1. Create a function to create users directly
CREATE OR REPLACE FUNCTION create_user_direct(
  user_email TEXT,
  user_name TEXT,
  user_role TEXT DEFAULT 'user',
  user_company_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Generate a new UUID for the user
  new_user_id := gen_random_uuid();
  
  -- Insert directly into user_profiles
  INSERT INTO user_profiles (
    id,
    full_name,
    role,
    company_id,
    is_active,
    settings
  ) VALUES (
    new_user_id,
    user_name,
    user_role,
    user_company_id,
    true,
    '{}'::jsonb
  );
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Grant execute permission
GRANT EXECUTE ON FUNCTION create_user_direct TO authenticated;

-- Success message
SELECT 'Direct user creation function created successfully!' as status;
