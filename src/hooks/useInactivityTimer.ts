
import { useEffect, useState, useRef } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export const useInactivityTimer = (timeoutMinutes = 10) => {
  const { userRole, setIsLoggedIn } = useUser();
  const navigate = useNavigate();
  const [isWarningShown, setIsWarningShown] = useState(false);
  const [remainingTime, setRemainingTime] = useState(timeoutMinutes * 60);
  const timerRef = useRef<number | null>(null);
  const warningTimerRef = useRef<number | null>(null);
  
  const resetTimer = () => {
    // Admin users should never be logged out due to inactivity
    if (userRole === 'admin') {
      return;
    }
    
    setIsWarningShown(false);
    setRemainingTime(timeoutMinutes * 60);
    
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    
    // Reset the logout timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    timerRef.current = window.setTimeout(() => {
      showWarning();
    }, (timeoutMinutes - 1) * 60 * 1000); // Show warning 1 minute before logout
  };
  
  const showWarning = () => {
    // Skip warning for admin users
    if (userRole === 'admin') {
      return;
    }
    
    setIsWarningShown(true);
    setRemainingTime(60); // 1 minute left
    
    toast({
      title: "Session Expiring Soon",
      description: `You will be logged out in 1 minute due to inactivity.`,
      variant: "destructive",
    });
    
    // Start countdown timer
    warningTimerRef.current = window.setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          logout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const logout = () => {
    // Don't log out VIP or admin users automatically
    if (userRole === 'vip' || userRole === 'admin') {
      resetTimer(); // Just reset the timer for these users
      return;
    }
    
    // Clear all timers
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    if (warningTimerRef.current) {
      clearInterval(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    
    // Log the user out
    setIsLoggedIn(false);
    navigate('/');
    
    toast({
      title: "Logged Out",
      description: "You have been logged out due to inactivity.",
    });
  };
  
  const handleUserActivity = () => {
    // Admin users don't need to reset the timer
    if (userRole !== 'admin') {
      resetTimer();
    }
  };
  
  useEffect(() => {
    // Skip setting up timers for admin users
    if (userRole === 'admin') {
      return;
    }
    
    // Set up event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity);
    });
    
    // Initialize timer
    resetTimer();
    
    // Clean up
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      if (warningTimerRef.current) {
        clearInterval(warningTimerRef.current);
      }
    };
  }, [userRole]);
  
  return {
    isWarningShown,
    remainingTime,
    resetTimer,
  };
};
