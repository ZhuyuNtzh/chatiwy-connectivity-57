
/**
 * Generate a valid UUID from any string to ensure compatibility
 * @param input Any string or number
 * @returns A valid UUID string
 */
export const generateStableUUID = (input: string | number): string => {
  // Convert to string first
  const inputStr = String(input);
  
  // If it's already a valid UUID, return it
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(inputStr)) {
    return inputStr;
  }
  
  // Create a stable UUID-like string based on the input
  const template = '00000000-0000-0000-0000-000000000000';
  let result = '';
  let pos = 0;
  
  for (let i = 0; i < template.length; i++) {
    if (template[i] === '-') {
      result += '-';
    } else {
      // Use character from input or fallback to a derived value
      const charCode = pos < inputStr.length ? 
        inputStr.charCodeAt(pos) : 
        (inputStr.length > 0 ? inputStr.charCodeAt(pos % inputStr.length) : 97);
      
      // Convert to a hex digit (0-15)
      const hexDigit = (charCode % 16).toString(16);
      result += hexDigit;
      pos++;
    }
  }
  
  return result;
};
