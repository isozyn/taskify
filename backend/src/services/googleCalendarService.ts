// Google Calendar API integration service

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../config/db';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

export class GoogleCalendarService {
  /**
   * Get OAuth2 client for a user
   */
  static async getOAuth2Client(userId: number): Promise<OAuth2Client | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
        googleTokenExpiry: true,
      },
    });

    if (!user?.googleAccessToken || !user?.googleRefreshToken) {
      return null;
    }

    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
      expiry_date: user.googleTokenExpiry?.getTime(),
    });

    // Auto-refresh token if expired
    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.access_token) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            googleAccessToken: tokens.access_token,
            googleTokenExpiry: tokens.expiry_date
              ? new Date(tokens.expiry_date)
              : null,
          },
        });
      }
    });

    return oauth2Client;
  }

  /**
   * Create a calendar event from a task
   */
  static async createCalendarEvent(userId: number, task: any) {
    const oauth2Client = await this.getOAuth2Client(userId);
    if (!oauth2Client) {
      throw new Error('User not connected to Google Calendar');
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Ensure dates are valid
    const startDate = task.startDate ? new Date(task.startDate) : new Date();
    const endDate = task.endDate ? new Date(task.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later

    const event = {
      summary: task.title,
      description: task.description || '',
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'UTC',
      },
      colorId: this.getColorIdByPriority(task.priority),
      extendedProperties: {
        private: {
          taskifyTaskId: task.id.toString(),
          taskifyProjectId: task.projectId.toString(),
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return response.data;
  }

  /**
   * Update a calendar event
   */
  static async updateCalendarEvent(
    userId: number,
    eventId: string,
    task: any
  ) {
    const oauth2Client = await this.getOAuth2Client(userId);
    if (!oauth2Client) {
      throw new Error('User not connected to Google Calendar');
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Ensure dates are valid
    const startDate = task.startDate ? new Date(task.startDate) : new Date();
    const endDate = task.endDate ? new Date(task.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000);

    const event = {
      summary: task.title,
      description: task.description || '',
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'UTC',
      },
      colorId: this.getColorIdByPriority(task.priority),
      extendedProperties: {
        private: {
          taskifyTaskId: task.id.toString(),
          taskifyProjectId: task.projectId.toString(),
        },
      },
    };

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: event,
    });

    return response.data;
  }

  /**
   * Delete a calendar event
   */
  static async deleteCalendarEvent(userId: number, eventId: string) {
    const oauth2Client = await this.getOAuth2Client(userId);
    if (!oauth2Client) {
      throw new Error('User not connected to Google Calendar');
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });
  }

  /**
   * Get calendar events
   */
  static async getCalendarEvents(
    userId: number,
    timeMin?: Date,
    timeMax?: Date
  ) {
    const oauth2Client = await this.getOAuth2Client(userId);
    if (!oauth2Client) {
      throw new Error('User not connected to Google Calendar');
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin?.toISOString() || new Date().toISOString(),
      timeMax: timeMax?.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250,
    });

    return response.data.items || [];
  }

  /**
   * Map task priority to Google Calendar color
   */
  private static getColorIdByPriority(priority: string): string {
    const colorMap: Record<string, string> = {
      URGENT: '11', // Red
      HIGH: '9',    // Blue
      MEDIUM: '5',  // Yellow
      LOW: '2',     // Green
    };
    return colorMap[priority] || '1';
  }

  /**
   * Enable calendar sync for user
   */
  static async enableCalendarSync(userId: number) {
    await prisma.user.update({
      where: { id: userId },
      data: { calendarSyncEnabled: true },
    });
  }

  /**
   * Disable calendar sync for user
   */
  static async disableCalendarSync(userId: number) {
    await prisma.user.update({
      where: { id: userId },
      data: { calendarSyncEnabled: false },
    });
  }

  /**
   * Check if user has calendar sync enabled
   */
  static async isCalendarSyncEnabled(userId: number): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { calendarSyncEnabled: true },
    });
    return user?.calendarSyncEnabled || false;
  }

  /**
   * Check if user has Google Calendar connected
   */
  static async isCalendarConnected(userId: number): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
      },
    });
    return !!(user?.googleAccessToken && user?.googleRefreshToken);
  }
}
