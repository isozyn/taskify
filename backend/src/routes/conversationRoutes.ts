// Conversation routes

import { Router } from 'express';
import { ConversationController } from '../controllers/conversationController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all conversations for a project
router.get('/projects/:projectId/conversations', ConversationController.getProjectConversations);

// Get conversation by ID
router.get('/conversations/:conversationId', ConversationController.getConversationById);

// Create a new conversation
router.post('/conversations', ConversationController.createConversation);

// Get or create a direct conversation
router.post('/conversations/direct', ConversationController.getOrCreateDirectConversation);

// Add member to conversation
router.post('/conversations/:conversationId/members', ConversationController.addMember);

// Remove member from conversation
router.delete('/conversations/:conversationId/members', ConversationController.removeMember);

export default router;
