
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { checkSupabaseConnection, initializeSupabase } from '@/lib/supabase';
import { setupConnectionHeartbeat, enableRealtimeForChat } from '@/lib/supabase/realtime';
import { registerUser, updateUserOnlineStatus } from '@/lib/supabase/users';

interface ChatConnectionHandlerProps {
  children: React.ReactNode;
  userId: number;
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
  const maxRetries = 3;

  // Check Supabase connection on mount
  useEffect(() => {
    const connectToSupabase = async () => {
      setIsLoading(true);
      
      try {
        // Initialize Supabase with all necessary features
        const isConnected = await initializeSupabase();
        
        if (!isConnected) {
          console.error("Failed to initialize Supabase");
          
          if (retryCount < maxRetries) {
            toast.error(`Connection issue (attempt ${retryCount + 1}/${maxRetries}). Retrying...`, {
              duration: 3000,
            });
            
            // Retry after a short delay, with exponential backoff
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 1000 * Math.pow(2, retryCount));
            
            return;
          }
          
          toast.error("Couldn't connect to chat backend. Please refresh the page.", {
            duration: 6000,
          });
          setConnectionReady(false);
        } else {
          console.log("Successfully connected to Supabase");
          
          // Enable realtime features for chat
          await enableRealtimeForChat();
          
          // Set up connection heartbeat to prevent timeouts
          const stopHeartbeat = setupConnectionHeartbeat();
          
          // Register or update user
          await registerUser(
            userId.toString(),
            username,
            'standard' // Default role
          );
          
          // Update user status
          await updateUserOnlineStatus(userId.toString(), true);
          
          // Verify service connection as well
          if (service && typeof service.testConnection === 'function') {
            const serviceConnected = await service.testConnection();
            if (!serviceConnected) {
              toast.warning("Chat service connection is unstable. Some features may be limited.", {
                duration: 5000,
              });
            }
          }
          
          setConnectionReady(true);
          
          // Clean up heartbeat on unmount
          return () => {
            stopHeartbeat();
            // Set user offline when component unmounts
            updateUserOnlineStatus(userId.toString(), false)
              .catch(err => console.error('Error updating offline status:', err));
          };
        }
      } catch (err) {
        console.error("Error testing connection:", err);
        toast.error("Error connecting to chat service", { 
          duration: 6000,
        });
        setConnectionReady(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    connectToSupabase();
  }, [retryCount, service, userId, username]);
  
  // Force prefetch chat history to ensure connection works
  useEffect(() => {
    if (!isLoading && connectionReady && userId && username) {
      console.log(`Prefetching chat history for user ${username} (ID: ${userId})`);
      
      try {
        const result = service.getChatHistory(userId);
        
        // Handle both synchronous and Promise return types
        if (result instanceof Promise) {
          result
            .then(messages => {
              console.log(`Retrieved ${messages?.length || 0} messages for conversation with ${username}`);
              // If no messages were retrieved, test if we can actually write to the database
              if (!messages || messages.length === 0) {
                service.testMessageCreation?.()
                  .then((success: boolean) => {
                    if (!success) {
                      toast.warning("Message delivery might be delayed. Please be patient.", {
                        duration: 5000
                      });
                    }
                  })
                  .catch((err: Error) => {
                    console.error("Error testing message creation:", err);
                  });
              }
            })
            .catch(err => {
              console.error(`Error fetching chat history for ${username}:`, err);
              toast.error("Error loading chat history. Some messages may be missing.", {
                duration: 5000
              });
            });
        } else if (Array.isArray(result)) {
          // Handle synchronous result
          console.log(`Retrieved ${result.length} messages for conversation with ${username}`);
        }
      } catch (err) {
        console.error(`Error accessing chat service:`, err);
        toast.error("Error accessing chat service. Please refresh the page.", { 
          duration: 5000,
        });
      }
    }
  }, [isLoading, connectionReady, userId, username, service]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-white dark:bg-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!connectionReady) {
    return (
      <div className="flex flex-col items-center justify-center p-6 h-full">
        <div className="text-red-500 text-xl mb-4">Connection Error</div>
        <p className="text-center mb-4">
          Unable to connect to the chat service. Please check your internet connection and try again.
        </p>
        <button 
          onClick={() => setRetryCount(prev => prev + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default ChatConnectionHandler;
