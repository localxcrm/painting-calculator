-- =========================================
-- REMOVE FOREIGN KEY CONSTRAINT
-- This removes the problematic foreign key constraint
-- =========================================

-- 1. Drop the foreign key constraint that's causing the issue
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- 2. Also drop any other auth-related constraints
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_pkey;

-- 3. Recreate primary key without foreign key reference
ALTER TABLE user_profiles ADD PRIMARY KEY (id);

-- 4. Make sure the id column is UUID type
ALTER TABLE user_profiles ALTER COLUMN id TYPE UUID USING id::UUID;

-- Success message
SELECT 'Foreign key constraint removed! User creation should now work.' as status;
