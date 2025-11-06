# Taskify Authentication Security Implementation

## Overview

This document describes the secure JWT authentication implementation in Taskify using HTTP-only cookies.

---

## Security Features Implemented

### 1. **JWT Token Management**

-   **Unique tokens per user**: Each user receives a unique JWT containing their `id`, `email`, and `role`
-   **HTTP-only cookies**: Tokens are stored in HTTP-only cookies (not accessible via JavaScript)
-   **Secure flag**: Cookies use the `secure` flag in production (HTTPS only)
-   **SameSite protection**: Cookies use `sameSite: 'strict'` to prevent CSRF attacks
-   **Path specification**: Cookies explicitly set `path: '/'` to ensure consistent access

### 2. **Token Expiration**

-   **Access tokens**: 7 days expiration
-   **Refresh tokens**: 30 days expiration
-   **Automatic expiry**: JWT tokens automatically expire, preventing indefinite access

### 3. **Session Management**

-   **Single active session**: On login, all existing refresh tokens are revoked
-   **Prevents session fixation**: Old tokens cannot be reused after new login
-   **Database-backed refresh tokens**: Refresh tokens stored in database for validation
-   **Token revocation**: Logout immediately revokes refresh tokens

### 4. **Route Protection**

#### Frontend Protection

-   **ProtectedRoute component**: Requires authentication, redirects to `/auth` if not logged in
-   **PublicRoute component**: Redirects to `/dashboard` if already authenticated
-   **Loading state**: Shows spinner while checking authentication

#### Backend Protection

-   **Authentication middleware**: Validates JWT on every protected route
-   **User attachment**: Attaches user info to `req.user` after validation
-   **401 on invalid token**: Returns 401 Unauthorized for missing/invalid tokens

### 5. **Authentication Flow**

#### Login Process:

1. User submits email/password
2. Backend validates credentials
3. Backend revokes all existing refresh tokens (security measure)
4. Backend generates new access + refresh tokens with user's unique ID
5. Backend sets tokens as HTTP-only cookies
6. Backend returns user data (NOT tokens in response body)
7. Frontend stores user in context
8. Frontend redirects to dashboard

#### Authentication Check (on app load):

1. Frontend calls `/auth/me` endpoint
2. Backend reads access token from HTTP-only cookie
3. Backend verifies JWT signature and expiration
4. Backend looks up user by ID from token payload
5. Backend returns user data if valid
6. Frontend sets user in context if authenticated
7. Frontend redirects to login if 401 error

#### Logout Process:

1. User clicks logout
2. Frontend calls `/auth/logout` endpoint
3. Backend revokes refresh token from database
4. Backend clears both cookies (`accessToken` and `refreshToken`)
5. Frontend clears user from context
6. Frontend redirects to login

### 6. **Error Handling**

-   **401 auto-redirect**: API client automatically redirects to login on 401 errors
-   **Token expiry handling**: Expired tokens trigger re-authentication
-   **Graceful degradation**: Failed auth checks don't crash the app

### 7. **Debugging & Monitoring**

-   **Console logging**: Added debug logs for token generation and validation
-   **User identification**: Logs show which user tokens belong to
-   **Error tracking**: Authentication failures are logged for debugging

---

## Security Best Practices Applied

### ✅ Never Store Tokens in localStorage

-   Tokens are in HTTP-only cookies, not accessible to JavaScript
-   Prevents XSS attacks from stealing tokens

### ✅ CORS Configuration

-   Strict CORS policy: Only allows frontend URL
-   Credentials enabled for cookie transmission
-   Prevents unauthorized cross-origin requests

### ✅ Strong JWT Secrets

-   64-character hexadecimal secrets
-   Separate secrets for access and refresh tokens
-   Secrets are environment variables, never hardcoded

### ✅ Password Security

-   Bcrypt hashing with 10 salt rounds
-   Passwords never stored in plain text
-   Secure password comparison

### ✅ Session Fixation Prevention

-   All old tokens revoked on new login
-   Prevents attacker from maintaining access

### ✅ No Default Users

-   No hardcoded or default users
-   Authentication always required for protected routes
-   No automatic login without valid credentials

---

## Cookie Configuration

```typescript
// Access Token Cookie
{
  httpOnly: true,              // Not accessible via JavaScript
  secure: NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict',          // CSRF protection
  path: '/',                   // Available across entire domain
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
}

// Refresh Token Cookie
{
  httpOnly: true,
  secure: NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
}
```

---

## Testing the Security

### 1. Test Logout

-   Clear browser cookies
-   Try accessing `/dashboard` → should redirect to `/auth`

### 2. Test Token Expiration

-   Login, wait for token to expire
-   Try accessing protected route → should redirect to login

### 3. Test Multiple Logins

-   Login as User A in Browser 1
-   Login as User A in Browser 2
-   Browser 1's token should be revoked (single session)

### 4. Test XSS Protection

-   Open browser console
-   Try `document.cookie` → access token should not appear
-   Tokens are protected from JavaScript access

### 5. Test Protected Routes

-   Without logging in, try to access `/dashboard`
-   Should be redirected to `/auth`

---

## Environment Variables Required

```env
# JWT Configuration
JWT_SECRET="<64-character-hex-string>"
JWT_REFRESH_SECRET="<64-character-hex-string>"
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Server Configuration
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

---

## Troubleshooting

### Issue: "Automatically logged in as different user after restart"

**Cause**: Browser cookies from previous session still present
**Solution**:

1. Clear all browser cookies for localhost
2. Clear localStorage/sessionStorage
3. Restart both frontend and backend
4. You should not be logged in automatically

### Issue: "Cannot access protected routes"

**Cause**: Token expired or invalid
**Solution**:

1. Check browser console for 401 errors
2. Check backend logs for token validation errors
3. Clear cookies and login again

### Issue: "CORS errors"

**Cause**: Frontend URL doesn't match `FRONTEND_URL` in `.env`
**Solution**: Update `FRONTEND_URL` to match your actual frontend URL

---

## Files Modified

### Frontend

-   `src/components/ProtectedRoute.tsx` - New protected route component
-   `src/components/PublicRoute.tsx` - New public route component
-   `src/App.tsx` - Added route guards
-   `src/contexts/UserContext.tsx` - Enhanced auth checking with logging
-   `src/lib/api.ts` - Added 401 auto-redirect

### Backend

-   `src/controllers/authController.ts` - Added session fixation prevention, debug logging
-   Cookie configuration - Added `path: '/'` to all cookies

---

## Security Checklist

-   [x] Unique JWT per user
-   [x] HTTP-only cookies
-   [x] Secure flag in production
-   [x] SameSite CSRF protection
-   [x] Token expiration
-   [x] Session fixation prevention
-   [x] Protected routes (frontend)
-   [x] Authentication middleware (backend)
-   [x] Automatic 401 redirect
-   [x] No default users
-   [x] Strong JWT secrets
-   [x] Password hashing
-   [x] Token revocation on logout
-   [x] CORS configuration
-   [x] Debug logging

---

## Next Steps for Production

1. **Set `NODE_ENV=production`** in production environment
2. **Use HTTPS** - Secure cookies only work over HTTPS in production
3. **Rotate JWT secrets** periodically
4. **Enable rate limiting** on auth endpoints
5. **Add 2FA** for enhanced security
6. **Monitor failed login attempts** for security threats
7. **Implement account lockout** after multiple failed attempts

---

**Last Updated**: November 5, 2025
