-- Create user_role enum type
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'sales');
    END IF;
END $$;

-- Drop default before altering type
ALTER TABLE profiles ALTER COLUMN role DROP DEFAULT;

-- Update profiles.role column type
ALTER TABLE profiles 
ALTER COLUMN role TYPE user_role 
USING (
  CASE 
    WHEN role = 'admin' THEN 'admin'::user_role 
    ELSE 'sales'::user_role 
  END
);

-- Set new default value
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'sales'::user_role;
