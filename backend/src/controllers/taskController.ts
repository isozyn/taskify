// Task CRUD operations

import { Request, Response } from 'express';
import { TaskService } from '../services/taskService';

export class TaskController {
  /**
   * Get all tasks for a project
   */
  static async getTasksByProject(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const projectId = parseInt(req.params.projectId);
      
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      if (!projectId || isNaN(projectId)) {
        res.status(400).json({ error: 'Invalid project ID' });
        return;
      }

      const tasks = await TaskService.getTasksByProjectId(projectId, userId);
      res.status(200).json(tasks);
    } catch (error: any) {
      console.error('Get tasks error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch tasks' });
    }
  }

  /**
   * Create a new task
   */
  static async createTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const projectId = parseInt(req.params.projectId);
      
      console.log('Create task request:', {
        userId,
        projectId,
        body: req.body
      });
      
      if (!userId) {
        console.log('Unauthorized: No user ID');
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!projectId || isNaN(projectId)) {
        console.log('Invalid project ID:', req.params.projectId);
        res.status(400).json({ message: 'Invalid project ID' });
        return;
      }

      const task = await TaskService.createTask({
        ...req.body,
        projectId,
      });

      console.log('Task created successfully:', task);
      res.status(201).json(task);
    } catch (error: any) {
      console.error('Create task error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      res.status(400).json({ message: error.message || 'Failed to create task' });
    }
  }

  /**
   * Get a single task by ID
   */
  static async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const taskId = parseInt(req.params.taskId);
      
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      if (!taskId || isNaN(taskId)) {
        res.status(400).json({ message: 'Invalid task ID' });
        return;
      }

      const task = await TaskService.getTaskById(taskId, userId);
      
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.status(200).json(task);
    } catch (error: any) {
      console.error('Get task error:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch task' });
    }
  }

  /**
   * Update a task
   */
  static async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const taskId = parseInt(req.params.taskId);
      
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      if (!taskId || isNaN(taskId)) {
        res.status(400).json({ message: 'Invalid task ID' });
        return;
      }

      const task = await TaskService.updateTask(taskId, req.body, userId);
      
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.status(200).json(task);
    } catch (error: any) {
      console.error('Update task error:', error);
      res.status(400).json({ message: error.message || 'Failed to update task' });
    }
  }

  /**
   * Fast column move endpoint for drag and drop operations
   * Optimized for performance with minimal response data
   */
  static async moveTaskToColumn(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const taskId = parseInt(req.params.taskId);
      const { columnId } = req.body;
      
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      if (!taskId || isNaN(taskId)) {
        res.status(400).json({ message: 'Invalid task ID' });
        return;
      }

      if (!columnId) {
        res.status(400).json({ message: 'Column ID is required' });
        return;
      }

      // Use optimized update for column moves only
      const task = await TaskService.updateTask(taskId, { columnId }, userId);
      
      // Return minimal response for performance
      res.status(200).json({ 
        success: true, 
        taskId: task.id, 
        columnId: task.columnId 
      });
    } catch (error: any) {
      console.error('Move task error:', error);
      res.status(400).json({ message: error.message || 'Failed to move task' });
    }
  }

  /**
   * Delete a task
   */
  static async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const taskId = parseInt(req.params.taskId);
      
      console.log(`[DELETE TASK] User ${userId} attempting to delete task ${taskId}`);
      
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      if (!taskId || isNaN(taskId)) {
        res.status(400).json({ message: 'Invalid task ID' });
        return;
      }

      const success = await TaskService.deleteTask(taskId, userId);
      
      if (!success) {
        console.log(`[DELETE TASK] Failed - Task ${taskId} not found or access denied`);
        res.status(404).json({ error: 'Task not found or access denied' });
        return;
      }

      console.log(`[DELETE TASK] Success - Task ${taskId} deleted by user ${userId}`);
      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error: any) {
      console.error('Delete task error:', error);
      res.status(500).json({ message: error.message || 'Failed to delete task' });
    }
  }

  /**
   * Mark a completed task as incomplete
   */
  static async markTaskIncomplete(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const taskId = parseInt(req.params.taskId);
      
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      if (!taskId || isNaN(taskId)) {
        res.status(400).json({ message: 'Invalid task ID' });
        return;
      }

      const task = await TaskService.markTaskIncomplete(taskId, userId);
      res.status(200).json(task);
    } catch (error: any) {
      console.error('Mark task incomplete error:', error);
      res.status(400).json({ message: error.message || 'Failed to mark task as incomplete' });
    }
  }
}
