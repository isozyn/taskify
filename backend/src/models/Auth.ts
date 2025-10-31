// Auth related interfaces and types

/**
 * JWT Token Payload
 */
export interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

/**
 * Login Request
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Register Request
 */
export interface RegisterRequest {
  name?: string;
  username: string;
  email: string;
  password: string;
}

/**
 * Auth Response
 */
export interface AuthResponse {
  message: string;
  accessToken: string;
  user: any;
}
