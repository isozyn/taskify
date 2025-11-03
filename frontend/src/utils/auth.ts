/**
 * Authentication utilities
 */

export interface AuthToken {
  token: string;
  refreshToken?: string;
  expiresAt?: number;
}

/**
 * Get authentication token from storage
 */
export const getAuthToken = (): string | null => {
  try {
    // Try different possible token storage keys
    const token = localStorage.getItem('token') || 
                 localStorage.getItem('authToken') || 
                 localStorage.getItem('accessToken');
    
    if (!token) {
      console.warn('No authentication token found');
      return null;
    }

    // Check if token is expired (if it contains expiration info)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.warn('Token is expired');
        removeAuthToken();
        return null;
      }
    } catch (e) {
      // Token might not be JWT format, that's okay
    }

    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Set authentication token in storage
 */
export const setAuthToken = (token: string): void => {
  try {
    localStorage.setItem('token', token);
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

/**
 * Remove authentication token from storage
 */
export const removeAuthToken = (): void => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('accessToken');
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

/**
 * Make authenticated API request
 */
export const authenticatedFetch = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token available. Please log in.');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  // Handle token expiration
  if (response.status === 401) {
    removeAuthToken();
    throw new Error('Session expired. Please log in again.');
  }

  return response;
};

/**
 * Get current user info from token
 */
export const getCurrentUser = (): any | null => {
  try {
    const token = getAuthToken();
    if (!token) return null;

    // Try to decode JWT token
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id || payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};