// Project business logic

import prisma from "../config/db";
import {
	ProjectCreateInput,
	ProjectUpdateInput,
	ProjectResponse,
} from "../models";
import { CustomColumnService } from "./customColumnService";

export class ProjectService {
	/**
	 * Create a new project
	 * Automatically creates default columns if workflow type is CUSTOM
	 */
	static async createProject(
		data: ProjectCreateInput
	): Promise<ProjectResponse> {
		const project = await prisma.project.create({
			data: {
				title: data.title,
				description: data.description,
				color: data.color,
				status: data.status || "ACTIVE",
				workflowType: data.workflowType || "CUSTOM",
				startDate: data.startDate ? new Date(data.startDate) : null,
				endDate: data.endDate ? new Date(data.endDate) : null,
				ownerId: data.ownerId,
			},
		});

		// If CUSTOM workflow, create default columns
		if (project.workflowType === "CUSTOM") {
			await CustomColumnService.createDefaultColumns(project.id);
		}

		return project;
	}

	/**
	 * Get project by ID with workflow info (excluding deleted projects)
	 */
	static async getProjectById(
		projectId: number
	): Promise<ProjectResponse | null> {
		const project = await prisma.project.findUnique({
			where: { 
				id: projectId,
				isDeleted: false,
			},
			include: {
				customColumns: {
					orderBy: { order: "asc" },
				},
			},
		});

		return project;
	}

	/**
	 * Update project
	 * Note: workflowType cannot be changed after creation
	 */
	static async updateProject(
		projectId: number,
		data: ProjectUpdateInput
	): Promise<ProjectResponse> {
		const project = await prisma.project.update({
			where: { id: projectId },
			data: {
				...(data.title && { title: data.title }),
				...(data.description !== undefined && {
					description: data.description,
				}),
				...(data.color !== undefined && { color: data.color }),
				...(data.status && { status: data.status }),
				...(data.startDate !== undefined && {
					startDate: data.startDate ? new Date(data.startDate) : null,
				}),
				...(data.endDate !== undefined && {
					endDate: data.endDate ? new Date(data.endDate) : null,
				}),
				// workflowType is intentionally excluded
			},
		});

		return project;
	}

	/**
	 * Soft delete project (move to trash)
	 */
	static async deleteProject(projectId: number, deletedBy: number): Promise<void> {
		await prisma.project.update({
			where: { id: projectId },
			data: {
				isDeleted: true,
				deletedAt: new Date(),
				deletedBy: deletedBy,
			},
		});
	}

	/**
	 * Permanently delete project (hard delete)
	 */
	static async permanentlyDeleteProject(projectId: number): Promise<void> {
		await prisma.project.delete({
			where: { id: projectId },
		});
	}

	/**
	 * Restore project from trash
	 */
	static async restoreProject(projectId: number): Promise<ProjectResponse> {
		const project = await prisma.project.update({
			where: { id: projectId },
			data: {
				isDeleted: false,
				deletedAt: null,
				deletedBy: null,
			},
			include: {
				customColumns: {
					orderBy: { order: "asc" },
				},
			},
		});

		return project;
	}

	/**
	 * Get all active projects for a user (excluding deleted)
	 */
	static async getProjectsByUserId(
		userId: number
	): Promise<ProjectResponse[]> {
		const projects = await prisma.project.findMany({
			where: {
				AND: [
					{ isDeleted: false },
					{
						OR: [{ ownerId: userId }, { members: { some: { userId } } }],
					},
				],
			},
			include: {
				customColumns: {
					orderBy: { order: "asc" },
				},
			},
			orderBy: { createdAt: "desc" },
		});

		return projects;
	}

	/**
	 * Get deleted projects for a user (trash)
	 */
	static async getDeletedProjectsByUserId(
		userId: number
	): Promise<ProjectResponse[]> {
		const projects = await prisma.project.findMany({
			where: {
				AND: [
					{ isDeleted: true },
					{
						OR: [{ ownerId: userId }, { members: { some: { userId } } }],
					},
				],
			},
			include: {
				customColumns: {
					orderBy: { order: "asc" },
				},
			},
			orderBy: { deletedAt: "desc" },
		});

		return projects;
	}

	/**
	 * Clean up projects deleted more than 30 days ago
	 */
	static async cleanupExpiredProjects(): Promise<number> {
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const expiredProjects = await prisma.project.findMany({
			where: {
				isDeleted: true,
				deletedAt: {
					lt: thirtyDaysAgo,
				},
			},
			select: { id: true },
		});

		if (expiredProjects.length > 0) {
			await prisma.project.deleteMany({
				where: {
					id: {
						in: expiredProjects.map(p => p.id),
					},
				},
			});
		}

		return expiredProjects.length;
	}
}
