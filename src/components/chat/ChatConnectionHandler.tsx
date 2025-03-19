
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { checkSupabaseConnection, initializeSupabase } from '@/lib/supabase';
import { setupConnectionHeartbeat, enableRealtimeForChat } from '@/lib/supabase/realtime';
import { registerUser, updateUserOnlineStatus, isUsernameTaken } from '@/lib/supabase/users';
import { generateUniqueUUID } from '@/lib/supabase/utils';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatConnectionHandlerProps {
  children: React.ReactNode;
  userId: number | string;
  username: string;
  service: any;
}

const ChatConnectionHandler: React.FC<ChatConnectionHandlerProps> = ({ 
  children, 
  userId, 
  username,
  service
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionReady, setConnectionReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [usernameTaken, setUsernameTaken] = useState(false);
  const maxRetries = 5;

  // Check Supabase connection on mount
  useEffect(() => {
    const connectToSupabase = async () => {
      setIsLoading(true);
      
      try {
        // Check if username is already taken
        if (username) {
          const taken = await isUsernameTaken(username);
          if (taken) {
            console.error(`Username ${username} is already taken`);
            toast.error(`Username "${username}" is already taken. Please choose another username.`);
            setUsernameTaken(true);
            setIsLoading(false);
            return;
          }
        }
        
        // Initialize Supabase with all necessary features
        const isConnected = await initializeSupabase();
        
        if (!isConnected) {
          console.error("Failed to initialize Supabase");
          
          if (retryCount < maxRetries) {
            console.warn(`Connection issue (attempt ${retryCount + 1}/${maxRetries}). Retrying...`);
            toast.warning(`Connection issue. Retrying... (${retryCount + 1}/${maxRetries})`);
            
            // Retry after a short delay, with exponential backoff
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 1000 * Math.pow(2, retryCount));
            
            return;
          }
          
          console.error("Max retries reached. Could not connect to chat backend.");
          toast.error("Could not connect to chat service. Please try again later.");
          setConnectionReady(false);
        } else {
          console.log("Successfully connected to Supabase");
          
          // Create a stable UUID for this user
          const stableId = generateUniqueUUID();
          
          // Enable realtime features for chat
          await enableRealtimeForChat();
          
          // Set up connection heartbeat to prevent timeouts
          const stopHeartbeat = setupConnectionHeartbeat();
          
          // Register or update user - use the stable UUID
          const registrationSuccess = await registerUser(
            stableId,
            username,
            'standard' // Default role
          );
          
          if (!registrationSuccess) {
            console.error("Failed to register user");
            setUsernameTaken(true);
            setIsLoading(false);
            return;
          }
          
          // Update user status
          await updateUserOnlineStatus(stableId, true);
          
          // Store the UUID in sessionStorage for later use
          sessionStorage.setItem('userUUID', stableId);
          
          // Verify service connection as well
          if (service && typeof service.testConnection === 'function') {
            const serviceConnected = await service.testConnection();
            if (!serviceConnected) {
              console.warn("Chat service connection is unstable. Some features may be limited.");
              toast.warning("Chat service connection is unstable. Some features may be limited.");
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
        }
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

  if (usernameTaken) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-white dark:bg-gray-800 p-6">
        <div className="text-red-500 text-xl mb-4">Username Already Taken</div>
        <p className="text-center mb-6">
          The username "{username}" is already in use. Please choose a different username.
        </p>
        <Button 
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-white dark:bg-gray-800">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Connecting to chat...</p>
      </div>
    );
  }

  if (!connectionReady && retryCount >= maxRetries) {
    return (
      <div className="flex flex-col items-center justify-center p-6 h-full">
        <div className="text-red-500 text-xl mb-4">Connection Issue</div>
        <p className="text-center mb-4">
          Having trouble connecting to the chat service. We'll try to use the application anyway.
        </p>
        <Button 
          onClick={() => setRetryCount(0)} // Reset retry count to try again
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry Connection
        </Button>
        <Button 
          onClick={() => setConnectionReady(true)} // Force proceed anyway
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mt-2"
        >
          Continue Anyway
        </Button>
      </div>
    );
  }

  // Proceed even if not fully connected to prevent blocking the UI
  return <>{children}</>;
};

export default ChatConnectionHandler;
