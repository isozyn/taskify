# Taskify API Quick Reference

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication Endpoints

### 1. Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (201)**:
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

---

### 2. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123",
  "rememberMe": true
}
```

**Response (200)**:
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

**Sets Cookie**: `refreshToken=<token>; HttpOnly; Secure; SameSite=Strict`

---

### 3. Refresh Token
```http
POST /auth/refresh
Cookie: refreshToken=<token_from_login>
```

**Response (200)**:
```json
{
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 4. Logout
```http
POST /auth/logout
Cookie: refreshToken=<token_from_login>
```

**Response (200)**:
```json
{
  "message": "Logout successful"
}
```

**Effect**: Clears `refreshToken` cookie and revokes token in database

---

## Using Protected Endpoints

For endpoints that require authentication, include the access token:

```http
GET /users/me
Authorization: Bearer <access_token_from_login>
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Password must be at least 8 characters long",
      "param": "password",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid email or password"
}
```

### 403 Forbidden
```json
{
  "message": "Invalid or expired access token"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Route not found",
  "path": "/api/v1/wrong/path"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Internal Server Error"
}
```

---

## Postman Collection Import

Save this as `taskify-api.postman_collection.json`:

```json
{
  "info": {
    "name": "Taskify API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"password\": \"TestPass123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "register"]
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"TestPass123\",\n  \"rememberMe\": true\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "login"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const response = pm.response.json();",
                  "if (response.accessToken) {",
                  "    pm.environment.set(\"accessToken\", response.accessToken);",
                  "}"
                ]
              }
            }
          ]
        },
        {
          "name": "Refresh Token",
          "request": {
            "method": "POST",
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/refresh",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "refresh"]
            }
          }
        },
        {
          "name": "Logout",
          "request": {
            "method": "POST",
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/logout",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "logout"]
            }
          }
        }
      ]
    },
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{baseUrl}}/api/v1/health",
          "host": ["{{baseUrl}}"],
          "path": ["api", "v1", "health"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000"
    }
  ]
}
```

Import this file in Postman: **Import** → **Upload Files** → Select file

---

## Environment Variables for Postman

Create an environment with:

| Variable | Value |
|----------|-------|
| `baseUrl` | `http://localhost:5000` |
| `accessToken` | (auto-set from login response) |

---

## Quick cURL Examples

### Register
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"TestPass123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123","rememberMe":true}' \
  -c cookies.txt
```

### Refresh (using saved cookies)
```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -b cookies.txt
```

### Logout
```bash
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -b cookies.txt
```

---

## Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)

**Valid Examples**:
- `SecurePass123`
- `MyPassword1`
- `Test1234User`

**Invalid Examples**:
- `weak` (too short)
- `alllowercase1` (no uppercase)
- `ALLUPPERCASE1` (no lowercase)
- `NoNumbers` (no digit)

---

## Token Expiry

- **Access Token**: 7 days (configurable via `JWT_EXPIRES_IN`)
- **Refresh Token**: 30 days (configurable via `JWT_REFRESH_EXPIRES_IN`)
- **Cookie Max Age**: 
  - With `rememberMe: true` → 30 days
  - With `rememberMe: false` → 7 days

---

## Testing Tips

1. **Save Access Token**: Use Postman "Tests" tab to auto-save token from login
2. **Enable Cookies**: Ensure Postman cookie management is enabled
3. **Check Logs**: Watch terminal for server logs during requests
4. **Database Verification**: Use `npx prisma studio` to view database records
5. **Clear Cookies**: In Postman, go to Cookies → Manage Cookies → Remove All

---

Happy Testing! 🚀
