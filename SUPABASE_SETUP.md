
# Supabase Setup for Chatwii

This guide will help you set up the Supabase backend for the Chatwii application.

## Required Environment Variables

For the application to connect to Supabase, you need to add these to your `.env.local` file:

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

3. **Run the SQL Setup Script**:
   - Go to the SQL Editor in your Supabase project
   - Copy the contents of `supabase/init.sql` from this project
   - Paste it into the SQL Editor and run the entire script
   - This will create all necessary tables, indexes, and RLS policies

4. **Get Connection Details**:
   - Go to Project Settings > API
   - Copy the "Project URL" and "anon/public" key
   - Add them to your `.env.local` file as shown above

5. **Configure Authentication** (if needed):
   - Go to Authentication > Settings
   - Configure the site URL to point to your application's domain
   - For local development, set it to `http://localhost:5173` (Vite's default port)
   - Enable the authentication providers you want to use (Email, Google, etc.)

6. **Storage Setup** (for images and voice messages):
   - Go to Storage > Create a new bucket named `chatwii-media`
   - Set the access level to private
   - Create another bucket named `chatwii-profile-images` for profile pictures

## Troubleshooting

- **White Screen**: If you see a white screen, check browser console for errors. Common issues are:
  - Missing environment variables - check your `.env.local` file
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
4. Block and report users
5. Manage administrative functions

For more details, refer to the [Supabase documentation](https://supabase.com/docs).
