/**
 * Meeting routes
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authenticateToken } from '../middleware/authMiddleware';
import * as meetingController from '../controllers/meetingController';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   POST /api/v1/meetings
 * @desc    Create a new meeting with invitations
 * @access  Private
 */
router.post(
  '/',
  [
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    body('startTime')
      .isISO8601()
      .withMessage('Start time must be a valid ISO 8601 date'),
    body('endTime')
      .isISO8601()
      .withMessage('End time must be a valid ISO 8601 date'),
    body('invitees')
      .isArray({ min: 1 })
      .withMessage('At least one invitee is required'),
    body('invitees.*.email')
      .isEmail()
      .withMessage('Each invitee must have a valid email address'),
    body('invitees.*.userId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('User ID must be a positive integer'),
    body('invitees.*.name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Name must be between 1 and 100 characters'),
    body('projectId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Project ID must be a positive integer'),
  ],
  validateRequest,
  meetingController.createMeeting
);

/**
 * @route   GET /api/v1/meetings
 * @desc    Get user's meetings
 * @access  Private
 */
router.get('/', meetingController.getUserMeetings);

/**
 * @route   GET /api/v1/meetings/:id
 * @desc    Get meeting by ID
 * @access  Private
 */
router.get('/:id', meetingController.getMeetingById);

/**
 * @route   PUT /api/v1/meetings/invitations/:id/status
 * @desc    Update invitation status (accept/decline)
 * @access  Private
 */
router.put(
  '/invitations/:id/status',
  [
    body('status')
      .isIn(['ACCEPTED', 'DECLINED'])
      .withMessage('Status must be either ACCEPTED or DECLINED'),
  ],
  validateRequest,
  meetingController.updateInvitationStatus
);

/**
 * @route   GET /api/v1/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get('/notifications', meetingController.getUserNotifications);

/**
 * @route   PUT /api/v1/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/notifications/:id/read', meetingController.markNotificationAsRead);

/**
 * @route   GET /api/v1/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/notifications/unread-count', meetingController.getUnreadNotificationCount);

export default router;