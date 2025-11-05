import express from 'express';
import { getProjectActivities } from '../controllers/activityController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Get project activities
router.get('/projects/:projectId/activity', authenticateToken, getProjectActivities);

export default router;
