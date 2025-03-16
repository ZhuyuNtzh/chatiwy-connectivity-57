
// Local storage key for blocked users
const BLOCKED_USERS_KEY = 'blocked_users';

// Check if a user is blocked
export const isUserBlocked = (currentUserId: number, blockedUserId: number): boolean => {
  try {
    const blockedUsersMap = getBlockedUsersMap(currentUserId);
    return blockedUsersMap[blockedUserId] || false;
  } catch (error) {
    console.error('Error checking if user is blocked:', error);
    return false;
  }
};

// Block a user
export const blockUser = (currentUserId: number, userIdToBlock: number): boolean => {
  try {
    const blockedUsersMap = getBlockedUsersMap(currentUserId);
    
    // Add the user to blocked list
    blockedUsersMap[userIdToBlock] = true;
    
    // Save to localStorage
    saveBlockedUsersMap(currentUserId, blockedUsersMap);
    
    return true;
  } catch (error) {
    console.error('Error blocking user:', error);
    return false;
  }
};

// Unblock a user
export const unblockUser = (currentUserId: number, userIdToUnblock: number): boolean => {
  try {
    const blockedUsersMap = getBlockedUsersMap(currentUserId);
    
    // Remove the user from blocked list
    delete blockedUsersMap[userIdToUnblock];
    
    // Save to localStorage
    saveBlockedUsersMap(currentUserId, blockedUsersMap);
    
    return true;
  } catch (error) {
    console.error('Error unblocking user:', error);
    return false;
  }
};

// Get all blocked users for the current user
export const getBlockedUsers = (currentUserId: number): number[] => {
  try {
    const blockedUsersMap = getBlockedUsersMap(currentUserId);
    return Object.keys(blockedUsersMap)
      .filter(id => blockedUsersMap[parseInt(id)])
      .map(id => parseInt(id));
  } catch (error) {
    console.error('Error getting blocked users:', error);
    return [];
  }
};

// Helper function to get blocked users map from localStorage
const getBlockedUsersMap = (currentUserId: number): Record<number, boolean> => {
  try {
    const key = `${BLOCKED_USERS_KEY}_${currentUserId}`;
    const stored = localStorage.getItem(key);
    
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading blocked users:', error);
  }
  
  return {};
};

// Helper function to save blocked users map to localStorage
const saveBlockedUsersMap = (currentUserId: number, blockedUsersMap: Record<number, boolean>): void => {
  try {
    const key = `${BLOCKED_USERS_KEY}_${currentUserId}`;
    localStorage.setItem(key, JSON.stringify(blockedUsersMap));
  } catch (error) {
    console.error('Error saving blocked users:', error);
  }
};
