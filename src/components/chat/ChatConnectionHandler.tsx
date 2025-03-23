
import React, { useState, useEffect } from 'react';
import ConnectionStatus from './connection/ConnectionStatus';
import { toast } from 'sonner';

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
  const [validationError, setValidationError] = useState<string | null>(null);
  const maxRetries = 3;
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    // Simulate connection setup with a timeout
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      console.log("Connection ready");
      setConnectionReady(true);
      setIsLoading(false);
    }, 1500);
    
    // Validate that username is provided
    if (!username || username.trim() === '') {
      console.error("Username is empty or invalid");
      setValidationError("Please provide a valid username");
      setIsLoading(false);
      clearTimeout(timer);
      return;
    }
    
    return () => clearTimeout(timer);
  }, [username, retryCount]);

  const handleRetry = () => {
    console.log("User initiated retry, resetting retry count");
    setRetryCount(prev => prev + 1);
  };
  
  const handleContinueAnyway = () => {
    console.log("User chose to continue anyway");
    setConnectionReady(true);
  };

  // When there's a validation error, show error but don't render children
  if (validationError) {
    return (
      <ConnectionStatus
        isLoading={isLoading}
        connectionReady={false}
        retryCount={retryCount}
        maxRetries={maxRetries}
        validationError={validationError}
        usernameTaken={false}
        username={username}
        onRetry={handleRetry}
        onContinueAnyway={handleContinueAnyway}
      />
    );
  }

  return (
    <>
      {isLoading || !connectionReady ? (
        <ConnectionStatus
          isLoading={isLoading}
          connectionReady={connectionReady}
          retryCount={retryCount}
          maxRetries={maxRetries}
          validationError={null}
          usernameTaken={false}
          username={username}
          onRetry={handleRetry}
          onContinueAnyway={handleContinueAnyway}
        />
      ) : null}
      
      {/* Only show children when connection is ready */}
      {connectionReady && children}
    </>
  );
};

export default ChatConnectionHandler;
