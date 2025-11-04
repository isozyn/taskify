// /api/v1/projects/*

import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// All project routes require authentication
router.use(authenticateToken);

// Create a new project
router.post('/projects', ProjectController.createProject);

// Get all projects for authenticated user
router.get('/projects', ProjectController.getAllProjects);

// Get deleted projects (trash) - must come before :projectId route
router.get('/projects/trash', ProjectController.getDeletedProjects);

// Get a single project by ID
router.get('/projects/:projectId', ProjectController.getProjectById);

// Update a project
router.put('/projects/:projectId', ProjectController.updateProject);

// Delete a project (move to trash)
router.delete('/projects/:projectId', ProjectController.deleteProject);

// Restore a project from trash
router.patch('/projects/:projectId/restore', ProjectController.restoreProject);

// Permanently delete a project
router.delete('/projects/:projectId/permanent', ProjectController.permanentlyDeleteProject);

export default router;
