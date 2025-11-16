// CustomColumn Controller - HTTP request handlers

import { Request, Response } from 'express';
import { CustomColumnService } from '../services/customColumnService';

export class CustomColumnController {
  /**
   * GET /api/projects/:projectId/columns
   * Get all custom columns for a project
   */
  static async getColumnsByProject(req: Request, res: Response) {
    try {
      const projectId = parseInt(req.params.projectId);

      if (isNaN(projectId)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }

      const columns = await CustomColumnService.getColumnsByProjectId(projectId);
      return res.status(200).json(columns);
    } catch (error: any) {
      return res.status(500).json({ error: 'Failed to fetch custom columns' });
    }
  }

  /**
   * GET /api/columns/:columnId
   * Get a single custom column
   */
  static async getColumnById(req: Request, res: Response) {
    try {
      const columnId = parseInt(req.params.columnId);

      if (isNaN(columnId)) {
        return res.status(400).json({ error: 'Invalid column ID' });
      }

      const column = await CustomColumnService.getColumnById(columnId);

      if (!column) {
        return res.status(404).json({ error: 'Column not found' });
      }

      return res.status(200).json(column);
    } catch (error: any) {
      return res.status(500).json({ error: 'Failed to fetch column' });
    }
  }

  /**
   * POST /api/projects/:projectId/columns
   * Create a new custom column
   */
  static async createColumn(req: Request, res: Response) {
    try {
      const projectId = parseInt(req.params.projectId);

      if (isNaN(projectId)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }

      const { title, color, order } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const column = await CustomColumnService.createColumn({
        projectId,
        title,
        color,
        order,
      });

      return res.status(201).json(column);
    } catch (error: any) {
      if (error.message === 'Project not found') {
        return res.status(404).json({ error: error.message });
      }
      
      if (error.message.includes('CUSTOM workflow')) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(500).json({ error: 'Failed to create column' });
    }
  }

  /**
   * PUT /api/columns/:columnId
   * Update a custom column
   */
  static async updateColumn(req: Request, res: Response) {
    try {
      const columnId = parseInt(req.params.columnId);

      if (isNaN(columnId)) {
        return res.status(400).json({ error: 'Invalid column ID' });
      }

      const { title, color, order } = req.body;

      const column = await CustomColumnService.updateColumn(columnId, {
        title,
        color,
        order,
      });

      return res.status(200).json(column);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Column not found' });
      }

      return res.status(500).json({ error: 'Failed to update column' });
    }
  }

  /**
   * DELETE /api/columns/:columnId
   * Delete a custom column
   */
  static async deleteColumn(req: Request, res: Response) {
    try {
      const columnId = parseInt(req.params.columnId);

      if (isNaN(columnId)) {
        return res.status(400).json({ error: 'Invalid column ID' });
      }

      await CustomColumnService.deleteColumn(columnId);

      return res.status(200).json({ message: 'Column deleted successfully' });
    } catch (error: any) {
      if (error.message === 'Column not found') {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({ error: 'Failed to delete column' });
    }
  }

  /**
   * PUT /api/projects/:projectId/columns/reorder
   * Reorder columns
   */
  static async reorderColumns(req: Request, res: Response) {
    try {
      const projectId = parseInt(req.params.projectId);

      if (isNaN(projectId)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }

      const { columnIds } = req.body;

      if (!Array.isArray(columnIds)) {
        return res.status(400).json({ error: 'columnIds must be an array' });
      }

      await CustomColumnService.reorderColumns(projectId, columnIds);

      return res.status(200).json({ message: 'Columns reordered successfully' });
    } catch (error: any) {
      return res.status(500).json({ error: 'Failed to reorder columns' });
    }
  }
}
