
export const validateUsername = (username: string, isVip: boolean): { isValid: boolean; error?: string } => {
  if (!username) return { isValid: false, error: 'Username is required' };
  
  const maxLength = isVip ? 24 : 20;
  if (username.length > maxLength) {
    return { 
      isValid: false, 
      error: `Username cannot be longer than ${maxLength} characters` 
    };
  }
  
  // Check for valid alphanumeric characters
  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    return { 
      isValid: false, 
      error: 'Username can only contain letters and numbers' 
    };
  }
  
  // Check for more than 2 consecutive numbers
  if (/\d{3,}/.test(username)) {
    return { 
      isValid: false, 
      error: 'Username cannot contain more than 2 consecutive numbers' 
    };
  }
  
  return { isValid: true };
};
