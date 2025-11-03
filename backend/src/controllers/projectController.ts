// Project CRUD operations

import { Request, Response } from 'express';
import { ProjectService } from '../services/projectService';

export class ProjectController {
  /**
   * Create a new project
   */
  static async createProject(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;  // Changed from userId to id
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const project = await ProjectService.createProject({
        ...req.body,
        ownerId: userId,
      });

      res.status(201).json(project);
    } catch (error: any) {
      console.error('Create project error:', error);
      res.status(400).json({ error: error.message || 'Failed to create project' });
    }
  }

  /**
   * Get all projects for the authenticated user
   */
  static async getAllProjects(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;  // Changed from userId to id
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const projects = await ProjectService.getProjectsByUserId(userId);
      res.status(200).json(projects);
    } catch (error: any) {
      console.error('Get projects error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch projects' });
    }
  }

  /**
   * Get a single project by ID
   */
  static async getProjectById(req: Request, res: Response): Promise<void> {
    try {
      const projectId = parseInt(req.params.projectId);
      
      if (isNaN(projectId)) {
        res.status(400).json({ error: 'Invalid project ID' });
        return;
      }

      const project = await ProjectService.getProjectById(projectId);

      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      res.status(200).json(project);
    } catch (error: any) {
      console.error('Get project error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch project' });
    }
  }

  /**
   * Update a project
   */
  static async updateProject(req: Request, res: Response): Promise<void> {
    try {
      const projectId = parseInt(req.params.projectId);
      
      if (isNaN(projectId)) {
        res.status(400).json({ error: 'Invalid project ID' });
        return;
      }

      const project = await ProjectService.updateProject(projectId, req.body);

      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      res.status(200).json(project);
    } catch (error: any) {
      console.error('Update project error:', error);
      res.status(400).json({ error: error.message || 'Failed to update project' });
    }
  }

  /**
   * Delete a project
   */
  static async deleteProject(req: Request, res: Response): Promise<void> {
    try {
      const projectId = parseInt(req.params.projectId);
      
      if (isNaN(projectId)) {
        res.status(400).json({ error: 'Invalid project ID' });
        return;
      }

      await ProjectService.deleteProject(projectId);
      res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error: any) {
      console.error('Delete project error:', error);
      res.status(400).json({ error: error.message || 'Failed to delete project' });
    }
  }
}
