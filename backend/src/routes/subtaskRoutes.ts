import { Router } from 'express';
import {
  getSubtasks,
  createSubtask,
  updateSubtask,
  deleteSubtask,
} from '../controllers/subtaskController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// All subtask routes require authentication
router.use(authenticateToken);

// Subtask routes
router.get('/tasks/:taskId/subtasks', getSubtasks);
router.post('/tasks/:taskId/subtasks', createSubtask);
router.put('/subtasks/:subtaskId', updateSubtask);
router.delete('/subtasks/:subtaskId', deleteSubtask);

export default router;
