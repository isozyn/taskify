// Google OAuth Service
// Handles Google authentication flow

import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

/**
 * Generate Google OAuth URL
 * This creates the URL that users will be redirected to for Google login
 */
export const getGoogleAuthUrl = (): string => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  const authUrl = client.generateAuthUrl({
    access_type: 'offline', // Get refresh token
    scope: scopes,
    prompt: 'consent', // Force consent screen to get refresh token
  });

  return authUrl;
};

/**
 * Verify Google OAuth token
 * This exchanges the authorization code for user information
 */
export const verifyGoogleToken = async (code: string) => {
  try {
    // Exchange authorization code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Verify the ID token and get user info
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error('Failed to get user payload from Google');
    }

    // Return user information
    return {
      email: payload.email!,
      name: payload.name!,
      picture: payload.picture,
      emailVerified: payload.email_verified || false,
      googleId: payload.sub, // Google's unique user ID
    };
  } catch (error) {
    console.error('Error verifying Google token:', error);
    throw new Error('Failed to verify Google token');
  }
};

/**
 * Get user info from access token (alternative method)
 */
export const getUserInfoFromToken = async (accessToken: string) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user info from Google');
    }

    const data = await response.json();

    return {
      email: data.email,
      name: data.name,
      picture: data.picture,
      emailVerified: data.email_verified,
      googleId: data.sub,
    };
  } catch (error) {
    console.error('Error getting user info from Google:', error);
    throw new Error('Failed to get user info from Google');
  }
};
