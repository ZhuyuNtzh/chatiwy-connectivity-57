
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConnectionStatusProps {
  isLoading: boolean;
  connectionReady: boolean;
  retryCount: number;
  maxRetries: number;
  validationError: string | null;
  usernameTaken: boolean;
  username: string;
  onRetry: () => void;
  onContinueAnyway: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isLoading,
  connectionReady,
  retryCount,
  maxRetries,
  validationError,
  usernameTaken,
  username,
  onRetry,
  onContinueAnyway
}) => {
  if (validationError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-white dark:bg-gray-800 p-6">
        <div className="text-red-500 text-xl mb-4">Validation Error</div>
        <p className="text-center mb-6">
          {validationError}
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
          onClick={onRetry}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2"
        >
          Retry Connection
        </Button>
        <Button 
          onClick={onContinueAnyway}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Continue Anyway
        </Button>
      </div>
    );
  }

  return null;
};

export default ConnectionStatus;
