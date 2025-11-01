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
	 * Get project by ID with workflow info
	 */
	static async getProjectById(
		projectId: number
	): Promise<ProjectResponse | null> {
		const project = await prisma.project.findUnique({
			where: { id: projectId },
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
	 * Delete project
	 */
	static async deleteProject(projectId: number): Promise<void> {
		await prisma.project.delete({
			where: { id: projectId },
		});
	}

	/**
	 * Get all projects for a user
	 */
	static async getProjectsByUserId(
		userId: number
	): Promise<ProjectResponse[]> {
		const projects = await prisma.project.findMany({
			where: {
				OR: [{ ownerId: userId }, { members: { some: { userId } } }],
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
}
