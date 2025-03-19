
/**
 * Generate a valid UUID from any string or number input
 * Uses a more robust algorithm to ensure uniqueness even for similar inputs
 * @param input Any string or number
 * @returns A valid UUID string
 */
export const generateStableUUID = (input: string | number): string => {
  // If it's already a valid UUID, return it
  if (typeof input === 'string' && 
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input)) {
    return input;
  }
  
  // Convert input to string
  const inputStr = String(input);
  
  // If input is empty or invalid, generate a completely random UUID
  if (!inputStr || inputStr.trim() === '') {
    return crypto.randomUUID();
  }
  
  // Create a deterministic hash from the input string
  let hash = 0;
  for (let i = 0; i < inputStr.length; i++) {
    const char = inputStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Add timestamp to ensure uniqueness even for same input
  const timestamp = Date.now().toString();
  const combined = inputStr + timestamp + hash.toString();
  
  // Create UUID parts
  const p1 = combined.substring(0, 8) || '12345678';
  const p2 = combined.substring(8, 12) || '1234';
  const p3 = '4' + combined.substring(13, 16) || '4123'; // Version 4 UUID
  const p4 = combined.substring(16, 20) || '1234';
  const p5 = combined.substring(20, 32) || '123456789012';
  
  // Format into UUID pattern
  const segments = [p1, p2, p3, p4, p5];
  
  // Ensure each segment contains only valid hex characters
  const cleanSegments = segments.map(segment => 
    segment.replace(/[^0-9a-f]/gi, '0').substring(0, segment.length)
  );
  
  // If any segment is too short, pad it
  if (cleanSegments[0].length < 8) cleanSegments[0] = cleanSegments[0].padEnd(8, '0');
  if (cleanSegments[1].length < 4) cleanSegments[1] = cleanSegments[1].padEnd(4, '0');
  if (cleanSegments[2].length < 4) cleanSegments[2] = cleanSegments[2].padEnd(4, '0');
  if (cleanSegments[3].length < 4) cleanSegments[3] = cleanSegments[3].padEnd(4, '0');
  if (cleanSegments[4].length < 12) cleanSegments[4] = cleanSegments[4].padEnd(12, '0');

  return `${cleanSegments[0]}-${cleanSegments[1]}-${cleanSegments[2]}-${cleanSegments[3]}-${cleanSegments[4]}`;
};

/**
 * Generate a completely unique UUID regardless of input
 * @returns A unique UUID string
 */
export const generateUniqueUUID = (): string => {
  return crypto.randomUUID();
};
