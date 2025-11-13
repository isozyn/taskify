// Test routes for development
// These should be disabled in production

import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

/**
 * Test endpoint to get current user's token info
 * GET /api/v1/test/token-info
 */
router.get('/token-info', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  
  res.json({
    message: 'Token is valid',
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    note: 'Your access token is in the Authorization header or cookies',
  });
});

/**
 * Test endpoint to display token from cookies
 * GET /api/v1/test/show-token
 */
router.get('/show-token', (req: Request, res: Response) => {
  const accessToken = req.cookies?.accessToken;
  const refreshToken = req.cookies?.refreshToken;
  
  if (!accessToken) {
    res.status(401).json({
      error: 'No access token found in cookies',
      help: 'Please login first via /api/v1/auth/google',
    });
    return;
  }
  
  res.json({
    message: 'Tokens retrieved from cookies',
    accessToken,
    refreshToken: refreshToken ? 'Present (hidden for security)' : 'Not found',
    usage: {
      curl: `curl -H "Authorization: Bearer ${accessToken}" http://localhost:5000/api/v1/calendar/sync/status`,
      javascript: `fetch('http://localhost:5000/api/v1/calendar/sync/status', { headers: { 'Authorization': 'Bearer ${accessToken}' } })`,
    },
  });
});

export default router;
