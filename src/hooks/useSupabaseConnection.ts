
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
        
        // Determine if we should use existing UUID or generate a new one
        let stableId: string;
        let shouldCheckUsername = true;
        
        // If we have an existing UUID and username matches, use that ID
        if (existingUUID && existingUsername === normalizedUsername) {
          console.log(`Using existing UUID ${existingUUID} for username ${normalizedUsername}`);
          stableId = existingUUID;
          shouldCheckUsername = false; // Skip username check for existing users reconnecting
        } else {
          // Generate a new UUID for new users or changed usernames
          stableId = generateUniqueUUID();
          console.log(`Generated new UUID ${stableId} for username ${normalizedUsername}`);
        }
        
        // Check if username is already taken
        if (shouldCheckUsername) {
          try {
            console.log(`Checking if username ${normalizedUsername} is taken...`);
            const existingUser = await getUserByUsername(normalizedUsername);
            
            if (existingUser) {
              console.error(`Username ${normalizedUsername} is already taken by user ID ${existingUser.id}`);
              setUsernameTaken(true);
              setIsLoading(false);
              return;
            }
            
            console.log(`Username ${normalizedUsername} is available`);
          } catch (checkError) {
            console.error("Error checking if username is taken:", checkError);
            // Continue with registration attempt, we'll handle duplicate errors there
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
        try {
          const registrationSuccess = await registerUser(
            stableId,
            normalizedUsername,
            'standard' // Default role
          );
          
          if (!registrationSuccess) {
            // One more direct check if the username exists with a different ID
            try {
              const existingUser = await getUserByUsername(normalizedUsername);
              
              if (existingUser && existingUser.id !== stableId) {
                console.error(`Username ${normalizedUsername} is taken by user ID ${existingUser.id}`);
                setUsernameTaken(true);
                setIsLoading(false);
                stopHeartbeat();
                return;
              }
            } catch (err) {
              console.error("Error double-checking username:", err);
            }
            
            // If registration failed for non-username reasons
            setValidationError("Registration failed. Please try again with a different username.");
            setIsLoading(false);
            stopHeartbeat();
            return;
          }
        } catch (regError) {
          console.error("Registration error:", regError);
          setValidationError("Error during registration. Please try again.");
          setIsLoading(false);
          stopHeartbeat();
          return;
        }
        
        // Store the UUID and username in localStorage for later use
        localStorage.setItem('userUUID', stableId);
        localStorage.setItem('username', normalizedUsername);
        console.log(`User UUID and username stored in local storage`);
        
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
          console.log("Cleaning up Supabase connection");
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
    
    // Set a maximum time for loading screen
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn("Loading timed out - showing UI anyway");
        setIsLoading(false);
      }
    }, 8000); // 8 seconds max loading time
    
    return () => clearTimeout(loadingTimeout);
  }, [retryCount, service, userId, username, key]); // Added key to dependency array

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
