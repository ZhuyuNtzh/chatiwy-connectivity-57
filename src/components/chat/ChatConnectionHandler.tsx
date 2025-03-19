
import React, { useState, useEffect } from 'react';
import { useSupabaseConnection } from '@/hooks/useSupabaseConnection';
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
  const [forceRerender, setForceRerender] = useState(0);
  const [reconnectKey, setReconnectKey] = useState(Date.now());
  
  const {
    isLoading,
    connectionReady,
    retryCount,
    usernameTaken,
    validationError,
    maxRetries,
    handleRetry,
    handleContinueAnyway
  } = useSupabaseConnection({ 
    userId, 
    username, 
    service,
    key: reconnectKey // Add a key to force hook re-execution
  });

  // Force reconnect after 1 minute of inactivity to refresh user lists
  useEffect(() => {
    const reconnectInterval = setInterval(() => {
      console.log("Scheduled reconnect to refresh user data");
      setReconnectKey(Date.now());
    }, 1 * 60 * 1000); // 1 minute
    
    return () => clearInterval(reconnectInterval);
  }, []);

  // When username is taken, show error but don't render children
  if (usernameTaken) {
    return (
      <ConnectionStatus
        isLoading={isLoading}
        connectionReady={false}
        retryCount={retryCount}
        maxRetries={maxRetries}
        validationError={null}
        usernameTaken={true}
        username={username}
        onRetry={() => {
          // Force re-execution of the hook with a new key
          setReconnectKey(Date.now());
          handleRetry();
        }}
        onContinueAnyway={() => {
          toast.warning("You're continuing with a username that may be taken. Some features might not work correctly.");
          handleContinueAnyway();
        }}
      />
    );
  }

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
        onRetry={() => {
          // Force re-execution of the hook with a new key
          setReconnectKey(Date.now());
          handleRetry();
        }}
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
          onRetry={() => {
            // Force re-execution of the hook with a new key
            setReconnectKey(Date.now());
            handleRetry();
          }}
          onContinueAnyway={handleContinueAnyway}
        />
      ) : null}
      
      {/* Only show children when connection is ready */}
      {connectionReady && children}
    </>
  );
};

export default ChatConnectionHandler;
