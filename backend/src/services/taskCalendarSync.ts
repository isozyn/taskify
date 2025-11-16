// Auto-sync tasks to Google Calendar
// This service handles automatic synchronization of tasks with Google Calendar

import { GoogleCalendarService } from './googleCalendarService';
import prisma from '../config/db';

export class TaskCalendarSync {
  /**
   * Sync task to calendar if user has sync enabled
   */
  static async syncTaskIfEnabled(taskId: number, userId: number): Promise<void> {
    try {
      // Check if user has calendar sync enabled
      const isEnabled = await GoogleCalendarService.isCalendarSyncEnabled(userId);
      const isConnected = await GoogleCalendarService.isCalendarConnected(userId);
      
      if (!isEnabled || !isConnected) {
        return; // Skip sync if not enabled or not connected
      }

      // Get task details
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        return;
      }

      // Only sync tasks that have dates
      if (!task.startDate && !task.endDate) {
        return;
      }

      // Create or update calendar event
      if (task.googleCalendarEventId) {
        await GoogleCalendarService.updateCalendarEvent(
          userId,
          task.googleCalendarEventId,
          task
        );
      } else {
        const calendarEvent = await GoogleCalendarService.createCalendarEvent(
          userId,
          task
        );
        
        // Save event ID to task
        if (calendarEvent.id) {
          await prisma.task.update({
            where: { id: taskId },
            data: { googleCalendarEventId: calendarEvent.id },
          });
        }
      }
    } catch (error) {
      // Don't throw - we don't want sync failures to break task operations
    }
  }

  /**
   * Remove task from calendar if it exists
   */
  static async unsyncTaskIfExists(taskId: number, userId: number): Promise<void> {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });

      if (!task?.googleCalendarEventId) {
        return;
      }

      await GoogleCalendarService.deleteCalendarEvent(
        userId,
        task.googleCalendarEventId
      );
    } catch (error) {
      // Don't throw - we don't want sync failures to break task operations
    }
  }
}
