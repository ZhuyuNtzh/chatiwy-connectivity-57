
/**
 * Generates a random username in the format of [Adjective][Noun][Number]
 * @returns {string} A randomly generated username
 */
export function generateUsername(): string {
  const adjectives = ['Happy', 'Clever', 'Brave', 'Calm', 'Gentle', 'Eager', 'Kind', 'Smart', 'Swift', 'Jolly'];
  const nouns = ['Eagle', 'Tiger', 'Panda', 'Wolf', 'Dolphin', 'Phoenix', 'Dragon', 'Lion', 'Falcon', 'Fox'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 100);
  return `${adj}${noun}${number}`;
}
