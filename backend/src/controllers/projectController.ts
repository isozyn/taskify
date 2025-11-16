// Project CRUD operations

import { Request, Response } from "express";
import { ProjectService } from "../services/projectService";

export class ProjectController {
	/**
	 * Create a new project
	 */
	static async createProject(req: Request, res: Response): Promise<void> {
		try {
			const userId = (req as any).user?.id; // Changed from userId to id

			if (!userId) {
				res.status(401).json({ error: "Unauthorized" });
				return;
			}
			const project = await ProjectService.createProject({
				...req.body,
				ownerId: userId,
			});
			res.status(201).json(project);
		} catch (error: any) {
			res.status(400).json({
				error: error.message || "Failed to create project",
			});
		}
	}

	/**
	 * Get all projects for the authenticated user
	 */
	static async getAllProjects(req: Request, res: Response): Promise<void> {
		try {
			const userId = (req as any).user?.id; // Changed from userId to id

			if (!userId) {
				res.status(401).json({ error: "Unauthorized" });
				return;
			}

			const projects = await ProjectService.getProjectsByUserId(userId);
			res.status(200).json(projects);
		} catch (error: any) {
			res.status(500).json({
				error: error.message || "Failed to fetch projects",
			});
		}
	}

	/**
	 * Get a single project by ID
	 */
	static async getProjectById(req: Request, res: Response): Promise<void> {
		try {
			const projectId = parseInt(req.params.projectId);

			if (isNaN(projectId)) {
				res.status(400).json({ error: "Invalid project ID" });
				return;
			}

			const project = await ProjectService.getProjectById(projectId);

			if (!project) {
				res.status(404).json({ error: "Project not found" });
				return;
			}

			res.status(200).json(project);
		} catch (error: any) {
			res.status(500).json({
				error: error.message || "Failed to fetch project",
			});
		}
	}

	/**
	 * Update a project
	 */
	static async updateProject(req: Request, res: Response): Promise<void> {
		try {
			const projectId = parseInt(req.params.projectId);

			if (isNaN(projectId)) {
				res.status(400).json({ error: "Invalid project ID" });
				return;
			}

			const project = await ProjectService.updateProject(
				projectId,
				req.body
			);

			if (!project) {
				res.status(404).json({ error: "Project not found" });
				return;
			}

			res.status(200).json(project);
		} catch (error: any) {
			res.status(400).json({
				error: error.message || "Failed to update project",
			});
		}
	}

	/**
	 * Delete a project
	 */
	static async deleteProject(req: Request, res: Response): Promise<void> {
		try {
			const projectId = parseInt(req.params.projectId);

			if (isNaN(projectId)) {
				res.status(400).json({ error: "Invalid project ID" });
				return;
			}

			await ProjectService.deleteProject(projectId);
			res.status(200).json({ message: "Project deleted successfully" });
		} catch (error: any) {
			res.status(400).json({
				error: error.message || "Failed to delete project",
			});
		}
	}

	/**
	 * Toggle project star status
	 */
	static async toggleProjectStar(req: Request, res: Response): Promise<void> {
		try {
			const projectId = parseInt(req.params.projectId);
			const { isStarred } = req.body;
			if (isNaN(projectId)) {
				res.status(400).json({ error: "Invalid project ID" });
				return;
			}

			if (typeof isStarred !== "boolean") {
				res.status(400).json({ error: "isStarred must be a boolean" });
				return;
			}

			const project = await ProjectService.toggleProjectStar(
				projectId,
				isStarred
			);

			if (!project) {
				res.status(404).json({ error: "Project not found" });
				return;
			}
			res.status(200).json(project);
		} catch (error: any) {
			res.status(400).json({
				error: error.message || "Failed to toggle star",
			});
		}
	}

	/**
	 * Invite members to a project
	 */
	static async inviteMembers(req: Request, res: Response): Promise<void> {
		try {
			const projectId = parseInt(req.params.projectId);
			const userId = (req as any).user?.id;
			const { members } = req.body; // Array of { email, role }

			if (isNaN(projectId)) {
				res.status(400).json({ error: "Invalid project ID" });
				return;
			}

			if (!userId) {
				res.status(401).json({ error: "Unauthorized" });
				return;
			}

			if (!members || !Array.isArray(members)) {
				res.status(400).json({ error: "Members array is required" });
				return;
			}

			const result = await ProjectService.inviteMembers(
				projectId,
				userId,
				members
			);
			res.status(200).json(result);
		} catch (error: any) {
			res.status(400).json({
				error: error.message || "Failed to invite members",
			});
		}
	}

	/**
	 * Get project members
	 */
	static async getProjectMembers(req: Request, res: Response): Promise<void> {
		try {
			const projectId = parseInt(req.params.projectId);

			if (isNaN(projectId)) {
				res.status(400).json({ error: "Invalid project ID" });
				return;
			}

			const members = await ProjectService.getProjectMembers(projectId);
			res.status(200).json(members);
		} catch (error: any) {
			res.status(500).json({
				error: error.message || "Failed to fetch project members",
			});
		}
	}

	/**
	 * Update project member role
	 */
	static async updateMemberRole(req: Request, res: Response): Promise<void> {
		try {
			const projectId = parseInt(req.params.projectId);
			const memberId = parseInt(req.params.memberId);
			const { role } = req.body;

			if (isNaN(projectId) || isNaN(memberId)) {
				res.status(400).json({ error: "Invalid project or member ID" });
				return;
			}

			if (!role || !["OWNER", "ADMIN", "MEMBER"].includes(role)) {
				res.status(400).json({
					error: "Invalid role. Must be OWNER, ADMIN, or MEMBER",
				});
				return;
			}

			const updatedMember = await ProjectService.updateMemberRole(
				projectId,
				memberId,
				role
			);
			res.status(200).json(updatedMember);
		} catch (error: any) {
			res.status(400).json({
				error: error.message || "Failed to update member role",
			});
		}
	}

	/**
	 * Remove member from project
	 */
	static async removeMember(req: Request, res: Response): Promise<void> {
		try {
			const userId = (req as any).user?.id;
			const projectId = parseInt(req.params.projectId);
			const memberId = parseInt(req.params.memberId);

			if (!userId) {
				res.status(401).json({ error: "Unauthorized" });
				return;
			}

			if (isNaN(projectId) || isNaN(memberId)) {
				res.status(400).json({ error: "Invalid project or member ID" });
				return;
			}

			await ProjectService.removeMember(projectId, memberId, userId);
			res.status(200).json({ message: "Member removed successfully" });
		} catch (error: any) {
			res.status(400).json({
				error: error.message || "Failed to remove member",
			});
		}
	}

	/**
	 * Accept project invitation
	 */
	static async acceptInvitation(req: Request, res: Response): Promise<void> {
		try {
			const userId = (req as any).user?.id;
			const { projectName, role } = req.body;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized" });
				return;
			}

			if (!projectName || !role) {
				res.status(400).json({
					error: "Project name and role are required",
				});
				return;
			}

			const result = await ProjectService.acceptInvitation(
				userId,
				projectName,
				role
			);

			if (result.success) {
				res.status(200).json(result);
			} else {
				res.status(400).json(result);
			}
		} catch (error: any) {
			res.status(500).json({
				error: error.message || "Failed to accept invitation",
			});
		}
	}
}
