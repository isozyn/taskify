// Google Calendar Routes
// /api/v1/calendar/*

import { Router } from 'express';
import { CalendarController } from '../controllers/calendarController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// All calendar routes require authentication
router.use(authenticateToken);

// Enable/disable sync
router.post('/calendar/sync/enable', CalendarController.enableSync);
router.post('/calendar/sync/disable', CalendarController.disableSync);

// Get sync status
router.get('/calendar/sync/status', CalendarController.getSyncStatus);

// Get calendar events
router.get('/calendar/events', CalendarController.getEvents);

// Sync specific task
router.post('/calendar/sync/task/:taskId', CalendarController.syncTask);

// Remove task from calendar
router.delete('/calendar/sync/task/:taskId', CalendarController.unsyncTask);

// Sync specific project
router.post('/calendar/sync/project/:projectId', CalendarController.syncProject);

// Remove project from calendar
router.delete('/calendar/sync/project/:projectId', CalendarController.unsyncProject);

// Create, update, delete calendar events
router.post('/calendar/events', CalendarController.createEvent);
router.put('/calendar/events/:eventId', CalendarController.updateEvent);
router.delete('/calendar/events/:eventId', CalendarController.deleteEvent);

export default router;
