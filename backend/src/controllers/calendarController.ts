// Google Calendar Controller
// Handles calendar sync operations

import { Request, Response } from 'express';
import { GoogleCalendarService } from '../services/googleCalendarService';
import prisma from '../config/db';

export class CalendarController {
  /**
   * Enable Google Calendar sync
   * POST /api/v1/calendar/sync/enable
   */
  static async enableSync(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Check if user has Google Calendar connected
      const isConnected = await GoogleCalendarService.isCalendarConnected(userId);
      if (!isConnected) {
        res.status(400).json({ 
          error: 'Google Calendar not connected. Please sign in with Google first.' 
        });
        return;
      }

      await GoogleCalendarService.enableCalendarSync(userId);
      
      res.status(200).json({ 
        message: 'Calendar sync enabled successfully',
        calendarSyncEnabled: true,
      });
    } catch (error: any) {
      console.error('Enable sync error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to enable calendar sync' 
      });
    }
  }

  /**
   * Disable Google Calendar sync
   * POST /api/v1/calendar/sync/disable
   */
  static async disableSync(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await GoogleCalendarService.disableCalendarSync(userId);
      
      res.status(200).json({ 
        message: 'Calendar sync disabled successfully',
        calendarSyncEnabled: false,
      });
    } catch (error: any) {
      console.error('Disable sync error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to disable calendar sync' 
      });
    }
  }

  /**
   * Get calendar sync status
   * GET /api/v1/calendar/sync/status
   */
  static async getSyncStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const isEnabled = await GoogleCalendarService.isCalendarSyncEnabled(userId);
      const isConnected = await GoogleCalendarService.isCalendarConnected(userId);
      
      res.status(200).json({ 
        calendarSyncEnabled: isEnabled,
        calendarConnected: isConnected,
      });
    } catch (error: any) {
      console.error('Get sync status error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to get sync status' 
      });
    }
  }

  /**
   * Get calendar events
   * GET /api/v1/calendar/events
   */
  static async getEvents(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { timeMin, timeMax } = req.query;
      
      const events = await GoogleCalendarService.getCalendarEvents(
        userId,
        timeMin ? new Date(timeMin as string) : undefined,
        timeMax ? new Date(timeMax as string) : undefined
      );
      
      res.status(200).json({ events });
    } catch (error: any) {
      console.error('Get events error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to fetch calendar events' 
      });
    }
  }

  /**
   * Sync task to Google Calendar
   * POST /api/v1/calendar/sync/task/:taskId
   */
  static async syncTask(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { taskId } = req.params;
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Get task from database
      const task = await prisma.task.findUnique({
        where: { id: parseInt(taskId) },
      });

      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      // Create or update calendar event
      let calendarEvent;
      if (task.googleCalendarEventId) {
        calendarEvent = await GoogleCalendarService.updateCalendarEvent(
          userId,
          task.googleCalendarEventId,
          task
        );
      } else {
        calendarEvent = await GoogleCalendarService.createCalendarEvent(
          userId,
          task
        );
        
        // Save event ID to task
        await prisma.task.update({
          where: { id: task.id },
          data: { googleCalendarEventId: calendarEvent.id || null },
        });
      }
      
      res.status(200).json({ 
        message: 'Task synced to Google Calendar',
        event: calendarEvent 
      });
    } catch (error: any) {
      console.error('Sync task error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to sync task' 
      });
    }
  }

  /**
   * Remove task from Google Calendar
   * DELETE /api/v1/calendar/sync/task/:taskId
   */
  static async unsyncTask(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { taskId } = req.params;
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Get task from database
      const task = await prisma.task.findUnique({
        where: { id: parseInt(taskId) },
      });

      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      if (!task.googleCalendarEventId) {
        res.status(400).json({ error: 'Task is not synced to calendar' });
        return;
      }

      // Delete calendar event
      await GoogleCalendarService.deleteCalendarEvent(
        userId,
        task.googleCalendarEventId
      );
      
      // Remove event ID from task
      await prisma.task.update({
        where: { id: task.id },
        data: { googleCalendarEventId: null },
      });
      
      res.status(200).json({ 
        message: 'Task removed from Google Calendar' 
      });
    } catch (error: any) {
      console.error('Unsync task error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to remove task from calendar' 
      });
    }
  }

  /**
   * Sync project to Google Calendar
   * POST /api/v1/calendar/sync/project/:projectId
   */
  static async syncProject(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { projectId } = req.params;
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Get project from database
      const project = await prisma.project.findUnique({
        where: { id: parseInt(projectId) },
      });

      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      // Check if user has access to project
      const member = await prisma.projectMember.findFirst({
        where: {
          projectId: project.id,
          userId: userId,
        },
      });

      if (!member && project.ownerId !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Create or update calendar event
      let calendarEvent;
      if (project.googleCalendarEventId) {
        calendarEvent = await GoogleCalendarService.updateProjectCalendarEvent(
          userId,
          project.googleCalendarEventId,
          project
        );
      } else {
        calendarEvent = await GoogleCalendarService.createProjectCalendarEvent(
          userId,
          project
        );
        
        // Save event ID to project
        await prisma.project.update({
          where: { id: project.id },
          data: { googleCalendarEventId: calendarEvent.id || null },
        });
      }
      
      res.status(200).json({ 
        message: 'Project synced to Google Calendar',
        event: calendarEvent 
      });
    } catch (error: any) {
      console.error('Sync project error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to sync project' 
      });
    }
  }

  /**
   * Remove project from Google Calendar
   * DELETE /api/v1/calendar/sync/project/:projectId
   */
  static async unsyncProject(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { projectId } = req.params;
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Get project from database
      const project = await prisma.project.findUnique({
        where: { id: parseInt(projectId) },
      });

      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      if (!project.googleCalendarEventId) {
        res.status(400).json({ error: 'Project is not synced to calendar' });
        return;
      }

      // Delete calendar event
      await GoogleCalendarService.deleteCalendarEvent(
        userId,
        project.googleCalendarEventId
      );
      
      // Remove event ID from project
      await prisma.project.update({
        where: { id: project.id },
        data: { googleCalendarEventId: null },
      });
      
      res.status(200).json({ 
        message: 'Project removed from Google Calendar' 
      });
    } catch (error: any) {
      console.error('Unsync project error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to remove project from calendar' 
      });
    }
  }

  /**
   * Create a calendar event with Google Meet
   * POST /api/v1/calendar/events
   */
  static async createEvent(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { summary, description, startDateTime, endDateTime, attendees, includeGoogleMeet } = req.body;

      if (!summary || !startDateTime || !endDateTime) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Create calendar event with Google Meet
      const event = await GoogleCalendarService.createMeetingEvent(
        userId,
        {
          summary,
          description,
          startDateTime: new Date(startDateTime),
          endDateTime: new Date(endDateTime),
          attendees: attendees || [],
          includeGoogleMeet: includeGoogleMeet !== false,
        }
      );
      
      res.status(201).json({ 
        message: 'Calendar event created successfully',
        event 
      });
    } catch (error: any) {
      console.error('Create event error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to create calendar event' 
      });
    }
  }

  /**
   * Update a calendar event
   * PUT /api/v1/calendar/events/:eventId
   */
  static async updateEvent(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { eventId } = req.params;
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { summary, description, startDateTime, endDateTime, attendees } = req.body;

      // Update calendar event
      const event = await GoogleCalendarService.updateMeetingEvent(
        userId,
        eventId,
        {
          summary,
          description,
          startDateTime: startDateTime ? new Date(startDateTime) : undefined,
          endDateTime: endDateTime ? new Date(endDateTime) : undefined,
          attendees,
        }
      );
      
      res.status(200).json({ 
        message: 'Calendar event updated successfully',
        event 
      });
    } catch (error: any) {
      console.error('Update event error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to update calendar event' 
      });
    }
  }

  /**
   * Delete a calendar event
   * DELETE /api/v1/calendar/events/:eventId
   */
  static async deleteEvent(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { eventId } = req.params;
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Delete calendar event
      await GoogleCalendarService.deleteCalendarEvent(userId, eventId);
      
      res.status(200).json({ 
        message: 'Calendar event deleted successfully' 
      });
    } catch (error: any) {
      console.error('Delete event error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to delete calendar event' 
      });
    }
  }
}
