/**
 * User-related types and interfaces
 */

export interface User {
  id: number;
  name?: string;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  isEmailVerified?: boolean;
}

export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
}
