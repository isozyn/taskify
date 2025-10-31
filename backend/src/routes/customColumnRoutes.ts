// Custom Column Routes

import { Router } from 'express';
import { CustomColumnController } from '../controllers/customColumnController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all columns for a project
router.get('/projects/:projectId/columns', CustomColumnController.getColumnsByProject);

// Get a single column
router.get('/columns/:columnId', CustomColumnController.getColumnById);

// Create a new column
router.post('/projects/:projectId/columns', CustomColumnController.createColumn);

// Update a column
router.put('/columns/:columnId', CustomColumnController.updateColumn);

// Delete a column
router.delete('/columns/:columnId', CustomColumnController.deleteColumn);

// Reorder columns
router.put('/projects/:projectId/columns/reorder', CustomColumnController.reorderColumns);

export default router;
