

-- Fix for the Users table RLS policy to enable anyone to insert users
DROP POLICY IF EXISTS "Anyone can insert users" ON public.users;
CREATE POLICY "Anyone can insert users" 
    ON public.users FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
CREATE POLICY "Users can update their own data" 
    ON public.users FOR UPDATE 
    USING (auth.uid() = id OR auth.uid() IS NULL);

-- Clean up any existing duplicate users - this helps recover from past issues
DELETE FROM public.users a
USING public.users b
WHERE a.id < b.id
AND LOWER(a.username) = LOWER(b.username);

-- Fix for duplicate usernames
-- First drop the constraint if it exists
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_username_unique;

-- Then add it back with proper configuration - using LOWER to make it case-insensitive
ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (LOWER(username));

-- Make sure the table is properly set up for realtime
ALTER TABLE public.users REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- Fix infinite recursion in the conversation_participants RLS policy
DROP POLICY IF EXISTS "Users can access their own conversations" ON public.conversation_participants;

-- Create a security definer function to check if a user is a participant
DROP FUNCTION IF EXISTS public.check_user_in_conversation;
CREATE OR REPLACE FUNCTION public.check_user_in_conversation(user_id UUID, conv_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = conv_id AND user_id = check_user_in_conversation.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a policy that uses the security definer function
CREATE POLICY "Users can access their own conversations" 
  ON public.conversation_participants 
  FOR ALL
  USING (
    user_id = auth.uid() OR 
    public.check_user_in_conversation(auth.uid(), conversation_id) OR
    auth.uid() IS NULL
  );

-- Make sure the table is properly set up for realtime
ALTER TABLE public.conversation_participants REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;

-- Add a policy to allow viewing messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations" 
  ON public.messages 
  FOR SELECT
  USING (
    public.check_user_in_conversation(auth.uid(), conversation_id) OR
    auth.uid() IS NULL
  );

-- Allow anonymous access for realtime tables
DROP POLICY IF EXISTS "Allow anonymous access" ON public.users;
CREATE POLICY "Allow anonymous access" 
  ON public.users
  FOR SELECT
  USING (true);

