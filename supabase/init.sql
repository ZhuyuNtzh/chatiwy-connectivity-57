
-- Setup Chatwii Schema
-- Run this SQL in your Supabase SQL Editor to set up all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'standard',
    gender TEXT,
    age INTEGER,
    location TEXT,
    interests TEXT[],
    is_online BOOLEAN NOT NULL DEFAULT false,
    last_active TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Conversation Participants Table
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
    sender_name TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_read BOOLEAN NOT NULL DEFAULT false,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    reply_to_id UUID REFERENCES public.messages(id),
    reply_text TEXT,
    is_image BOOLEAN NOT NULL DEFAULT false,
    image_url TEXT,
    is_blurred BOOLEAN NOT NULL DEFAULT false,
    is_voice_message BOOLEAN NOT NULL DEFAULT false,
    audio_url TEXT,
    translated_content TEXT,
    translated_language TEXT
);

-- Blocked Users Table
CREATE TABLE IF NOT EXISTS public.blocked_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id)
);

-- User Reports Table
CREATE TABLE IF NOT EXISTS public.user_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reporter_name TEXT NOT NULL,
    reported_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reported_name TEXT NOT NULL,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Banned Words Table
CREATE TABLE IF NOT EXISTS public.banned_words (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    word TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for improved query performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker_id ON public.blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked_id ON public.blocked_users(blocked_id);

-- Row Level Security Policies
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banned_words ENABLE ROW LEVEL SECURITY;

-- Users RLS policies
CREATE POLICY "Users are viewable by everyone" 
    ON public.users FOR SELECT 
    USING (true);

CREATE POLICY "Users can update their own data" 
    ON public.users FOR UPDATE 
    USING (auth.uid() = id);

-- Conversations RLS policies
CREATE POLICY "Conversations are viewable by participants" 
    ON public.conversations FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants 
            WHERE conversation_id = id AND user_id = auth.uid()
        )
    );

-- Conversation participants RLS policies
CREATE POLICY "Conversation participants are viewable by conversationalists" 
    ON public.conversation_participants FOR SELECT 
    USING (
        user_id = auth.uid() OR 
        conversation_id IN (
            SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()
        )
    );

-- Messages RLS policies
CREATE POLICY "Messages are viewable by participants" 
    ON public.messages FOR SELECT 
    USING (
        conversation_id IN (
            SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages into their conversations" 
    ON public.messages FOR INSERT 
    WITH CHECK (
        sender_id = auth.uid() AND
        conversation_id IN (
            SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own messages" 
    ON public.messages FOR UPDATE 
    USING (sender_id = auth.uid());

-- Blocked users RLS policies
CREATE POLICY "Users can view who they've blocked" 
    ON public.blocked_users FOR SELECT 
    USING (blocker_id = auth.uid());

CREATE POLICY "Users can block other users" 
    ON public.blocked_users FOR INSERT 
    WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "Users can unblock users they've blocked" 
    ON public.blocked_users FOR DELETE 
    USING (blocker_id = auth.uid());

-- Insert some demo data
INSERT INTO public.users (id, username, role, gender, age, location, interests, is_online)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Alice', 'standard', 'Female', 28, 'Australia', ARRAY['Art', 'Photography', 'Travel'], true),
  ('00000000-0000-0000-0000-000000000002', 'Bob', 'standard', 'Male', 35, 'Canada', ARRAY['Music', 'Technology', 'Gaming'], false),
  ('00000000-0000-0000-0000-000000000003', 'Clara', 'standard', 'Female', 24, 'United Kingdom', ARRAY['Fashion', 'Cooking', 'Sports'], true),
  ('00000000-0000-0000-0000-000000000004', 'David', 'standard', 'Male', 30, 'Germany', ARRAY['Books', 'Travel', 'Music'], true),
  ('00000000-0000-0000-0000-000000000005', 'Elena', 'standard', 'Female', 26, 'Spain', ARRAY['Dance', 'Languages', 'Cooking'], false),
  ('00000000-0000-0000-0000-000000000999', 'Admin', 'admin', 'Other', 35, 'Global', ARRAY['Moderation', 'Support', 'Communication'], true);

-- Permissions for anon and authenticated users
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
