
-- Fix for the Users table RLS policy to enable anyone to insert users
DROP POLICY IF EXISTS "Anyone can insert users" ON public.users;
CREATE POLICY "Anyone can insert users" 
    ON public.users FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
CREATE POLICY "Users can update their own data" 
    ON public.users FOR UPDATE 
    USING (true);

-- Fix for duplicate usernames
ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username);

-- Make sure the table is properly set up for realtime
ALTER TABLE public.users REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
