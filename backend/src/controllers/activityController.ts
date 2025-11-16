import { Request, Response } from 'express';
import activityService from '../services/activityService';

export const getProjectActivities = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const activities = await activityService.getProjectActivities(
      parseInt(projectId),
      limit
    );

    res.json({ activities });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};
