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

---

## Project Endpoints

### 1. Create Project (CUSTOM Workflow)

**Endpoint**: `POST /api/v1/projects`

**Authentication**: Required (Bearer Token)

**Headers**:
- `Content-Type: application/json`
- `Authorization: Bearer <your_access_token>`

**Request Body** (JSON):
```json
{
  "name": "Website Redesign",
  "description": "Complete redesign of company website",
  "workflowType": "CUSTOM"
}
```

**Fields**:
- `name`: Required, 1-200 characters
- `description`: Optional
- `workflowType`: Required, must be either "CUSTOM" or "AUTOMATED"

**Expected Response** (201 Created):
```json
{
  "id": 1,
  "name": "Website Redesign",
  "description": "Complete redesign of company website",
  "workflowType": "CUSTOM",
  "ownerId": 1,
  "createdAt": "2025-10-30T10:30:00.000Z",
  "updatedAt": "2025-10-30T10:30:00.000Z"
}
```

**Behavior**:
- For CUSTOM workflow, default columns are automatically created:
  - "To Do" (order: 0, color: #3B82F6)
  - "In Progress" (order: 1, color: #F59E0B)
  - "Done" (order: 2, color: #10B981)

**Error Responses**:
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Server error

---

### 2. Create Project (AUTOMATED Workflow)

**Endpoint**: `POST /api/v1/projects`

**Authentication**: Required (Bearer Token)

**Headers**:
- `Content-Type: application/json`
- `Authorization: Bearer <your_access_token>`

**Request Body** (JSON):
```json
{
  "name": "Sprint 5 - Q4 2025",
  "description": "Development sprint with automated workflow",
  "workflowType": "AUTOMATED"
}
```

**Expected Response** (201 Created):
```json
{
  "id": 2,
  "name": "Sprint 5 - Q4 2025",
  "description": "Development sprint with automated workflow",
  "workflowType": "AUTOMATED",
  "ownerId": 1,
  "createdAt": "2025-10-30T10:30:00.000Z",
  "updatedAt": "2025-10-30T10:30:00.000Z"
}
```

**Behavior**:
- AUTOMATED workflow uses fixed columns:
  - Upcoming (for tasks with future start dates)
  - In Progress (for tasks between start and end dates)
  - Review (for tasks past end date)
  - Complete (for manually completed tasks)
  - Backlog (for blocked tasks)

**Important**: `workflowType` **cannot be changed** after project creation.

---

### 3. Get All Projects

**Endpoint**: `GET /api/v1/projects`

**Authentication**: Required (Bearer Token)

**Headers**:
- `Authorization: Bearer <your_access_token>`

**Expected Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Website Redesign",
    "description": "Complete redesign of company website",
    "workflowType": "CUSTOM",
    "ownerId": 1,
    "createdAt": "2025-10-30T10:30:00.000Z",
    "updatedAt": "2025-10-30T10:30:00.000Z"
  },
  {
    "id": 2,
    "name": "Sprint 5 - Q4 2025",
    "description": "Development sprint with automated workflow",
    "workflowType": "AUTOMATED",
    "ownerId": 1,
    "createdAt": "2025-10-30T10:35:00.000Z",
    "updatedAt": "2025-10-30T10:35:00.000Z"
  }
]
```

---

### 4. Get Project by ID

**Endpoint**: `GET /api/v1/projects/:projectId`

**Authentication**: Required (Bearer Token)

**Headers**:
- `Authorization: Bearer <your_access_token>`

**Example**: `GET /api/v1/projects/1`

**Expected Response** (200 OK):
```json
{
  "id": 1,
  "name": "Website Redesign",
  "description": "Complete redesign of company website",
  "workflowType": "CUSTOM",
  "ownerId": 1,
  "createdAt": "2025-10-30T10:30:00.000Z",
  "updatedAt": "2025-10-30T10:30:00.000Z"
}
```

**Error Responses**:
- `404 Not Found`: Project does not exist
- `401 Unauthorized`: Missing or invalid token

---

### 5. Update Project

**Endpoint**: `PUT /api/v1/projects/:projectId`

**Authentication**: Required (Bearer Token)

**Headers**:
- `Content-Type: application/json`
- `Authorization: Bearer <your_access_token>`

**Request Body** (JSON):
```json
{
  "name": "Website Redesign - Phase 2",
  "description": "Updated project description"
}
```

**Expected Response** (200 OK):
```json
{
  "id": 1,
  "name": "Website Redesign - Phase 2",
  "description": "Updated project description",
  "workflowType": "CUSTOM",
  "ownerId": 1,
  "createdAt": "2025-10-30T10:30:00.000Z",
  "updatedAt": "2025-10-30T11:00:00.000Z"
}
```

**Note**: `workflowType` field is **ignored** if included - it cannot be changed after creation.

---

### 6. Delete Project

**Endpoint**: `DELETE /api/v1/projects/:projectId`

**Authentication**: Required (Bearer Token)

**Headers**:
- `Authorization: Bearer <your_access_token>`

**Example**: `DELETE /api/v1/projects/1`

**Expected Response** (200 OK):
```json
{
  "message": "Project deleted successfully"
}
```

**Behavior**:
- Deletes all associated tasks and custom columns (CASCADE)

---

## Testing Projects - Step by Step

### Step 1: Login and Get Access Token
1. **Method**: `POST`
2. **URL**: `http://localhost:5000/api/v1/auth/login`
3. **Body**:
   ```json
   {
     "email": "test@example.com",
     "password": "TestPass123"
   }
   ```
4. **Copy the `accessToken`** from response

### Step 2: Create CUSTOM Workflow Project
1. **Method**: `POST`
2. **URL**: `http://localhost:5000/api/v1/projects`
3. **Headers**:
   - `Content-Type: application/json`
   - `Authorization: Bearer <paste_your_token_here>`
4. **Body**:
   ```json
   {
     "name": "My First Project",
     "description": "Testing custom workflow",
     "workflowType": "CUSTOM"
   }
   ```
5. **Verify**: 
   - Status is `201`
   - Response includes project `id`
   - `workflowType` is "CUSTOM"
6. **Save the project `id`** for next steps

### Step 3: Verify Default Columns Created
1. **Method**: `GET`
2. **URL**: `http://localhost:5000/api/v1/projects/<project_id>/columns`
3. **Headers**:
   - `Authorization: Bearer <your_token>`
4. **Verify**: Three default columns exist (To Do, In Progress, Done)

### Step 4: Create AUTOMATED Workflow Project
1. **Method**: `POST`
2. **URL**: `http://localhost:5000/api/v1/projects`
3. **Headers**:
   - `Content-Type: application/json`
   - `Authorization: Bearer <your_token>`
4. **Body**:
   ```json
   {
     "name": "Sprint Project",
     "description": "Testing automated workflow",
     "workflowType": "AUTOMATED"
   }
   ```
5. **Verify**: 
   - Status is `201`
   - `workflowType` is "AUTOMATED"

### Step 5: Get All Projects
1. **Method**: `GET`
2. **URL**: `http://localhost:5000/api/v1/projects`
3. **Headers**:
   - `Authorization: Bearer <your_token>`
4. **Verify**: Both projects appear in list

### Step 6: Update Project
1. **Method**: `PUT`
2. **URL**: `http://localhost:5000/api/v1/projects/<project_id>`
3. **Headers**:
   - `Content-Type: application/json`
   - `Authorization: Bearer <your_token>`
4. **Body**:
   ```json
   {
     "name": "Updated Project Name"
   }
   ```
5. **Verify**: Name is updated, `workflowType` remains unchanged

---

## Postman Collection Setup for Projects

### Save Project ID Automatically
Add this script to the **Create Project** request under "Tests" tab:

```javascript
// Save project ID to environment
const response = pm.response.json();
if (response.id) {
    // Save based on workflow type
    if (response.workflowType === 'CUSTOM') {
        pm.environment.set("customProjectId", response.id);
    } else if (response.workflowType === 'AUTOMATED') {
        pm.environment.set("automatedProjectId", response.id);
    }
    // Also save as general projectId
    pm.environment.set("projectId", response.id);
}
```

### Environment Variables for Projects
Add these to your Postman environment:

| Variable | Initial Value | Description |
|----------|--------------|-------------|
| `projectId` | - | Most recently created project ID |
| `customProjectId` | - | Last CUSTOM workflow project ID |
| `automatedProjectId` | - | Last AUTOMATED workflow project ID |

---

## Common Testing Scenarios - Projects

### Test Case 1: Create Project Without Token
**Headers**: Don't include Authorization
**Expected**: `401 Unauthorized`

### Test Case 2: Create Project with Invalid Workflow Type
**Body**:
```json
{
  "name": "Test Project",
  "workflowType": "INVALID"
}
```
**Expected**: `400 Bad Request` with validation error

### Test Case 3: Create Project Without Name
**Body**:
```json
{
  "workflowType": "CUSTOM"
}
```
**Expected**: `400 Bad Request` - name is required

### Test Case 4: Try to Change Workflow Type
**Method**: `PUT /api/v1/projects/1`
**Body**:
```json
{
  "name": "Updated Name",
  "workflowType": "AUTOMATED"
}
```
**Expected**: `200 OK` but `workflowType` remains unchanged (CUSTOM)

### Test Case 5: Get Non-existent Project
**URL**: `GET /api/v1/projects/99999`
**Expected**: `404 Not Found`

---

## Workflow Type Comparison

| Feature | CUSTOM Workflow | AUTOMATED Workflow |
|---------|----------------|-------------------|
| **Columns** | User-defined, can create/edit/delete | Fixed (Upcoming, In Progress, Review, Complete, Backlog) |
| **Task Dates** | Optional | Required (startDate and endDate) |
| **Task Organization** | By columnId | By calculated status based on dates |
| **Status Calculation** | Manual (user moves tasks) | Automatic (based on current date) |
| **Best For** | Flexible workflows, custom processes | Time-based sprints, deadlines |

---

## Next Steps

1. ✅ Test all authentication endpoints
2. ✅ Verify user registration in database
3. ✅ Verify login returns valid JWT
4. ✅ Test token refresh mechanism
5. ✅ Test logout functionality
6. ✅ Test project creation (CUSTOM and AUTOMATED)
7. ✅ Verify default columns creation for CUSTOM workflow
8. 🔄 Test custom column endpoints (next section)
9. 🔄 Test task creation with workflow-specific validation
10. 🔄 Test automated status calculation

---

## Support

If you encounter issues:
1. Check server logs in terminal
2. Verify all environment variables are set
3. Ensure database migrations are applied
4. Check Postman console for detailed request/response info
5. Verify backend server is running on port 5000
6. Check that Prisma Client is generated (`npx prisma generate`)
