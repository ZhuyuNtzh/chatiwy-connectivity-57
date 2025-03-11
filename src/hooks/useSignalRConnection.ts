
import { useEffect } from 'react';
import { signalRService } from '../services/signalRService';

interface User {
  id: number;
  username: string;
}

export const useSignalRConnection = (
  currentUser: User | null,
  setConnectedUsersCount: (count: number) => void
) => {
  useEffect(() => {
    if (currentUser) {
      signalRService.initialize(
        1, // use 1 as a default user ID
        currentUser.username
      );
      
      signalRService.onConnectedUsersCountChanged(count => {
        setConnectedUsersCount(count);
      });
    }
    
    return () => {
      signalRService.disconnect();
    };
  }, [currentUser, setConnectedUsersCount]);
};
