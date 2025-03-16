
// Check and filter message content for banned words
export const checkAndFilterMessage = (content: string, bannedWords: string[]): { isAllowed: boolean; filteredMessage: string } => {
  if (!content || !bannedWords || bannedWords.length === 0) {
    return { isAllowed: true, filteredMessage: content };
  }
  
  // Convert to lowercase for case-insensitive matching
  const lowerContent = content.toLowerCase();
  
  // Check if message contains any banned words
  const containsBannedWord = bannedWords.some(word => 
    lowerContent.includes(word.toLowerCase())
  );
  
  if (!containsBannedWord) {
    return { isAllowed: true, filteredMessage: content };
  }
  
  // Filter the content by replacing banned words with asterisks
  let filteredMessage = content;
  
  bannedWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filteredMessage = filteredMessage.replace(regex, '*'.repeat(word.length));
  });
  
  // If the message only contains banned words, it's not allowed
  const isOnlyBannedWords = filteredMessage.trim().replace(/\*/g, '').length === 0;
  
  return {
    isAllowed: !isOnlyBannedWords,
    filteredMessage
  };
};
