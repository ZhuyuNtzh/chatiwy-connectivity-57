
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { signalRService } from '../services/signalRService';
import { UserRole } from '@/contexts/UserContext';

export const useInactivityTimer = (timeout = 60 * 60 * 1000) => { // Default 1 hour
  const navigate = useNavigate();
  const { userRole, setIsLoggedIn } = useUser();
  const [lastActivity, setLastActivity] = useState<Date>(new Date());
  const [timerRunning, setTimerRunning] = useState<boolean>(true);
  
  const resetTimer = useCallback(() => {
    setLastActivity(new Date());
  }, []);
  
  const stopTimer = useCallback(() => {
    setTimerRunning(false);
  }, []);
  
  const startTimer = useCallback(() => {
    setTimerRunning(true);
  }, []);
  
  useEffect(() => {
    if (!timerRunning) return;
    
    // Don't run timer for VIP users
    if (userRole === 'vip') {
      stopTimer();
      return;
    }
    
    const checkInactivity = () => {
      const now = new Date();
      const timeElapsed = now.getTime() - lastActivity.getTime();
      
      if (timeElapsed > timeout) {
        console.log('Logging out due to inactivity');
        // Log out the user
        setIsLoggedIn(false);
        signalRService.disconnect();
        navigate('/');
      }
    };
    
    const intervalId = setInterval(checkInactivity, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [lastActivity, navigate, setIsLoggedIn, timeout, timerRunning, userRole, stopTimer]);
  
  // Set up event listeners for user activity
  useEffect(() => {
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    
    const handleUserActivity = () => {
      resetTimer();
    };
    
    activityEvents.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });
    
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [resetTimer]);
  
  return { resetTimer, stopTimer, startTimer };
};
