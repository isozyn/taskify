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
}
