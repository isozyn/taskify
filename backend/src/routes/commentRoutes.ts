import express from 'express';
import { CommentController } from '../controllers/commentController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Get all comments for a task
router.get('/tasks/:taskId/comments', authenticateToken, CommentController.getTaskComments);

// Create a new comment
router.post('/tasks/:taskId/comments', authenticateToken, CommentController.createComment);

// Update a comment
router.put('/comments/:commentId', authenticateToken, CommentController.updateComment);

// Delete a comment
router.delete('/comments/:commentId', authenticateToken, CommentController.deleteComment);

export default router;
