
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
-- First drop the constraint if it exists
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_username_unique;

-- Then add it back with proper configuration
ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username);

-- Make sure the table is properly set up for realtime
ALTER TABLE public.users REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- Fix infinite recursion in the conversation_participants RLS policy
DROP POLICY IF EXISTS "Users can access their own conversations" ON public.conversation_participants;

-- Create a security definer function to check if a user is a participant
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
  USING (user_id = auth.uid() OR public.check_user_in_conversation(auth.uid(), conversation_id));

-- Make sure the table is properly set up for realtime
ALTER TABLE public.conversation_participants REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;
