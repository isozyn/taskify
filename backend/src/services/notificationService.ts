import { PrismaClient, NotificationType, Notification } from '@prisma/client';
import prisma from '../config/db';

export interface CreateNotificationData {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: any;
}

class NotificationService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async createNotification(data: CreateNotificationData): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata || {},
      },
    });
  }

  async getUserNotifications(userId: number, limit = 20, offset = 0): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async markAsRead(notificationId: number): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async deleteNotification(notificationId: number): Promise<void> {
    await this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  // Helper method to create a project completion notification
  async createProjectCompletionNotification(userId: number, projectTitle: string, projectId: number): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.PROJECT_COMPLETED,
      title: 'Project Completed! 🎉',
      message: `The project "${projectTitle}" has been marked as completed.`,
      metadata: { projectId },
    });
  }

  // Helper method to create a task overdue notification
  async createTaskOverdueNotification(userId: number, taskTitle: string, projectTitle: string, taskId: number, projectId: number): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.TASK_OVERDUE,
      title: 'Task Overdue ⚠️',
      message: `The task "${taskTitle}" in project "${projectTitle}" is overdue.`,
      metadata: { taskId, projectId },
    });
  }
}

export const notificationService = new NotificationService();