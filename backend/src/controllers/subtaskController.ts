import { Request, Response } from 'express';
import prisma from '../config/db.js';

// Get all subtasks for a task
export const getSubtasks = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    const subtasks = await prisma.subtask.findMany({
      where: { taskId: parseInt(taskId) },
      orderBy: { order: 'asc' },
    });

    res.json({ subtasks });
  } catch (error) {
    console.error('Error fetching subtasks:', error);
    res.status(500).json({ error: 'Failed to fetch subtasks' });
  }
};

// Create a new subtask
export const createSubtask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { title, order } = req.body;

    const subtask = await prisma.subtask.create({
      data: {
        title,
        order: order || 0,
        taskId: parseInt(taskId),
      },
    });

    res.status(201).json({ subtask });
  } catch (error) {
    console.error('Error creating subtask:', error);
    res.status(500).json({ error: 'Failed to create subtask' });
  }
};

// Update a subtask
export const updateSubtask = async (req: Request, res: Response) => {
  try {
    const { subtaskId } = req.params;
    const { title, completed, order } = req.body;

    const subtask = await prisma.subtask.update({
      where: { id: parseInt(subtaskId) },
      data: {
        ...(title !== undefined && { title }),
        ...(completed !== undefined && { completed }),
        ...(order !== undefined && { order }),
      },
    });

    res.json({ subtask });
  } catch (error) {
    console.error('Error updating subtask:', error);
    res.status(500).json({ error: 'Failed to update subtask' });
  }
};

// Delete a subtask
export const deleteSubtask = async (req: Request, res: Response) => {
  try {
    const { subtaskId } = req.params;

    await prisma.subtask.delete({
      where: { id: parseInt(subtaskId) },
    });

    res.json({ message: 'Subtask deleted successfully' });
  } catch (error) {
    console.error('Error deleting subtask:', error);
    res.status(500).json({ error: 'Failed to delete subtask' });
  }
};
