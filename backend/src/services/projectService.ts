// Project business logic

import prisma from "../config/db";
import {
	ProjectCreateInput,
	ProjectUpdateInput,
	ProjectResponse,
} from "../models";

export class ProjectService {
	/**
	 * Create a new project
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

		// Custom workflow starts empty - users add columns as needed

		// Fetch and return the complete project with members and owner
		const completeProject = await prisma.project.findUnique({
			where: { id: project.id },
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

		return completeProject!;
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
				// Check if already a member of THIS project
				const existingMember = await prisma.projectMember.findUnique({
					where: {
						userId_projectId: {
							userId: user.id,
							projectId: projectId
						}
					}
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
				// For non-existing users, send invitation
				// They can create account when they accept invitation
				console.log(
					`User ${member.email} doesn't exist yet, sending invitation anyway`
				);
			}				// Send invitation email (for both existing and new users)
				console.log(`Sending invitation email to: ${member.email}`);
				console.log(`Project: ${project.title}`);
				console.log(`Inviter: ${inviter.name}`);
				console.log(`Role: ${member.role}`);

				await sendProjectInvitationEmail(
					member.email,
					project.title,
					inviter.name,
					member.role,
					project.startDate,
					project.endDate
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

	/**
	 * Accept project invitation
	 * Adds user to project if they're not already a member
	 */
	static async acceptInvitation(
		userId: number,
		projectName: string,
		role: string
	): Promise<{ success: boolean; message: string; projectId?: number }> {
		try {
			// Find project by name
			const project = await prisma.project.findFirst({
				where: { title: projectName }
			});

			if (!project) {
				return { success: false, message: 'Project not found' };
			}

			// Check if user is already a member
			const existingMember = await prisma.projectMember.findUnique({
				where: {
					userId_projectId: {
						userId: userId,
						projectId: project.id
					}
				}
			});

			if (existingMember) {
				return { 
					success: true, 
					message: 'You are already a member of this project',
					projectId: project.id
				};
			}

			// Add user to project
			await prisma.projectMember.create({
				data: {
					userId: userId,
					projectId: project.id,
					role: role as any
				}
			});

			return { 
				success: true, 
				message: 'Successfully joined the project!',
				projectId: project.id
			};
		} catch (error) {
			console.error('Accept invitation error:', error);
			return { 
				success: false, 
				message: 'Failed to accept invitation'
			};
		}
	}
}
