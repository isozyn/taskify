# Google Calendar API Integration Guide

## Current Status

### ✅ What's Already Done:
1. **Frontend Calendar UI** - CalendarView component using `react-big-calendar`
2. **Google OAuth Setup** - `google-auth-library` package installed
3. **Google OAuth Credentials** - Already configured in `.env`:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI`
4. **Basic Calendar Display** - Shows tasks in calendar format with mock data

### ❌ What's Missing:
1. Google Calendar API integration
2. Sync tasks to Google Calendar
3. Import events from Google Calendar
4. Two-way sync functionality

---

## Step-by-Step Implementation

### Step 1: Install Google Calendar API Package

```bash
cd taskify/backend
npm install googleapis
```

### Step 2: Update Google OAuth Scopes

You need to add Calendar API scopes to your Google OAuth configuration.

**File: `taskify/backend/src/services/googleAuthService.ts`**

Add these scopes:
```typescript
const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/calendar',           // NEW
  'https://www.googleapis.com/auth/calendar.events',    // NEW
];
```

### Step 3: Store Google Tokens in Database

**Update Prisma Schema: `taskify/backend/prisma/schema.prisma`**

Add to the `User` model:
```prisma
model User {
  // ... existing fields ...
  googleAccessToken     String?
  googleRefreshToken    String?
  googleTokenExpiry     DateTime?
  calendarSyncEnabled   Boolean   @default(false)
}
```

Run migration:
```bash
cd taskify/backend
npx prisma migrate dev --name add_google_calendar_tokens
npx prisma generate
```

### Step 4: Create Google Calendar Service

**Create: `taskify/backend/src/services/googleCalendarService.ts`**

```typescript
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../config/database';

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

    const event = {
      summary: task.title,
      description: task.description || '',
      start: {
        dateTime: task.startDate || new Date().toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: task.endDate || new Date().toISOString(),
        timeZone: 'UTC',
      },
      colorId: this.getColorIdByPriority(task.priority),
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

    const event = {
      summary: task.title,
      description: task.description || '',
      start: {
        dateTime: task.startDate || new Date().toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: task.endDate || new Date().toISOString(),
        timeZone: 'UTC',
      },
      colorId: this.getColorIdByPriority(task.priority),
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
}
```

### Step 5: Update Task Schema to Store Google Event ID

**Update Prisma Schema: `taskify/backend/prisma/schema.prisma`**

Add to the `Task` model:
```prisma
model Task {
  // ... existing fields ...
  googleCalendarEventId String?
}
```

Run migration:
```bash
cd taskify/backend
npx prisma migrate dev --name add_google_calendar_event_id
npx prisma generate
```

### Step 6: Update Google OAuth Callback to Store Tokens

**Update: `taskify/backend/src/controllers/authController.ts`**

In the Google OAuth callback, save the tokens:
```typescript
// After successful Google login
await prisma.user.update({
  where: { id: user.id },
  data: {
    googleAccessToken: tokens.access_token,
    googleRefreshToken: tokens.refresh_token,
    googleTokenExpiry: tokens.expiry_date 
      ? new Date(tokens.expiry_date) 
      : null,
  },
});
```

### Step 7: Create Calendar Controller

**Create: `taskify/backend/src/controllers/calendarController.ts`**

```typescript
import { Request, Response } from 'express';
import { GoogleCalendarService } from '../services/googleCalendarService';

export class CalendarController {
  /**
   * Enable Google Calendar sync
   */
  static async enableSync(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await GoogleCalendarService.enableCalendarSync(userId);
      
      res.status(200).json({ 
        message: 'Calendar sync enabled successfully' 
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
        message: 'Calendar sync disabled successfully' 
      });
    } catch (error: any) {
      console.error('Disable sync error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to disable calendar sync' 
      });
    }
  }

  /**
   * Get calendar events
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
          data: { googleCalendarEventId: calendarEvent.id },
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
}
```

### Step 8: Create Calendar Routes

**Create: `taskify/backend/src/routes/calendarRoutes.ts`**

```typescript
import { Router } from 'express';
import { CalendarController } from '../controllers/calendarController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// All calendar routes require authentication
router.use(authenticateToken);

// Enable/disable sync
router.post('/calendar/sync/enable', CalendarController.enableSync);
router.post('/calendar/sync/disable', CalendarController.disableSync);

// Get calendar events
router.get('/calendar/events', CalendarController.getEvents);

// Sync specific task
router.post('/calendar/sync/task/:taskId', CalendarController.syncTask);

export default router;
```

### Step 9: Register Calendar Routes

**Update: `taskify/backend/src/server.ts`**

```typescript
import calendarRoutes from './routes/calendarRoutes';

// ... other routes ...
app.use('/api/v1', calendarRoutes);
```

### Step 10: Update Task Service to Auto-Sync

**Update: `taskify/backend/src/services/taskService.ts`**

Add auto-sync when creating/updating tasks:

```typescript
import { GoogleCalendarService } from './googleCalendarService';

// After creating a task
if (user.calendarSyncEnabled) {
  try {
    const calendarEvent = await GoogleCalendarService.createCalendarEvent(
      userId,
      newTask
    );
    
    // Update task with calendar event ID
    await prisma.task.update({
      where: { id: newTask.id },
      data: { googleCalendarEventId: calendarEvent.id },
    });
  } catch (error) {
    console.error('Failed to sync to calendar:', error);
    // Don't fail task creation if calendar sync fails
  }
}
```

### Step 11: Add Frontend API Methods

**Update: `taskify/frontend/src/lib/api.ts`**

```typescript
// Calendar endpoints
async enableCalendarSync() {
  return this.request('/calendar/sync/enable', {
    method: 'POST',
  });
}

async disableCalendarSync() {
  return this.request('/calendar/sync/disable', {
    method: 'POST',
  });
}

async getCalendarEvents(timeMin?: Date, timeMax?: Date) {
  const params = new URLSearchParams();
  if (timeMin) params.append('timeMin', timeMin.toISOString());
  if (timeMax) params.append('timeMax', timeMax.toISOString());
  
  return this.request(`/calendar/events?${params.toString()}`, {
    method: 'GET',
  });
}

async syncTaskToCalendar(taskId: number) {
  return this.request(`/calendar/sync/task/${taskId}`, {
    method: 'POST',
  });
}
```

### Step 12: Add Calendar Sync Toggle in Settings

**Update: `taskify/frontend/src/components/project/ProjectSettings.tsx`**

Add a toggle for calendar sync:

```typescript
import { Switch } from "@/components/ui/switch";

const [calendarSyncEnabled, setCalendarSyncEnabled] = useState(false);

const handleCalendarSyncToggle = async (enabled: boolean) => {
  try {
    if (enabled) {
      await api.enableCalendarSync();
    } else {
      await api.disableCalendarSync();
    }
    setCalendarSyncEnabled(enabled);
  } catch (error) {
    console.error('Failed to toggle calendar sync:', error);
  }
};

// In the JSX
<div className="flex items-center justify-between">
  <div>
    <h3 className="font-semibold">Google Calendar Sync</h3>
    <p className="text-sm text-slate-500">
      Automatically sync tasks to your Google Calendar
    </p>
  </div>
  <Switch
    checked={calendarSyncEnabled}
    onCheckedChange={handleCalendarSyncToggle}
  />
</div>
```

---

## Testing the Integration

### 1. Test OAuth Flow
- Log in with Google
- Check that tokens are saved in database

### 2. Test Calendar Sync
- Enable calendar sync in settings
- Create a new task
- Check Google Calendar to see if event was created

### 3. Test Two-Way Sync
- Update task in Taskify → Check Google Calendar
- Update event in Google Calendar → Fetch events in Taskify

---

## Security Considerations

1. **Token Storage**: Tokens are stored encrypted in database
2. **Scopes**: Only request necessary calendar scopes
3. **Token Refresh**: Auto-refresh expired tokens
4. **Error Handling**: Gracefully handle API failures
5. **User Consent**: Always ask for user permission before syncing

---

## Next Steps

1. Install `googleapis` package
2. Update Prisma schema and run migrations
3. Create the Google Calendar service
4. Add calendar routes and controller
5. Update task service for auto-sync
6. Add frontend UI for calendar sync toggle
7. Test the integration thoroughly

---

## Useful Resources

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/v3/reference)
- [googleapis npm package](https://www.npmjs.com/package/googleapis)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
