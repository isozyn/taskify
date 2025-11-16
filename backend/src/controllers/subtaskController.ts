import { Request, Response } from "express";
import prisma from "../config/db.js";
import activityService from "../services/activityService.js";

// Get all subtasks for a task
export const getSubtasks = async (req: Request, res: Response) => {
	try {
		const { taskId } = req.params;

		const subtasks = await prisma.subtask.findMany({
			where: { taskId: parseInt(taskId) },
			orderBy: { order: "asc" },
		});

		res.json({ subtasks });
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch subtasks" });
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
		res.status(500).json({ error: "Failed to create subtask" });
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
		// If a subtask was marked as completed, check if all subtasks are now complete
		if (completed !== undefined) {
			const taskId = subtask.taskId;
			// Get all subtasks for this task
			const allSubtasks = await prisma.subtask.findMany({
				where: { taskId },
			});
			// Check if all subtasks are completed
			const allCompleted =
				allSubtasks.length > 0 &&
				allSubtasks.every((st) => st.completed);
			if (allCompleted) {
				// Get the task to check its current status and project workflow type
				const task = await prisma.task.findUnique({
					where: { id: taskId },
					include: { project: true },
				});
				if (task) {
					// Only auto-move to review for AUTOMATED workflow
					if (task.project.workflowType === "AUTOMATED") {
						// Only auto-move to review if not already completed
						if (
							task.status !== "COMPLETED" &&
							task.status !== "IN_REVIEW"
						) {
							const oldStatus = task.status;
							await prisma.task.update({
								where: { id: taskId },
								data: { status: "IN_REVIEW" },
							});
							// Log activity
							await activityService.logTaskStatusChange(
								task.projectId,
								taskId,
								task.title,
								oldStatus,
								"IN_REVIEW"
							);
						} else {
						}
					} else {
					}
				}
			}
		}

		res.json({ subtask });
	} catch (error) {
		res.status(500).json({ error: "Failed to update subtask" });
	}
};

// Delete a subtask
export const deleteSubtask = async (req: Request, res: Response) => {
	try {
		const { subtaskId } = req.params;

		await prisma.subtask.delete({
			where: { id: parseInt(subtaskId) },
		});

		res.json({ message: "Subtask deleted successfully" });
	} catch (error) {
		res.status(500).json({ error: "Failed to delete subtask" });
	}
};
