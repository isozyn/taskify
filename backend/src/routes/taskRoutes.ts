// /api/v1/tasks/*

import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// All task routes require authentication
router.use(authenticateToken);

// Get all tasks for a project
router.get('/projects/:projectId/tasks', TaskController.getTasksByProject);

// Create a new task
router.post('/projects/:projectId/tasks', TaskController.createTask);

// Get a single task by ID
router.get('/tasks/:taskId', TaskController.getTaskById);

// Update a task
router.put('/tasks/:taskId', TaskController.updateTask);

// Delete a task
router.delete('/tasks/:taskId', TaskController.deleteTask);

export default router;
