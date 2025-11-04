/**
 * Document routes for project wikis, meeting notes, and task descriptions
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authenticateToken } from '../middleware/authMiddleware';
import * as documentController from '../controllers/documentController';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   GET /api/v1/documents/templates
 * @desc    Get document templates
 * @access  Private
 */
router.get('/templates', documentController.getDocumentTemplates);

/**
 * @route   GET /api/v1/documents/:id
 * @desc    Get document by ID
 * @access  Private
 */
router.get('/:id', documentController.getDocumentById);

/**
 * @route   POST /api/v1/documents
 * @desc    Create a new document
 * @access  Private
 */
router.post(
  '/',
  [
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('type')
      .isIn(['PAGE', 'WIKI', 'MEETING_NOTES', 'TASK_DESCRIPTION', 'TEMPLATE'])
      .withMessage('Invalid document type'),
    body('content')
      .optional()
      .isArray()
      .withMessage('Content must be an array of blocks'),
    body('projectId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Project ID must be a positive integer'),
    body('meetingId')
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage('Meeting ID must be a valid string'),
    body('taskId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Task ID must be a positive integer'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
  ],
  validateRequest,
  documentController.createDocument
);

/**
 * @route   PUT /api/v1/documents/:id
 * @desc    Update a document
 * @access  Private
 */
router.put(
  '/:id',
  [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('content')
      .optional()
      .isArray()
      .withMessage('Content must be an array of blocks'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
  ],
  validateRequest,
  documentController.updateDocument
);

/**
 * @route   DELETE /api/v1/documents/:id
 * @desc    Delete a document
 * @access  Private
 */
router.delete('/:id', documentController.deleteDocument);

export default router;