import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { initializeSupabase } from '@/lib/supabase';
import { setupConnectionHeartbeat, enableRealtimeForChat } from '@/lib/supabase/realtime';
import { registerUser, updateUserOnlineStatus } from '@/lib/supabase/users';
import { isUsernameTaken, getUserByUsername, generateUniqueUsername } from '@/lib/supabase/users/userQueries';
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
  const [actualUsername, setActualUsername] = useState<string | null>(null);
  const maxRetries = 5;

  // Function to attempt registration with retry logic
  const attemptRegistration = useCallback(async (userUUID: string, attemptedUsername: string) => {
    console.log(`Attempting registration for UUID ${userUUID} with username ${attemptedUsername}`);
    
    try {
      // First initialize Supabase to make sure connection is working
      const isConnected = await initializeSupabase();
      if (!isConnected) {
        throw new Error("Failed to initialize Supabase connection");
      }
      
      // Enable realtime features
      await enableRealtimeForChat();
      
      // Set up heartbeat
      const stopHeartbeat = setupConnectionHeartbeat();
      
      // Try to register user - this will generate a unique username if needed
      const registrationResult = await registerUser(
        userUUID,
        attemptedUsername,
        'standard'
      );
      
      if (!registrationResult.success) {
        console.error(`Registration failed: ${registrationResult.message}`);
        setValidationError(registrationResult.message || "Registration failed");
        stopHeartbeat();
        return { success: false, username: attemptedUsername };
      }
      
      // Store the potentially modified username
      console.log(`Registration succeeded with username: ${registrationResult.username}`);
      
      // Update local storage
      localStorage.setItem('userUUID', userUUID);
      localStorage.setItem('username', registrationResult.username);
      
      return { 
        success: true, 
        username: registrationResult.username,
        stopHeartbeat
      };
    } catch (error) {
      console.error("Registration attempt failed:", error);
      return { success: false, username: attemptedUsername };
    }
  }, []);

  useEffect(() => {
    // Reset states when key changes
    setIsLoading(true);
    setConnectionReady(false);
    setUsernameTaken(false);
    setValidationError(null);
    setActualUsername(null);

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
        
        // Generate a new unique UUID for each connection
        // Since we've removed username uniqueness constraints, we'll generate a new UUID for safety
        let userUUID = generateUniqueUUID();
        console.log(`Generated new UUID ${userUUID} for username ${normalizedUsername}`);
        
        // Attempt registration - the actual username will get a timestamp appended
        const registrationResult = await attemptRegistration(userUUID, normalizedUsername);
        
        if (!registrationResult.success) {
          setIsLoading(false);
          return;
        }
        
        // Update the actual username that was used (with timestamp appended)
        setActualUsername(registrationResult.username);
        
        // Success - we're ready to go
        setConnectionReady(true);
        
        // Toast the user with the modified username
        if (registrationResult.username !== normalizedUsername) {
          toast.info(`Using username "${registrationResult.username}" instead of "${normalizedUsername}"`);
        } else {
          toast.success("Connected to chat service");
        }
        
        // Update local storage with the new UUID and username
        localStorage.setItem('userUUID', userUUID);
        localStorage.setItem('username', registrationResult.username);
        
        // Clean up heartbeat when component unmounts
        return () => {
          console.log("Cleaning up Supabase connection");
          if (registrationResult.stopHeartbeat) registrationResult.stopHeartbeat();
          
          // Set user offline when component unmounts
          updateUserOnlineStatus(userUUID, false)
            .catch(err => console.error('Error updating offline status:', err));
        };
      } catch (err) {
        console.error("Error connecting:", err);
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
    }, 10000); // 10 seconds max loading time
    
    return () => clearTimeout(loadingTimeout);
  }, [retryCount, service, userId, username, key, attemptRegistration, maxRetries]);

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
    handleContinueAnyway,
    actualUsername: actualUsername || username // Return the potentially modified username
  };
};
