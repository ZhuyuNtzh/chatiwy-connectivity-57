
/**
 * Get authentication token from localStorage
 * @returns The authentication token or null if not found
 */
export const getAuthToken = (): string | null => {
  try {
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      const session = JSON.parse(userSession);
      return session.sessionToken || null;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  
  return null;
};

/**
 * Add auth token to headers for API requests
 * @param headers - The headers object to add the token to
 * @returns The headers object with the token added
 */
export const addAuthHeader = (headers: Record<string, string> = {}): Record<string, string> => {
  const token = getAuthToken();
  
  if (token) {
    return {
      ...headers,
      'Authorization': `Bearer ${token}`
    };
  }
  
  return headers;
};

/**
 * Check if the current user is authenticated
 * @returns Boolean indicating if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};
