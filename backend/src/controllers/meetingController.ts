/**
 * Meeting controller for handling meeting-related requests
 */

import { Request, Response, NextFunction } from 'express';
import * as meetingService from '../services/meetingService';
import * as notificationService from '../services/notificationService';
import { CreateMeetingRequest } from '../models/Meeting';

/**
 * Create a new meeting with invitations
 * POST /api/v1/meetings
 */
export const createMeeting = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const meetingData: CreateMeetingRequest = req.body;

    // Validate required fields
    if (!meetingData.title || !meetingData.startTime || !meetingData.endTime) {
      res.status(400).json({ 
        message: 'Missing required fields: title, startTime, endTime' 
      });
      return;
    }

    // Validate invitees
    if (!meetingData.invitees || meetingData.invitees.length === 0) {
      res.status(400).json({ 
        message: 'At least one invitee is required' 
      });
      return;
    }

    // Create meeting and send invitations
    const result = await meetingService.createMeeting(userId, meetingData);

    res.status(201).json({
      message: 'Meeting created successfully',
      meeting: result.meeting,
      invitations: result.invitations,
      invitationsSent: result.invitations.length
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ 
      message: 'Failed to create meeting',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get user's meetings
 * GET /api/v1/meetings
 */
export const getUserMeetings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const meetings = await meetingService.getUserMeetings(userId);

    res.json({
      meetings,
      total: meetings.length
    });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ 
      message: 'Failed to fetch meetings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get meeting by ID
 * GET /api/v1/meetings/:id
 */
export const getMeetingById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const meeting = await meetingService.getMeetingById(id);

    if (!meeting) {
      res.status(404).json({ message: 'Meeting not found' });
      return;
    }

    const invitations = await meetingService.getMeetingInvitations(id);

    res.json({
      meeting,
      invitations
    });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({ 
      message: 'Failed to fetch meeting',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update invitation status
 * PUT /api/v1/meetings/invitations/:id/status
 */
export const updateInvitationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACCEPTED', 'DECLINED'].includes(status)) {
      res.status(400).json({ 
        message: 'Invalid status. Must be ACCEPTED or DECLINED' 
      });
      return;
    }

    const invitation = await meetingService.updateInvitationStatus(id, status);

    if (!invitation) {
      res.status(404).json({ message: 'Invitation not found' });
      return;
    }

    res.json({
      message: `Invitation ${status.toLowerCase()}`,
      invitation
    });
  } catch (error) {
    console.error('Error updating invitation status:', error);
    res.status(500).json({ 
      message: 'Failed to update invitation status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get user notifications
 * GET /api/v1/notifications
 */
export const getUserNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await notificationService.getUserNotifications(userId, limit, offset);

    res.json(result);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      message: 'Failed to fetch notifications',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Mark notification as read
 * PUT /api/v1/notifications/:id/read
 */
export const markNotificationAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const notification = await notificationService.markNotificationAsRead(id, userId);

    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    res.json({
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      message: 'Failed to mark notification as read',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get unread notification count
 * GET /api/v1/notifications/unread-count
 */
export const getUnreadNotificationCount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const count = await notificationService.getUnreadNotificationCount(userId);

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    res.status(500).json({ 
      message: 'Failed to fetch unread notification count',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};