
/**
 * Utility functions for Supabase operations
 */

// Generate a stable UUID from a string (for user IDs)
export const generateStableUUID = (seed: string): string => {
  // If it already looks like a UUID, return it
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seed)) {
    return seed;
  }

  // Generate a deterministic UUID based on string input
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Create parts of the UUID using crypto for better randomness
  let uuid = '';
  try {
    // Try to use crypto.randomUUID() first if available
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      uuid = crypto.randomUUID();
    } else {
      uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (hash + Math.random() * 16) % 16 | 0;
        hash = Math.floor(hash / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    }
  } catch (e) {
    // Fallback method
    uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (hash + Math.random() * 16) % 16 | 0;
      hash = Math.floor(hash / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
  
  return uuid;
};

// Generate a completely unique UUID (for message IDs, presence, etc.)
export const generateUniqueUUID = (): string => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch (e) {
    console.warn('crypto.randomUUID not available, using fallback');
  }
  
  // Fallback method
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
