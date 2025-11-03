/**
 * Notification service for in-app notifications
 */

import { v4 as uuidv4 } from 'uuid';

export interface Notification {
  id: string;
  userId: number;
  type: 'MEETING_INVITATION' | 'MEETING_REMINDER' | 'MEETING_UPDATE' | 'MEETING_CANCELLED' | 'TASK_ASSIGNED' | 'PROJECT_UPDATE';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

export interface CreateNotificationRequest {
  userId: number;
  type: Notification['type'];
  title: string;
  message: string;
  data?: any;
}

// In-memory storage for demo (replace with database in production)
const notifications: Notification[] = [];

/**
 * Create a new notification
 */
export const createNotification = async (
  notificationData: CreateNotificationRequest
): Promise<Notification> => {
  const notification: Notification = {
    id: uuidv4(),
    userId: notificationData.userId,
    type: notificationData.type,
    title: notificationData.title,
    message: notificationData.message,
    data: notificationData.data,
    isRead: false,
    createdAt: new Date()
  };

  notifications.push(notification);
  
  // In a real app, you'd also send real-time notification via WebSocket/SSE
  console.log(`Notification created for user ${notificationData.userId}: ${notificationData.title}`);
  
  return notification;
};

/**
 * Get notifications for a user
 */
export const getUserNotifications = async (
  userId: number,
  limit: number = 50,
  offset: number = 0
): Promise<{ notifications: Notification[]; total: number }> => {
  const userNotifications = notifications
    .filter(notification => notification.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(offset, offset + limit);

  const total = notifications.filter(notification => notification.userId === userId).length;

  return { notifications: userNotifications, total };
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (
  notificationId: string,
  userId: number
): Promise<Notification | null> => {
  const notification = notifications.find(
    n => n.id === notificationId && n.userId === userId
  );

  if (!notification) return null;

  notification.isRead = true;
  return notification;
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (userId: number): Promise<number> => {
  let count = 0;
  notifications.forEach(notification => {
    if (notification.userId === userId && !notification.isRead) {
      notification.isRead = true;
      count++;
    }
  });
  return count;
};

/**
 * Get unread notification count for a user
 */
export const getUnreadNotificationCount = async (userId: number): Promise<number> => {
  return notifications.filter(
    notification => notification.userId === userId && !notification.isRead
  ).length;
};

/**
 * Delete notification
 */
export const deleteNotification = async (
  notificationId: string,
  userId: number
): Promise<boolean> => {
  const index = notifications.findIndex(
    n => n.id === notificationId && n.userId === userId
  );

  if (index === -1) return false;

  notifications.splice(index, 1);
  return true;
};