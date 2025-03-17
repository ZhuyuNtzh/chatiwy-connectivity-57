
import type { ChatMessage } from './types';

export const createEventHandlers = () => {
  const onMessageReceived = (callback: (message: ChatMessage) => void) => {
    window.addEventListener('message-received', (e: any) => {
      callback(e.detail);
    });
  };
  
  const offMessageReceived = (callback: (message: ChatMessage) => void) => {
    window.removeEventListener('message-received', (e: any) => {
      callback(e.detail);
    });
  };
  
  const onUserTyping = (callback: (userId: number) => void) => {
    window.addEventListener('user-typing', (e: any) => {
      callback(e.detail);
    });
  };
  
  const offUserTyping = (callback: (userId: number) => void) => {
    window.removeEventListener('user-typing', (e: any) => {
      callback(e.detail);
    });
  };
  
  const onMessageDeleted = (callback: (messageId: string) => void) => {
    window.addEventListener('message-deleted', (e: any) => {
      callback(e.detail);
    });
  };
  
  const offMessageDeleted = (callback: (messageId: string) => void) => {
    window.removeEventListener('message-deleted', (e: any) => {
      callback(e.detail);
    });
  };
  
  const onConnectedUsersCountChanged = (callback: (count: number) => void) => {
    window.addEventListener('connected-users-count', (e: any) => {
      callback(e.detail);
    });
    
    // Simulate an initial count
    setTimeout(() => {
      const event = new CustomEvent('connected-users-count', { detail: Math.floor(Math.random() * 10) + 5 });
      window.dispatchEvent(event);
    }, 1000);
  };
  
  // Set typing indicator
  const setTypingIndicator = (isTyping: boolean, recipientId: number, currentUserId: number, currentUsername: string): void => {
    // In a real app, this would notify other users via SignalR
    console.log(`User ${currentUsername} is ${isTyping ? 'typing' : 'not typing'} to user ${recipientId}`);
    
    // Dispatch event for typing indicator
    if (isTyping) {
      const event = new CustomEvent('user-typing', { detail: currentUserId });
      window.dispatchEvent(event);
    }
  };

  return {
    onMessageReceived,
    offMessageReceived,
    onUserTyping,
    offUserTyping,
    onMessageDeleted,
    offMessageDeleted,
    onConnectedUsersCountChanged,
    setTypingIndicator
  };
};
