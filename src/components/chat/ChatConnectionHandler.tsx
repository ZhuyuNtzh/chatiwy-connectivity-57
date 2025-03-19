
import React from 'react';
import { useSupabaseConnection } from '@/hooks/useSupabaseConnection';
import ConnectionStatus from './connection/ConnectionStatus';

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
  const {
    isLoading,
    connectionReady,
    retryCount,
    usernameTaken,
    validationError,
    maxRetries,
    handleRetry,
    handleContinueAnyway
  } = useSupabaseConnection({ userId, username, service });

  return (
    <>
      <ConnectionStatus
        isLoading={isLoading}
        connectionReady={connectionReady}
        retryCount={retryCount}
        maxRetries={maxRetries}
        validationError={validationError}
        usernameTaken={usernameTaken}
        username={username}
        onRetry={handleRetry}
        onContinueAnyway={handleContinueAnyway}
      />
      
      {/* Only show children when connection is ready and username is valid */}
      {connectionReady && !usernameTaken && !validationError && children}
    </>
  );
};

export default ChatConnectionHandler;
