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
	 * Automatically adds the creator as an OWNER member
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

		// Automatically add the creator as an OWNER member
		// This ensures they have full access to project resources (conversations, tasks, etc.)
		await prisma.projectMember.create({
			data: {
				userId: data.ownerId,
				projectId: project.id,
				role: "OWNER", // Creator gets OWNER role for full permissions
			},
		});

		console.log(
			`[Project] Creator (userId: ${data.ownerId}) added as OWNER to project ${project.id}`
		);

		// If CUSTOM workflow, create default columns
		if (project.workflowType === "CUSTOM") {
			try {
				await CustomColumnService.createDefaultColumns(project.id);
			} catch (error) {
				console.error("Failed to create default columns:", error);
				// Don't fail the entire project creation if columns fail
				// Columns can be created later by the user
			}
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
				members: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
								avatar: true,
								username: true,
							},
						},
					},
					orderBy: { joinedAt: "asc" },
				},
				owner: {
					select: {
						id: true,
						name: true,
						email: true,
						avatar: true,
						username: true,
					},
				},
			},
		});

		return project;
	}

	/**
	 * Update project
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
				...(data.workflowType && { workflowType: data.workflowType }),
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

	/**
	 * Invite members to a project
	 */
	static async inviteMembers(
		projectId: number,
		inviterId: number,
		members: Array<{ email: string; role: string }>
	): Promise<{ success: string[]; errors: string[] }> {
		const success: string[] = [];
		const errors: string[] = [];

		// Get project and inviter info
		const project = await prisma.project.findUnique({
			where: { id: projectId },
			include: {
				owner: {
					select: { name: true, email: true },
				},
			},
		});

		if (!project) {
			throw new Error("Project not found");
		}

		const inviter = await prisma.user.findUnique({
			where: { id: inviterId },
			select: { name: true, email: true },
		});

		if (!inviter) {
			throw new Error("Inviter not found");
		}

		// Import email service
		const { sendProjectInvitationEmail } = await import("./emailService");

		for (const member of members) {
			try {
				// Check if user already exists
				let user = await prisma.user.findUnique({
					where: { email: member.email },
				});

				if (user) {
					// Check if already a member
					const existingMember =
						await prisma.projectMember.findUnique({
							where: {
								userId_projectId: {
									userId: user.id,
									projectId: projectId,
								},
							},
						});

					if (existingMember) {
						errors.push(
							`${member.email} is already a member of this project`
						);
						continue;
					}

					// Add existing user to project
					await prisma.projectMember.create({
						data: {
							userId: user.id,
							projectId: projectId,
							role: member.role as any,
						},
					});
				} else {
					// For non-existing users, we'll still send invitation
					// They can create account when they accept invitation
					console.log(
						`User ${member.email} doesn't exist yet, sending invitation anyway`
					);
				}

				// Send invitation email
				console.log(`Sending invitation email to: ${member.email}`);
				console.log(`Project: ${project.title}`);
				console.log(`Inviter: ${inviter.name}`);
				console.log(`Role: ${member.role}`);

				await sendProjectInvitationEmail(
					member.email,
					project.title,
					inviter.name,
					member.role
				);

				success.push(`Invitation sent to ${member.email}`);
			} catch (error) {
				console.error(`Failed to invite ${member.email}:`, error);
				errors.push(
					`Failed to invite ${member.email}: ${
						error instanceof Error ? error.message : "Unknown error"
					}`
				);
			}
		}

		return { success, errors };
	}

	/**
	 * Get project members
	 */
	static async getProjectMembers(projectId: number) {
		const members = await prisma.projectMember.findMany({
			where: { projectId },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						avatar: true,
						username: true,
					},
				},
			},
			orderBy: { joinedAt: "asc" },
		});

		return members;
	}
}
