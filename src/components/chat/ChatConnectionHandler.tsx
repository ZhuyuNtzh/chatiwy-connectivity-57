
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
        onRetry={handleRetry}
        onContinueAnyway={handleContinueAnyway}
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
