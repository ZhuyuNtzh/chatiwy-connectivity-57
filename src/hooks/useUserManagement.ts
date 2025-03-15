
import { useCallback } from 'react';

export const useUserManagement = () => {
  // Kick a user from the chat
  const kickUser = useCallback((userId: number) => {
    // In a real app, this would disconnect the user
    console.log(`User with ID: ${userId} has been kicked from the chat`);
    // Simulate disconnecting by setting a session flag
    sessionStorage.setItem(`kicked_${userId}`, 'true');
  }, []);

  // Check if the admin is logged in
  const isAdminLoggedIn = useCallback(() => {
    return localStorage.getItem('adminLoggedIn') === 'true';
  }, []);

  return {
    kickUser,
    isAdminLoggedIn
  };
};
