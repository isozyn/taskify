# Google OAuth Quick Start

## 🚀 Quick Setup (5 minutes)

### 1. Get Google Credentials
1. Go to https://console.cloud.google.com/
2. Create new project → Enable Google+ API
3. OAuth consent screen → External → Fill basic info
4. Credentials → Create OAuth Client ID → Web application
5. Add redirect URI: `http://localhost:5000/api/v1/auth/google/callback`
6. Copy Client ID and Client Secret

### 2. Update .env
```bash
cd taskify/backend
```

Edit `.env`:
```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/v1/auth/google/callback
```

### 3. Install Package
```bash
npm install google-auth-library
```

### 4. Update Database
```bash
npx prisma db push
```

### 5. Test It!
```bash
# Terminal 1 - Backend
cd taskify/backend
npm run dev

# Terminal 2 - Frontend  
cd taskify/frontend
npm run dev
```

Go to http://localhost:8080/auth and click "Continue with Google"

## ✅ What's Implemented

**Backend:**
- ✅ Google OAuth service (`googleAuthService.ts`)
- ✅ Auth controller endpoints (`/auth/google`, `/auth/google/callback`)
- ✅ User model updated (googleId, authProvider fields)
- ✅ Database schema updated
- ✅ Account linking (email matching)

**Frontend:**
- ✅ Google login button (both login and signup pages)
- ✅ OAuth flow handler
- ✅ Automatic redirect after auth
- ✅ Error handling

**Security:**
- ✅ HttpOnly cookies for tokens
- ✅ Server-side token verification
- ✅ CSRF protection (SameSite cookies)
- ✅ Secure redirect validation

## 🔧 Files Modified/Created

**Backend:**
- `package.json` - Added google-auth-library
- `.env` - Added Google OAuth credentials
- `prisma/schema.prisma` - Added googleId, authProvider
- `src/services/googleAuthService.ts` - NEW
- `src/controllers/authController.ts` - Added googleAuth, googleCallback
- `src/services/userService.ts` - Added findUserByGoogleId
- `src/models/User.ts` - Updated UserCreateInput
- `src/routes/authRoutes.ts` - Added /google routes
- `google_oauth_migration.sql` - NEW

**Frontend:**
- `src/pages/Auth.tsx` - Added handleGoogleLogin
- `src/lib/api.ts` - Added googleAuth method

## 📝 Common Issues

**"redirect_uri_mismatch"**
→ Check redirect URI in Google Console matches exactly

**"invalid_client"**
→ Verify Client ID/Secret in .env (no extra spaces)

**"access_denied"**
→ Add yourself as test user in OAuth consent screen

## 🎯 Next Steps

For production:
1. Add production domain to Google Console
2. Update GOOGLE_REDIRECT_URI in .env
3. Publish OAuth consent screen
4. Submit for verification (if >100 users)
