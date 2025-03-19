
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { initializeSupabase } from '@/lib/supabase';
import { setupConnectionHeartbeat, enableRealtimeForChat } from '@/lib/supabase/realtime';
import { registerUser, updateUserOnlineStatus } from '@/lib/supabase/users';
import { isUsernameTaken, getUserByUsername } from '@/lib/supabase/users/userQueries';
import { generateUniqueUUID } from '@/lib/supabase/utils';

interface UseSupabaseConnectionProps {
  userId: number | string;
  username: string;
  service: any;
  key?: number; // Optional key to force re-execution
}

export const useSupabaseConnection = ({ userId, username, service, key = 0 }: UseSupabaseConnectionProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionReady, setConnectionReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [usernameTaken, setUsernameTaken] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const maxRetries = 5;

  useEffect(() => {
    // Reset states when key changes
    setIsLoading(true);
    setConnectionReady(false);
    setUsernameTaken(false);
    setValidationError(null);

    // Check for existing session
    const existingUUID = localStorage.getItem('userUUID');
    const existingUsername = localStorage.getItem('username');
    
    const connectToSupabase = async () => {
      setIsLoading(true);
      setUsernameTaken(false);
      setValidationError(null);
      
      try {
        // Validate that username is provided
        if (!username || username.trim() === '') {
          console.error("Username is empty or invalid");
          setValidationError("Please provide a valid username");
          setIsLoading(false);
          return;
        }
        
        const normalizedUsername = username.trim();
        console.log(`Attempting to connect with username: ${normalizedUsername}`);
        
        // First initialize Supabase to make sure connection is working
        const isConnected = await initializeSupabase();
        if (!isConnected) {
          throw new Error("Failed to initialize Supabase connection");
        }
        
        // Create a stable UUID for this user
        // If we already have a UUID in localStorage and username hasn't changed, use it
        let stableId = existingUUID;
        let shouldCheckUsername = true;
        
        // If we have an existing UUID and username matches, skip username check
        if (existingUUID && existingUsername === normalizedUsername) {
          console.log(`Using existing UUID ${existingUUID} for username ${normalizedUsername}`);
          shouldCheckUsername = false;
        } else {
          // Generate a new UUID for new users or changed usernames
          stableId = generateUniqueUUID();
          console.log(`Generated new UUID ${stableId} for username ${normalizedUsername}`);
        }
        
        // Check if username is already taken, but only for new users or username changes
        if (shouldCheckUsername) {
          try {
            console.log(`Checking if username ${normalizedUsername} is taken...`);
            const taken = await isUsernameTaken(normalizedUsername);
            if (taken) {
              console.error(`Username ${normalizedUsername} is already taken`);
              toast.error(`Username "${normalizedUsername}" is already taken. Please choose another username.`);
              setUsernameTaken(true);
              setIsLoading(false);
              return;
            }
            console.log(`Username ${normalizedUsername} is available`);
          } catch (checkError) {
            console.error("Error checking if username is taken:", checkError);
            // Continue with registration attempt anyway, we'll get a DB constraint error if it's taken
          }
        }
        
        console.log(`Using user ID: ${stableId}`);
        
        // Enable realtime features for chat
        console.log("Enabling realtime features for chat...");
        await enableRealtimeForChat();
        
        // Set up connection heartbeat to prevent timeouts
        console.log("Setting up connection heartbeat...");
        const stopHeartbeat = setupConnectionHeartbeat();
        
        // Register or update user
        console.log(`Registering user ${normalizedUsername} with ID ${stableId}...`);
        const registrationSuccess = await registerUser(
          stableId,
          normalizedUsername,
          'standard' // Default role
        );
        
        if (!registrationSuccess) {
          // This could be due to the username being taken or other registration issues
          // Check if the username exists
          const existingUser = await getUserByUsername(normalizedUsername);
          
          if (existingUser) {
            console.error(`Registration failed because username ${normalizedUsername} is taken`);
            setUsernameTaken(true);
            setIsLoading(false);
            return;
          }
          
          // If it's not a taken username, but registration still failed
          console.error("Registration failed for non-username reasons");
          setValidationError("Registration failed. Please try again with a different username.");
          setIsLoading(false);
          return;
        }
        
        // Update user status
        console.log("Updating user online status...");
        await updateUserOnlineStatus(stableId, true);
        
        // Store the UUID and username in localStorage for later use
        localStorage.setItem('userUUID', stableId);
        localStorage.setItem('username', normalizedUsername);
        console.log(`User UUID stored in local storage: ${stableId}`);
        
        // Verify service connection as well
        if (service && typeof service.testConnection === 'function') {
          console.log("Testing chat service connection...");
          const serviceConnected = await service.testConnection();
          if (!serviceConnected) {
            console.warn("Chat service connection is unstable. Some features may be limited.");
            toast.warning("Chat service connection is unstable. Some features may be limited.");
          } else {
            console.log("Chat service connection successful");
          }
        }
        
        setConnectionReady(true);
        toast.success("Connected to chat service");
        
        // Clean up heartbeat on unmount
        return () => {
          stopHeartbeat();
          // Set user offline when component unmounts
          updateUserOnlineStatus(stableId, false)
            .catch(err => console.error('Error updating offline status:', err));
        };
      } catch (err) {
        console.error("Error testing connection:", err);
        toast.error("Error connecting to chat service, will retry");
        
        if (retryCount < maxRetries) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 1000 * Math.pow(2, retryCount));
        } else {
          setConnectionReady(false);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    if (username) {
      connectToSupabase();
    } else {
      setIsLoading(false);
      setValidationError("Please provide a username");
    }
  }, [retryCount, service, userId, username, key]); // Added key to dependency array

  // Hide loading screen after timeout to prevent UI freeze
  useEffect(() => {
    // Set a maximum time for loading screen
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn("Loading timed out - showing UI anyway");
        setIsLoading(false);
      }
    }, 8000); // 8 seconds max loading time
    
    return () => clearTimeout(loadingTimeout);
  }, [isLoading]);

  const handleRetry = () => {
    console.log("User initiated retry, resetting retry count");
    setRetryCount(0);
  };
  
  const handleContinueAnyway = () => {
    console.log("User chose to continue anyway");
    setConnectionReady(true);
  };

  return {
    isLoading,
    connectionReady,
    retryCount,
    usernameTaken,
    validationError,
    maxRetries,
    handleRetry,
    handleContinueAnyway
  };
};
