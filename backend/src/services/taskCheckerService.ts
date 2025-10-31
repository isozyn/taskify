import { PrismaClient, Task, TaskStatus } from '@prisma/client';
import prisma from '../config/db';
import { notificationService } from './notificationService';

class TaskCheckerService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async checkOverdueTasks(): Promise<void> {
    // Find all incomplete tasks that are past their due date
    const overdueTasks = await this.prisma.task.findMany({
      where: {
        status: {
          not: TaskStatus.COMPLETED
        },
        dueDate: {
          lt: new Date() // Tasks where due date is less than current time
        }
      },
      include: {
        project: true,
        assignee: true
      }
    });

    // Create notifications for each overdue task
    await Promise.all(
      overdueTasks.map(async (task) => {
        if (task.assigneeId) {
          await notificationService.createTaskOverdueNotification(
            task.assigneeId,
            task.title,
            task.project.title,
            task.id,
            task.projectId
          );
        }
      })
    );
  }
}

export const taskCheckerService = new TaskCheckerService();

// This function can be called by a cron job or scheduler
export async function scheduleTaskChecks() {
  // Run task checks every hour
  setInterval(async () => {
    try {
      await taskCheckerService.checkOverdueTasks();
    } catch (error) {
      console.error('Error checking overdue tasks:', error);
    }
  }, 60 * 60 * 1000); // Every hour
}