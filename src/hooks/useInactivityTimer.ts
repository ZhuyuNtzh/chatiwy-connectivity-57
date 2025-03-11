
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { signalRService } from '../services/signalRService';

export const useInactivityTimer = () => {
  const navigate = useNavigate();
  const { setCurrentUser, setIsLoggedIn } = useUser();
  const [lastActivity, setLastActivity] = useState<Date>(new Date());
  const inactivityTimerRef = useRef<number | null>(null);
  
  useEffect(() => {
    const resetTimer = () => {
      setLastActivity(new Date());
    };
    
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('click', resetTimer);
    
    const checkInactivity = () => {
      const now = new Date();
      const inactiveTime = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
      
      if (inactiveTime >= 30) {
        signalRService.disconnect();
        setCurrentUser(null);
        setIsLoggedIn(false);
        navigate('/');
      }
    };
    
    const intervalId = window.setInterval(checkInactivity, 60000);
    
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.clearInterval(intervalId);
    };
  }, [lastActivity, navigate, setCurrentUser, setIsLoggedIn]);
  
  return {
    lastActivity,
    setLastActivity
  };
};
