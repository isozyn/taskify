# Taskify Backend - Postman Testing Guide

## Server Information
- **Base URL**: `http://localhost:5000`
- **API Version**: `v1`
- **Base Path**: `/api/v1`

## Authentication Endpoints

### 1. Register New User

**Endpoint**: `POST /api/v1/auth/register`

**Request Body** (JSON):
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Validation Requirements**:
- `email`: Must be a valid email format
- `password`: Minimum 8 characters, must contain at least:
  - One uppercase letter
  - One lowercase letter
  - One number
- `name`: Optional, 2-100 characters if provided

**Expected Response** (201 Created):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": null,
    "role": "USER",
    "isEmailVerified": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors or user already exists
- `500 Internal Server Error`: Server error

---

### 2. Login User

**Endpoint**: `POST /api/v1/auth/login`

**Request Body** (JSON):
```json
{
  "email": "john@example.com",
  "password": "SecurePass123",
  "rememberMe": true
}
```

**Fields**:
- `email`: Required, valid email format
- `password`: Required
- `rememberMe`: Optional boolean (affects cookie expiry)

**Expected Response** (200 OK):
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": null,
    "role": "USER",
    "isEmailVerified": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response Headers**:
- `Set-Cookie: refreshToken=<token>; HttpOnly; Path=/; SameSite=Strict`

**Error Responses**:
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid email or password
- `500 Internal Server Error`: Server error

---

### 3. Refresh Access Token

**Endpoint**: `POST /api/v1/auth/refresh`

**Request**:
- No body required
- Refresh token automatically sent via HttpOnly cookie

**Expected Response** (200 OK):
```json
{
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:
- `401 Unauthorized`: Refresh token not provided, invalid, or expired
- `500 Internal Server Error`: Server error

---

### 4. Logout User

**Endpoint**: `POST /api/v1/auth/logout`

**Request**:
- No body required
- Refresh token automatically sent via HttpOnly cookie

**Expected Response** (200 OK):
```json
{
  "message": "Logout successful"
}
```

**Effect**:
- Refresh token revoked from database
- Cookie cleared

---

## Testing Steps

### Step 1: Health Check
1. **Method**: `GET`
2. **URL**: `http://localhost:5000/api/v1/health`
3. **Expected Response**:
   ```json
   {
     "status": "OK",
     "message": "Server is running"
   }
   ```

### Step 2: Register a New User
1. **Method**: `POST`
2. **URL**: `http://localhost:5000/api/v1/auth/register`
3. **Headers**:
   - `Content-Type: application/json`
4. **Body** (raw JSON):
   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "TestPass123"
   }
   ```
5. **Verify**: Check response status is `201` and user object is returned

### Step 3: Login with Created User
1. **Method**: `POST`
2. **URL**: `http://localhost:5000/api/v1/auth/login`
3. **Headers**:
   - `Content-Type: application/json`
4. **Body** (raw JSON):
   ```json
   {
     "email": "test@example.com",
     "password": "TestPass123",
     "rememberMe": true
   }
   ```
5. **Verify**: 
   - Status is `200`
   - `accessToken` is present in response
   - Cookie named `refreshToken` is set (check Cookies tab in Postman)
6. **Copy the `accessToken`** for protected routes

### Step 4: Test Protected Endpoint (After Implementation)
1. **Method**: `GET` (or other protected route)
2. **URL**: Example: `http://localhost:5000/api/v1/users/me`
3. **Headers**:
   - `Content-Type: application/json`
   - `Authorization: Bearer <paste_access_token_here>`
4. **Verify**: Authorized access to protected resource

### Step 5: Test Refresh Token
1. **Method**: `POST`
2. **URL**: `http://localhost:5000/api/v1/auth/refresh`
3. **Headers**:
   - `Content-Type: application/json`
4. **Verify**: 
   - New `accessToken` is returned
   - Cookie is automatically sent (if you logged in from same Postman session)

### Step 6: Test Logout
1. **Method**: `POST`
2. **URL**: `http://localhost:5000/api/v1/auth/logout`
3. **Headers**:
   - `Content-Type: application/json`
4. **Verify**:
   - Status is `200`
   - Cookie is cleared (check Cookies tab)

---

## Common Testing Scenarios

### Test Case 1: Register with Invalid Email
**Body**:
```json
{
  "email": "invalid-email",
  "password": "TestPass123"
}
```
**Expected**: `400 Bad Request` with validation errors

### Test Case 2: Register with Weak Password
**Body**:
```json
{
  "email": "user@example.com",
  "password": "weak"
}
```
**Expected**: `400 Bad Request` with password validation error

### Test Case 3: Register Duplicate Email
**Body**: Same email as existing user
**Expected**: `400 Bad Request` with "User with this email already exists"

### Test Case 4: Login with Wrong Password
**Body**:
```json
{
  "email": "test@example.com",
  "password": "WrongPassword123"
}
```
**Expected**: `401 Unauthorized` with "Invalid email or password"

### Test Case 5: Login with Non-existent Email
**Body**:
```json
{
  "email": "notfound@example.com",
  "password": "TestPass123"
}
```
**Expected**: `401 Unauthorized` with "Invalid email or password"

---

## Postman Collection Setup

### Environment Variables
Create a Postman environment with these variables:

| Variable | Initial Value | Current Value |
|----------|--------------|---------------|
| `baseUrl` | `http://localhost:5000` | - |
| `apiVersion` | `v1` | - |
| `accessToken` | - | (auto-set from login) |

### Auto-Save Access Token
Add this script to the **Login** request under "Tests" tab:

```javascript
// Save access token to environment
const response = pm.response.json();
if (response.accessToken) {
    pm.environment.set("accessToken", response.accessToken);
}
```

### Use Token in Protected Requests
In Authorization tab:
- Type: `Bearer Token`
- Token: `{{accessToken}}`

---

## Troubleshooting

### Issue: "Database connection failed"
**Solution**: 
1. Check `.env` file has correct `DATABASE_URL`
2. Verify Neon database is accessible
3. Run `npx prisma migrate dev` to ensure schema is up to date

### Issue: "Cannot set headers after they are sent"
**Solution**: 
- Check controllers have `return` statements after sending responses
- Ensure middleware calls `next()` only once

### Issue: Cookies not being saved
**Solution**:
1. In Postman, enable "Automatically follow redirects"
2. Make sure "Send cookies" is enabled in request settings
3. Check that `FRONTEND_URL` in `.env` matches your testing environment

### Issue: JWT Token Expired
**Solution**:
- Login again to get a new access token
- Use refresh endpoint to renew token
- Check `JWT_EXPIRES_IN` in `.env` (default: 7 days)

---

## Database Verification

After registration, you can verify the user was created:

1. Open Prisma Studio: `npx prisma studio`
2. Navigate to `User` model
3. Check if user exists with hashed password
4. Check `RefreshToken` table after login

---

## Security Notes

### HttpOnly Cookies
- Refresh tokens are stored as HttpOnly cookies
- Cannot be accessed by JavaScript (XSS protection)
- Automatically sent with requests to same domain

### Password Hashing
- Passwords are hashed using bcrypt
- Salt rounds: 10 (configurable via `BCRYPT_SALT_ROUNDS`)
- Never stored in plain text

### JWT Tokens
- Access tokens: Short-lived (7 days default)
- Refresh tokens: Long-lived (30 days default)
- Signed with separate secrets

---

## Next Steps

1. ✅ Test all authentication endpoints
2. ✅ Verify user registration in database
3. ✅ Verify login returns valid JWT
4. ✅ Test token refresh mechanism
5. ✅ Test logout functionality
6. 🔄 Implement user profile endpoints (GET /api/v1/users/me)
7. 🔄 Implement project and task endpoints

---

## Support

If you encounter issues:
1. Check server logs in terminal
2. Verify all environment variables are set
3. Ensure database migrations are applied
4. Check Postman console for detailed request/response info
