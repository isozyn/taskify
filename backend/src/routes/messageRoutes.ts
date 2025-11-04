// Message routes

import { Router } from 'express';
import { MessageController } from '../controllers/messageController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', MessageController.getConversationMessages);

// Create a message (fallback for non-socket)
router.post('/messages', MessageController.createMessage);

// Update a message
router.put('/messages/:messageId', MessageController.updateMessage);

// Delete a message
router.delete('/messages/:messageId', MessageController.deleteMessage);

export default router;
