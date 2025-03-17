
let bannedWords: string[] = [];

export const contentModeration = {
  loadFromStorage() {
    const savedBannedWords = localStorage.getItem('bannedWords');
    if (savedBannedWords) {
      try {
        bannedWords = JSON.parse(savedBannedWords);
      } catch (e) {
        console.error('Error parsing banned words:', e);
        bannedWords = [];
      }
    }
  },

  getBannedWords(): string[] {
    return [...bannedWords];
  },

  addBannedWord(word: string) {
    if (!bannedWords.includes(word.toLowerCase())) {
      bannedWords.push(word.toLowerCase());
      // Save to localStorage
      localStorage.setItem('bannedWords', JSON.stringify(bannedWords));
    }
  },

  removeBannedWord(word: string) {
    bannedWords = bannedWords.filter(w => w !== word.toLowerCase());
    // Save to localStorage
    localStorage.setItem('bannedWords', JSON.stringify(bannedWords));
  },

  setBannedWords(words: string[]) {
    bannedWords = words.map(word => word.toLowerCase());
    // Save to localStorage
    localStorage.setItem('bannedWords', JSON.stringify(bannedWords));
  },

  containsBannedWords(text: string): boolean {
    if (!text || !bannedWords.length) return false;
    const lowercaseText = text.toLowerCase();
    return bannedWords.some(word => lowercaseText.includes(word));
  }
};
