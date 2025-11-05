import { Request, Response } from 'express';
import prisma from '../config/db.js';
import activityService from '../services/activityService.js';

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

    console.log('=== UPDATE SUBTASK DEBUG ===');
    console.log('Subtask ID:', subtaskId);
    console.log('Update data:', { title, completed, order });

    const subtask = await prisma.subtask.update({
      where: { id: parseInt(subtaskId) },
      data: {
        ...(title !== undefined && { title }),
        ...(completed !== undefined && { completed }),
        ...(order !== undefined && { order }),
      },
    });

    console.log('Subtask updated:', subtask);

    // If a subtask was marked as completed, check if all subtasks are now complete
    if (completed !== undefined) {
      const taskId = subtask.taskId;
      console.log('Checking if all subtasks complete for task:', taskId);
      
      // Get all subtasks for this task
      const allSubtasks = await prisma.subtask.findMany({
        where: { taskId },
      });

      console.log('All subtasks for task:', allSubtasks);
      console.log('Total subtasks:', allSubtasks.length);
      console.log('Completed subtasks:', allSubtasks.filter(st => st.completed).length);

      // Check if all subtasks are completed
      const allCompleted = allSubtasks.length > 0 && allSubtasks.every(st => st.completed);
      console.log('All subtasks completed?', allCompleted);

      if (allCompleted) {
        // Get the task to check its current status and project workflow type
        const task = await prisma.task.findUnique({
          where: { id: taskId },
          include: { project: true },
        });

        console.log('Task details:', {
          id: task?.id,
          status: task?.status,
          workflowType: task?.project.workflowType
        });

        if (task) {
          // Only auto-move to review for AUTOMATED workflow
          if (task.project.workflowType === 'AUTOMATED') {
            console.log('Project is AUTOMATED workflow');
            // Only auto-move to review if not already completed
            if (task.status !== 'COMPLETED' && task.status !== 'IN_REVIEW') {
              console.log('Moving task to IN_REVIEW...');
              const oldStatus = task.status;
              await prisma.task.update({
                where: { id: taskId },
                data: { status: 'IN_REVIEW' },
              });
              console.log(`✅ Task ${taskId} moved to IN_REVIEW - all subtasks completed (AUTOMATED workflow)`);
              
              // Log activity
              await activityService.logTaskStatusChange(
                task.projectId,
                taskId,
                task.title,
                oldStatus,
                'IN_REVIEW'
              );
            } else {
              console.log(`Task already in ${task.status} status, not moving`);
            }
          } else {
            console.log('Project is CUSTOM workflow, not auto-moving task');
          }
        }
      }
    }

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
