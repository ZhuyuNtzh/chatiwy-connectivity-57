
// Re-export all user functionality from the new modular structure
export {
  isUsernameTaken,
  getOnlineUsers,
  getAllUsers,
  registerUser,
  updateUserOnlineStatus,
  subscribeToOnlineUsers,
  setupRealtimeSubscription
} from './users/index';
