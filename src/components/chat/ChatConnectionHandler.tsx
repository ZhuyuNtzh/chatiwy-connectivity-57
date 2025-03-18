
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { checkSupabaseConnection } from '@/lib/supabase';
import ChatLoading from './ChatLoading';

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

  // Check Supabase connection on mount
  useEffect(() => {
    setIsLoading(true);
    
    // Test connection to Supabase
    checkSupabaseConnection()
      .then((isConnected) => {
        if (!isConnected) {
          console.error("Failed to connect to Supabase");
          toast.error("Couldn't connect to chat backend. Please check your configuration.", {
            duration: 6000,
          });
          setConnectionReady(false);
        } else {
          console.log("Successfully connected to Supabase");
          setConnectionReady(true);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error testing connection:", err);
        toast.error("Error connecting to chat service", { 
          duration: 6000,
        });
        setIsLoading(false);
        setConnectionReady(false);
      });
  }, [service]);
  
  // Force prefetch chat history to ensure connection works
  useEffect(() => {
    if (!isLoading && connectionReady) {
      console.log(`Prefetching chat history for user ${username} (ID: ${userId})`);
      
      const result = service.getChatHistory(userId);
      
      // Handle both synchronous and Promise return types
      if (result instanceof Promise) {
        result
          .then(messages => {
            console.log(`Retrieved ${messages.length} messages for conversation with ${username}`);
          })
          .catch(err => {
            console.error(`Error fetching chat history for ${username}:`, err);
          });
      } else if (Array.isArray(result)) {
        // Handle synchronous result
        console.log(`Retrieved ${result.length} messages for conversation with ${username}`);
      }
    }
  }, [isLoading, connectionReady, userId, username, service]);

  if (isLoading) {
    return <ChatLoading />;
  }

  return <>{children}</>;
};

export default ChatConnectionHandler;
