
# Supabase Setup for Chatwii

This guide will help you set up the Supabase backend for the Chatwii application.

## Steps to Set Up Supabase

1. **Create a Supabase Account**:
   - Go to [supabase.com](https://supabase.com) and sign up for an account if you don't have one.

2. **Create a New Project**:
   - From the Supabase dashboard, create a new project.
   - Choose a name for your project and set a secure database password.
   - Select a region closest to your users for better performance.

3. **Run the SQL Setup Script**:
   - Go to the SQL Editor in your Supabase project.
   - Open the file `supabase/init.sql` from this project.
   - Run the entire script to create all necessary tables, policies, and functions.

4. **Configure Authentication**:
   - Go to Authentication > Settings.
   - Configure the site URL to point to your application's domain.
   - For local development, set it to `http://localhost:5173` (Vite's default port).
   - Enable the authentication providers you want to use (Email, Google, etc.).

5. **Storage Setup** (for images and voice messages):
   - Go to Storage > Create a new bucket named `chatwii-media`.
   - Set the access level to private.
   - Create another bucket named `chatwii-profile-images` for profile pictures.

6. **Set Up Environment Variables**:
   - From your Supabase project dashboard, go to Project Settings > API.
   - Copy the Project URL and the anon/public key.
   - Create a `.env.local` file (or equivalent) in your project root with:
   
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

7. **Test the Connection**:
   - Start your application with the environment variables set.
   - Verify that the application can connect to Supabase and perform basic operations.

## Initial Data Setup (Optional)

To create some initial data for testing:

1. **Create an Admin User**:
   - You can create an admin user directly in the Supabase dashboard using SQL:
   
   ```sql
   INSERT INTO public.users (username, email, role, is_online)
   VALUES ('admin', 'admin@example.com', 'admin', true);
   ```

2. **Create Some Test Users**:
   - Add some test users for development:
   
   ```sql
   INSERT INTO public.users (username, gender, age, location, interests, is_online)
   VALUES 
     ('Alice', 'Female', 28, 'Australia', ARRAY['Art', 'Photography', 'Travel'], true),
     ('Bob', 'Male', 35, 'Canada', ARRAY['Music', 'Technology', 'Gaming'], false),
     ('Clara', 'Female', 24, 'United Kingdom', ARRAY['Fashion', 'Cooking', 'Sports'], true);
   ```

## Troubleshooting

- **RLS Issues**: If you're having problems with Row Level Security, make sure you're properly setting the user ID in your application code.
- **Connection Issues**: Double-check your environment variables and ensure they're being loaded correctly.
- **Auth Problems**: Make sure your site URL in the Supabase auth settings matches your actual application URL.

## Next Steps

After setting up Supabase, you should be able to:

1. Create user accounts
2. Send and receive real-time messages
3. Upload and share media
4. Block and report users
5. Manage administrative functions

Refer to the application code for more details on how these features are implemented.
