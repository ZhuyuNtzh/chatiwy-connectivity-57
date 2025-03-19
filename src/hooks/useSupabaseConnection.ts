
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { initializeSupabase } from '@/lib/supabase';
import { setupConnectionHeartbeat, enableRealtimeForChat } from '@/lib/supabase/realtime';
import { registerUser, updateUserOnlineStatus, isUsernameTaken } from '@/lib/supabase/users';
import { generateUniqueUUID } from '@/lib/supabase/utils';

interface UseSupabaseConnectionProps {
  userId: number | string;
  username: string;
  service: any;
}

export const useSupabaseConnection = ({ userId, username, service }: UseSupabaseConnectionProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionReady, setConnectionReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [usernameTaken, setUsernameTaken] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const maxRetries = 5;

  useEffect(() => {
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
        
        console.log(`Attempting to connect with username: ${username}`);
        
        // First initialize Supabase to make sure connection is working
        const isConnected = await initializeSupabase();
        if (!isConnected) {
          throw new Error("Failed to initialize Supabase connection");
        }
        
        // Check if username is already taken
        const taken = await isUsernameTaken(username);
        if (taken && (existingUsername !== username)) {
          console.error(`Username ${username} is already taken`);
          toast.error(`Username "${username}" is already taken. Please choose another username.`);
          setUsernameTaken(true);
          setIsLoading(false);
          return;
        }
        
        // Create a stable UUID for this user
        // If we already have a UUID in localStorage, use it
        const stableId = existingUUID && existingUsername === username ? 
          existingUUID : generateUniqueUUID();
        
        console.log(`Using user ID: ${stableId}`);
        
        // Enable realtime features for chat
        console.log("Enabling realtime features for chat...");
        await enableRealtimeForChat();
        
        // Set up connection heartbeat to prevent timeouts
        console.log("Setting up connection heartbeat...");
        const stopHeartbeat = setupConnectionHeartbeat();
        
        // Register or update user
        console.log(`Registering user ${username} with ID ${stableId}...`);
        const registrationSuccess = await registerUser(
          stableId,
          username,
          'standard' // Default role
        );
        
        if (!registrationSuccess) {
          console.error("Failed to register user");
          toast.error("Failed to register user. Please try again.");
          setUsernameTaken(true);
          setIsLoading(false);
          return;
        }
        
        // Update user status
        console.log("Updating user online status...");
        await updateUserOnlineStatus(stableId, true);
        
        // Store the UUID in localStorage for later use
        localStorage.setItem('userUUID', stableId);
        localStorage.setItem('username', username);
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
  }, [retryCount, service, userId, username]);

  // Hide loading screen after timeout to prevent UI freeze
  useEffect(() => {
    // Set a maximum time for loading screen
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn("Loading timed out - showing UI anyway");
        setIsLoading(false);
        setConnectionReady(true); // Try to proceed anyway
      }
    }, 8000); // 8 seconds max loading time
    
    return () => clearTimeout(loadingTimeout);
  }, [isLoading]);

  const handleRetry = () => setRetryCount(0);
  const handleContinueAnyway = () => setConnectionReady(true);

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
