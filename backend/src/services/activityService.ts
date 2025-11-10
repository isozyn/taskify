import prisma from '../config/db';

export const activityService = {
  // Create a new activity log entry
  async logActivity(data: {
    projectId: number;
    userId?: number;
    action: string;
    targetType?: string;
    targetId?: number;
    description: string;
  }) {
    try {
      const activity = await prisma.activity.create({
        data,
      });
      return activity;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  },

  // Get recent activities for a project
  async getProjectActivities(projectId: number, limit: number = 20) {
    try {
      const activities = await prisma.activity.findMany({
        where: {
          projectId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });
      return activities;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  },

  // Log task status change
  async logTaskStatusChange(
    projectId: number,
    taskId: number,
    taskTitle: string,
    oldStatus: string,
    newStatus: string,
    userId?: number
  ) {
    const statusNames: Record<string, string> = {
      TODO: 'To Do',
      IN_PROGRESS: 'In Progress',
      IN_REVIEW: 'In Review',
      COMPLETED: 'Completed',
      BLOCKED: 'Blocked',
    };

    return this.logActivity({
      projectId,
      userId,
      action: 'TASK_STATUS_CHANGED',
      targetType: 'TASK',
      targetId: taskId,
      description: `Task "${taskTitle}" moved from ${statusNames[oldStatus] || oldStatus} to ${statusNames[newStatus] || newStatus}`,
    });
  },

  // Log task creation
  async logTaskCreated(
    projectId: number,
    taskId: number,
    taskTitle: string,
    userId?: number
  ) {
    return this.logActivity({
      projectId,
      userId,
      action: 'TASK_CREATED',
      targetType: 'TASK',
      targetId: taskId,
      description: `Task "${taskTitle}" was created`,
    });
  },

  // Log task completion
  async logTaskCompleted(
    projectId: number,
    taskId: number,
    taskTitle: string,
    userId?: number
  ) {
    return this.logActivity({
      projectId,
      userId,
      action: 'TASK_COMPLETED',
      targetType: 'TASK',
      targetId: taskId,
      description: `Task "${taskTitle}" was completed`,
    });
  },

  // Log task deletion
  async logTaskDeleted(
    projectId: number,
    taskTitle: string,
    userId?: number
  ) {
    return this.logActivity({
      projectId,
      userId,
      action: 'TASK_DELETED',
      targetType: 'TASK',
      description: `Task "${taskTitle}" was deleted`,
    });
  },

  // Log task column move (for custom workflows)
  async logTaskColumnMove(
    projectId: number,
    taskId: number,
    taskTitle: string,
    fromColumn: string,
    toColumn: string,
    userId?: number
  ) {
    return this.logActivity({
      projectId,
      userId,
      action: 'TASK_COLUMN_MOVED',
      targetType: 'TASK',
      targetId: taskId,
      description: `Task "${taskTitle}" moved from "${fromColumn}" to "${toColumn}"`,
    });
  },
};

export default activityService;
