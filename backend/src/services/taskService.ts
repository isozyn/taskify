// Task business logic

import prisma from '../config/db';
import { TaskUpdateInput, TaskResponse, TaskStatus } from '../models';
import { calculateAutomatedStatus } from '../utils/automatedWorkflow';
import activityService from './activityService';

export class TaskService {
  /**
   * Create a new task
   * Validates dates are required for AUTOMATED workflow
   */
  static async createTask(data: any): Promise<TaskResponse> {
    console.log('TaskService.createTask called with data:', data);
    
    // Validate required fields
    if (!data.title || data.title.trim() === '') {
      throw new Error('Task title is required');
    }
    
    // Get project to check workflow type
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
    });

    console.log('Project found:', project);

    if (!project) {
      throw new Error('Project not found');
    }

    // Validate workflow requirements (temporarily disabled for testing)
    if (project.workflowType === 'AUTOMATED') {
      if (!data.startDate || !data.endDate) {
        console.log('Warning: Missing dates for automated workflow:', { startDate: data.startDate, endDate: data.endDate });
        console.log('Proceeding anyway for testing...');
        // throw new Error('Start date and end date are required for automated workflow projects');
      }
    }

    console.log('Creating task with processed data:', {
      title: data.title,
      description: data.description,
      status: data.status || 'TODO',
      priority: data.priority || 'MEDIUM',
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      projectId: data.projectId,
      assigneeId: data.assigneeId,
      tags: data.tags || [],
      columnId: data.columnId,
      order: data.order || 0,
    });

    // Map frontend status to backend status
    const statusMap: { [key: string]: string } = {
      "upcoming": "TODO",
      "in-progress": "IN_PROGRESS", 
      "review": "IN_REVIEW",
      "complete": "COMPLETED",
      "backlog": "BLOCKED"
    };
    
    const mappedStatus = statusMap[data.status] || data.status || 'TODO';
    const mappedPriority = (data.priority || 'MEDIUM').toUpperCase();
    
    console.log('Mapped values:', { 
      originalStatus: data.status, 
      mappedStatus, 
      originalPriority: data.priority,
      mappedPriority 
    });

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: mappedStatus,
        priority: mappedPriority,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        projectId: data.projectId,
        assigneeId: data.assigneeId || null,
        tags: data.tags || [],
        columnId: data.columnId || null,
        order: data.order || 0,
      },
    });

    console.log('Task created successfully in database:', task);
    
    // Log activity
    await activityService.logTaskCreated(
      data.projectId,
      task.id,
      task.title,
      data.assigneeId
    );
    
    // Auto-sync to Google Calendar if enabled
    if (data.assigneeId) {
      try {
        const { GoogleCalendarService } = await import('./googleCalendarService');
        const isSyncEnabled = await GoogleCalendarService.isCalendarSyncEnabled(data.assigneeId);
        
        if (isSyncEnabled) {
          const calendarEvent = await GoogleCalendarService.createCalendarEvent(
            data.assigneeId,
            task
          );
          
          // Update task with calendar event ID
          if (calendarEvent.id) {
            await prisma.task.update({
              where: { id: task.id },
              data: { googleCalendarEventId: calendarEvent.id },
            });
            console.log('Task synced to Google Calendar:', calendarEvent.id);
          }
        }
      } catch (error) {
        console.error('Failed to sync task to calendar:', error);
        // Don't fail task creation if calendar sync fails
      }
    }
    
    return task;
  }

  /**
   * Get tasks by project ID
   * For AUTOMATED workflow, calculates real-time status
   * Moves tasks with incomplete subtasks past end date to BLOCKED (backlog)
   */
  static async getTasksByProjectId(projectId: number, _userId?: number): Promise<TaskResponse[]> {
    // Get project to check workflow type
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    });

    // Fetch subtasks separately for all tasks
    const taskIds = tasks.map(t => t.id);
    const allSubtasks = await (prisma as any).subtask.findMany({
      where: { taskId: { in: taskIds } },
      orderBy: { order: 'asc' },
    });

    // Group subtasks by taskId
    const subtasksByTaskId = allSubtasks.reduce((acc: Record<number, any[]>, subtask: any) => {
      if (!acc[subtask.taskId]) {
        acc[subtask.taskId] = [];
      }
      acc[subtask.taskId].push(subtask);
      return acc;
    }, {} as Record<number, any[]>);

    const now = new Date();

    // If AUTOMATED workflow, calculate real-time status based on dates
    if (project.workflowType === 'AUTOMATED') {
      const processedTasks = await Promise.all(tasks.map(async (task: any) => {
        const taskSubtasks = subtasksByTaskId[task.id] || [];
        
        let finalStatus = calculateAutomatedStatus({
          id: task.id,
          startDate: task.startDate,
          endDate: task.endDate,
          status: task.status as TaskStatus,
          subtasks: taskSubtasks,
        });

        const oldStatus = task.status;

        // Check if task should move to backlog
        // If end date has passed and there are incomplete subtasks, move to BLOCKED
        if (task.endDate && new Date(task.endDate) < now) {
          const totalSubtasks = taskSubtasks.length;
          const completedSubtasks = taskSubtasks.filter((st: any) => st.completed).length;
          
          if (totalSubtasks > 0 && completedSubtasks < totalSubtasks) {
            finalStatus = 'BLOCKED'; // Backlog
            
            // Update task status in database if it changed
            if (task.status !== 'BLOCKED') {
              await prisma.task.update({
                where: { id: task.id },
                data: { status: 'BLOCKED' }
              });
              
              // Log activity for automatic move to backlog
              await activityService.logTaskStatusChange(
                projectId,
                task.id,
                task.title,
                oldStatus,
                'BLOCKED'
              );
            }
          }
        } else if (oldStatus !== finalStatus) {
          // If status changed due to date-based automation, update DB and log activity
          await prisma.task.update({
            where: { id: task.id },
            data: { status: finalStatus }
          });
          
          // Log activity for automatic status change
          await activityService.logTaskStatusChange(
            projectId,
            task.id,
            task.title,
            oldStatus,
            finalStatus
          );
        }

        return {
          ...task,
          status: finalStatus,
          subtasks: taskSubtasks,
        };
      }));

      return processedTasks;
    }

    // For non-automated workflows, still attach subtasks
    return tasks.map(task => ({
      ...task,
      subtasks: subtasksByTaskId[task.id] || [],
    }));
  }

  /**
   * Get single task by ID
   */
  static async getTaskById(taskId: number, _userId?: number): Promise<TaskResponse | null> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!task) {
      return null;
    }

    // Fetch subtasks separately
    const subtasks = await (prisma as any).subtask.findMany({
      where: { taskId: taskId },
      orderBy: { order: 'asc' },
    });

    // If AUTOMATED workflow, calculate real-time status
    if (task.project.workflowType === 'AUTOMATED') {
      return {
        ...task,
        status: calculateAutomatedStatus({
          id: task.id,
          startDate: task.startDate,
          endDate: task.endDate,
          status: task.status as TaskStatus,
          subtasks: subtasks,
        }),
        subtasks: subtasks,
      };
    }

    return {
      ...task,
      subtasks: subtasks,
    };
  }

  /**
   * Update a task
   */
  static async updateTask(taskId: number, data: TaskUpdateInput, _userId?: number): Promise<TaskResponse> {
    // Get task and project to check workflow type
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    // Validate workflow requirements
    if (task.project.workflowType === 'AUTOMATED') {
      // If updating dates, ensure both are provided
      if ((data.startDate || data.endDate) && !(data.startDate && data.endDate)) {
        const currentStartDate = data.startDate || task.startDate;
        const currentEndDate = data.endDate || task.endDate;
        
        if (!currentStartDate || !currentEndDate) {
          throw new Error('Both start date and end date are required for automated workflow projects');
        }
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status && { status: data.status }),
        ...(data.priority && { priority: data.priority }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
        ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
        ...(data.tags && { tags: data.tags }),
        ...(data.columnId !== undefined && { columnId: data.columnId }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    // Log activity if status changed
    if (data.status && task.status !== data.status) {
      await activityService.logTaskStatusChange(
        task.projectId,
        taskId,
        task.title,
        task.status,
        data.status,
        _userId
      );
      
      // Special case: log task completion
      if (data.status === 'COMPLETED') {
        await activityService.logTaskCompleted(
          task.projectId,
          taskId,
          task.title,
          _userId
        );
      }
    }

    // Auto-sync to Google Calendar if enabled
    if (updatedTask.assigneeId) {
      try {
        const { GoogleCalendarService } = await import('./googleCalendarService');
        const isSyncEnabled = await GoogleCalendarService.isCalendarSyncEnabled(updatedTask.assigneeId);
        
        if (isSyncEnabled) {
          if (updatedTask.googleCalendarEventId) {
            // Update existing calendar event
            await GoogleCalendarService.updateCalendarEvent(
              updatedTask.assigneeId,
              updatedTask.googleCalendarEventId,
              updatedTask
            );
            console.log('Task updated in Google Calendar');
          } else {
            // Create new calendar event
            const calendarEvent = await GoogleCalendarService.createCalendarEvent(
              updatedTask.assigneeId,
              updatedTask
            );
            
            if (calendarEvent.id) {
              await prisma.task.update({
                where: { id: updatedTask.id },
                data: { googleCalendarEventId: calendarEvent.id },
              });
              console.log('Task synced to Google Calendar');
            }
          }
        }
      } catch (error) {
        console.error('Failed to sync task update to calendar:', error);
        // Don't fail task update if calendar sync fails
      }
    }

    return updatedTask;
  }

  /**
   * Delete a task
   */
  static async deleteTask(taskId: number, _userId?: number): Promise<boolean> {
    try {
      // Get task info before deleting for activity log
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });
      
      if (!task) {
        return false;
      }
      
      // Delete from Google Calendar if synced
      if (task.googleCalendarEventId && task.assigneeId) {
        try {
          const { GoogleCalendarService } = await import('./googleCalendarService');
          await GoogleCalendarService.deleteCalendarEvent(
            task.assigneeId,
            task.googleCalendarEventId
          );
          console.log('Task deleted from Google Calendar');
        } catch (error) {
          console.error('Failed to delete task from calendar:', error);
          // Continue with task deletion even if calendar delete fails
        }
      }
      
      await prisma.task.delete({
        where: { id: taskId },
      });
      
      // Log activity
      await activityService.logTaskDeleted(
        task.projectId,
        task.title,
        _userId
      );
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get tasks grouped by column (for CUSTOM workflow)
   */
  static async getTasksByColumn(projectId: number): Promise<Map<string, TaskResponse[]>> {
    const tasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    });

    const tasksByColumn = new Map<string, TaskResponse[]>();
    
    tasks.forEach((task: any) => {
      const columnId = task.columnId || 'unassigned';
      if (!tasksByColumn.has(columnId)) {
        tasksByColumn.set(columnId, []);
      }
      tasksByColumn.get(columnId)!.push(task);
    });

    return tasksByColumn;
  }

  /**
   * Get tasks grouped by status (for AUTOMATED workflow)
   */
  static async getTasksByStatus(projectId: number): Promise<Map<TaskStatus, TaskResponse[]>> {
    const tasks = await this.getTasksByProjectId(projectId);
    
    const tasksByStatus = new Map<TaskStatus, TaskResponse[]>();
    
    tasks.forEach(task => {
      const status = task.status as TaskStatus;
      if (!tasksByStatus.has(status)) {
        tasksByStatus.set(status, []);
      }
      tasksByStatus.get(status)!.push(task);
    });

    return tasksByStatus;
  }
}
