
let blockedUsers: number[] = [];

export const userBlocking = {
  loadFromStorage() {
    const savedBlockedUsers = localStorage.getItem('blockedUsers');
    if (savedBlockedUsers) {
      try {
        blockedUsers = JSON.parse(savedBlockedUsers);
      } catch (e) {
        console.error('Error parsing blocked users:', e);
        blockedUsers = [];
      }
    }
  },

  blockUser(userId: number) {
    if (!blockedUsers.includes(userId)) {
      blockedUsers.push(userId);
      localStorage.setItem('blockedUsers', JSON.stringify(blockedUsers));
    }
  },

  unblockUser(userId: number) {
    blockedUsers = blockedUsers.filter(id => id !== userId);
    localStorage.setItem('blockedUsers', JSON.stringify(blockedUsers));
  },

  isUserBlocked(userId: number): boolean {
    return blockedUsers.includes(userId);
  },

  getBlockedUsers(): number[] {
    return [...blockedUsers];
  }
};
