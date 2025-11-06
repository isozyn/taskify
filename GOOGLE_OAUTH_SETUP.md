# Google OAuth Setup Guide for Taskify

This guide will walk you through setting up Google OAuth authentication for your Taskify application.

## Overview

Google OAuth allows users to sign in using their Google account instead of creating a new password. This provides:
- **Better security** - No password to remember or store
- **Faster signup** - One-click registration
- **Verified emails** - Google emails are pre-verified
- **Better UX** - Familiar Google login flow

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Taskify" (or your preferred name)
4. Click "Create"

## Step 2: Enable Google+ API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" (unless you have a Google Workspace)
3. Click "Create"

### Fill in the required information:

**App information:**
- App name: `Taskify`
- User support email: `your-email@gmail.com`
- App logo: (optional, upload your logo)

**App domain:**
- Application home page: `http://localhost:8080` (for development)
- Privacy policy: `http://localhost:8080/privacy` (create this page later)
- Terms of service: `http://localhost:8080/terms` (create this page later)

**Developer contact information:**
- Email: `your-email@gmail.com`

4. Click "Save and Continue"

### Scopes:
5. Click "Add or Remove Scopes"
6. Select these scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
7. Click "Update" → "Save and Continue"

### Test users (for development):
8. Add your email and any test user emails
9. Click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"

### Configure the OAuth client:

**Name:** `Taskify Web Client`

**Authorized JavaScript origins:**
```
http://localhost:8080
http://localhost:5000
```

**Authorized redirect URIs:**
```
http://localhost:5000/api/v1/auth/google/callback
```

4. Click "Create"
5. **IMPORTANT:** Copy your Client ID and Client Secret

## Step 5: Update Backend Environment Variables

Open `taskify/backend/.env` and update these values:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/v1/auth/google/callback
```

Replace `your-actual-client-id` and `your-actual-client-secret` with the values from Step 4.

## Step 6: Install Dependencies

```bash
cd taskify/backend
npm install google-auth-library
```

## Step 7: Run Database Migration

You need to update your database schema to support Google OAuth.

### Option A: Using Prisma (Recommended)

```bash
cd taskify/backend
npx prisma db push
```

### Option B: Using SQL directly

```bash
cd taskify/backend
psql -U postgres -d taskify_db -f google_oauth_migration.sql
```

## Step 8: Test the Integration

1. **Start the backend:**
```bash
cd taskify/backend
npm run dev
```

2. **Start the frontend:**
```bash
cd taskify/frontend
npm run dev
```

3. **Test Google Login:**
   - Go to `http://localhost:8080/auth`
   - Click "Continue with Google"
   - You should be redirected to Google's login page
   - After logging in, you'll be redirected back to your dashboard

## How It Works

### Frontend Flow:
1. User clicks "Continue with Google"
2. Frontend calls `/api/v1/auth/google` to get OAuth URL
3. User is redirected to Google's login page
4. User authorizes the app
5. Google redirects to `/api/v1/auth/google/callback` with code
6. Backend exchanges code for user info
7. Backend creates/logs in user
8. User is redirected to dashboard with auth cookies

### Backend Flow:
```
GET /api/v1/auth/google
  ↓
Returns Google OAuth URL
  ↓
User authorizes on Google
  ↓
GET /api/v1/auth/google/callback?code=xxx
  ↓
Verify code with Google
  ↓
Get user info (email, name, picture)
  ↓
Check if user exists by googleId
  ↓
If not, check by email
  ↓
Create new user OR link Google to existing user
  ↓
Generate JWT tokens
  ↓
Set httpOnly cookies
  ↓
Redirect to dashboard
```

## Security Features

1. **HttpOnly Cookies** - Tokens stored in httpOnly cookies (not accessible via JavaScript)
2. **CSRF Protection** - SameSite cookie attribute prevents CSRF attacks
3. **Token Verification** - Google tokens are verified server-side
4. **Email Verification** - Google emails are pre-verified
5. **Secure Redirect** - Only whitelisted redirect URIs are allowed

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Make sure the redirect URI in Google Console exactly matches your backend URL
- Check for trailing slashes
- Verify the protocol (http vs https)

### Error: "invalid_client"
- Double-check your Client ID and Client Secret in `.env`
- Make sure there are no extra spaces or quotes

### Error: "access_denied"
- User cancelled the authorization
- Check if your app is in "Testing" mode and user is added as test user

### Users can't sign in
- Check if Google+ API is enabled
- Verify OAuth consent screen is configured
- Check backend logs for errors

## Production Deployment

When deploying to production:

1. **Update Google Console:**
   - Add production domain to Authorized JavaScript origins
   - Add production callback URL to Authorized redirect URIs
   - Example: `https://taskify.com` and `https://api.taskify.com/api/v1/auth/google/callback`

2. **Update Environment Variables:**
```env
GOOGLE_REDIRECT_URI=https://api.taskify.com/api/v1/auth/google/callback
FRONTEND_URL=https://taskify.com
```

3. **Publish OAuth Consent Screen:**
   - Go to OAuth consent screen
   - Click "Publish App"
   - Submit for verification (required for >100 users)

## Additional Features

### Account Linking
If a user signs up with email/password and later tries to sign in with Google using the same email, the accounts will be automatically linked.

### Profile Pictures
Google profile pictures are automatically saved to the user's avatar field.

### Email Verification
Users who sign in with Google have their email automatically verified.

## Support

For issues or questions:
- Check Google OAuth documentation: https://developers.google.com/identity/protocols/oauth2
- Review backend logs for detailed error messages
- Test with different Google accounts

## Summary

You've successfully implemented Google OAuth! Users can now:
- ✅ Sign in with their Google account
- ✅ Sign up without creating a password
- ✅ Have their email automatically verified
- ✅ Use their Google profile picture
- ✅ Link Google to existing accounts
