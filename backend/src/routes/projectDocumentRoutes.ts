/**
 * Project-specific document routes (wiki, etc.)
 */

import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import * as documentController from '../controllers/documentController';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   GET /api/v1/projects/:projectId/documents
 * @desc    Get all documents for a project
 * @access  Private
 */
router.get('/:projectId/documents', documentController.getProjectDocuments);

/**
 * @route   GET /api/v1/projects/:projectId/wiki
 * @desc    Get project wiki pages
 * @access  Private
 */
router.get('/:projectId/wiki', documentController.getProjectWiki);

/**
 * @route   GET /api/v1/meetings/:meetingId/notes
 * @desc    Get meeting notes
 * @access  Private
 */
router.get('/meetings/:meetingId/notes', documentController.getMeetingNotes);

/**
 * @route   GET /api/v1/tasks/:taskId/description
 * @desc    Get task description document
 * @access  Private
 */
router.get('/tasks/:taskId/description', documentController.getTaskDescription);

export default router;