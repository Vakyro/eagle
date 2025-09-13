-- Quick Fix: Disable Row Level Security for Development
-- Run this in your Supabase SQL editor to allow user registration

-- Disable RLS on all tables temporarily for development
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE establishments DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE queue_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE queue_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- Alternatively, if you want to keep RLS but allow public registration, use this instead:
-- CREATE POLICY "Allow public user registration" ON users
--   FOR INSERT WITH CHECK (true);

-- CREATE POLICY "Allow public establishment registration" ON establishments
--   FOR INSERT WITH CHECK (true);

SELECT 'RLS disabled successfully - users can now register!' as status;