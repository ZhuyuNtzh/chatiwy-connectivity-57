
# Supabase Setup for Chatwii

This guide will help you set up the Supabase backend for the Chatwii application.

## Required Environment Variables

For the application to connect to Supabase, you need to add these to your `.env` file:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Steps to Set Up Supabase

1. **Create a Supabase Account**:
   - Go to [supabase.com](https://supabase.com) and sign up for an account

2. **Create a New Project**:
   - From the Supabase dashboard, create a new project
   - Choose a name for your project and set a secure database password
   - Select a region closest to your users for better performance

3. **Database Setup**:
   - You've already created your database schema with all the necessary tables
   - If you need to recreate the tables, you can use the SQL script you've shared

4. **Get Connection Details**:
   - Go to Project Settings > API
   - Copy the "Project URL" and "anon/public" key
   - Add them to your `.env` file as shown above

5. **Configure Row Level Security (RLS)**:
   - Set up appropriate RLS policies for your tables
   - For public access tables like `user` and `message`, you might want to enable read access for all authenticated users
   - Example policy for messages:
     ```sql
     CREATE POLICY "Messages are viewable by sender and receiver"
     ON public.message
     FOR SELECT
     USING (
       auth.uid() = sender_id::text OR 
       auth.uid() = receiver_id::text
     );
     ```

6. **Enable Realtime**:
   - Go to Database > Replication
   - Enable Publication for the tables you want to track in real-time
   - At minimum, enable realtime for: `user`, `message`, `reaction`

7. **Storage Setup** (for images and voice messages):
   - Go to Storage > Create a new bucket named `chatwii-media`
   - Set the access level to private
   - Create appropriate policies to allow users to upload/download media
   - Example policy for authenticated uploads:
     ```sql
     CREATE POLICY "Allow authenticated uploads"
     ON storage.objects
     FOR INSERT
     TO authenticated
     WITH CHECK (bucket_id = 'chatwii-media');
     ```

## Troubleshooting

- **White Screen**: If you see a white screen, check browser console for errors. Common issues are:
  - Missing environment variables - check your `.env` file
  - CORS issues - make sure your Supabase project allows your frontend domain
  - Supabase connection failed - check network requests in DevTools

- **Database Issues**:
  - If database queries fail, make sure all tables were created with the init script
  - Check that Row Level Security (RLS) policies are correctly set up
  - Verify user authentication is working (check auth status in browser)

## Testing Your Connection

To verify your Supabase connection is working:

1. Open your browser's developer tools (F12)
2. Check the console for connection logs
3. Look for "Successfully connected to Supabase" message
4. If you see connection errors, double-check your environment variables

## Next Steps

After setting up Supabase, you should be able to:

1. Create user accounts
2. Send and receive real-time messages
3. Upload and share media
4. Use the moderation features
5. Manage profile information and interests

For more details, refer to the [Supabase documentation](https://supabase.com/docs).
