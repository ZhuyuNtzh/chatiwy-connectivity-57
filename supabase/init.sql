
-- Add to the end of your init.sql file

-- Fix for the Users RLS policy to enable anyone to insert users
DROP POLICY IF EXISTS "Anyone can insert users" ON public.users;
CREATE POLICY "Anyone can insert users" 
    ON public.users FOR INSERT 
    WITH CHECK (true);  -- This allows anyone to insert into the users table

DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
CREATE POLICY "Users can update their own data" 
    ON public.users FOR UPDATE 
    USING (true);  -- For this demo app, allow updates more freely

-- Make sure the table is publicly accessible
ALTER TABLE public.users REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
