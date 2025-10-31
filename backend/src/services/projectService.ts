import { PrismaClient, Project, ProjectStatus } from '@prisma/client';
import prisma from '../config/db';
import { notificationService } from './notificationService';

class ProjectService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async updateProjectStatus(projectId: number, status: ProjectStatus): Promise<Project> {
    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: { status },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });

    // If the project is marked as completed, notify all project members
    if (status === ProjectStatus.COMPLETED) {
      // Get all project members including the owner
      const memberIds = project.members.map(member => member.userId);
      memberIds.push(project.ownerId); // Add the owner to the notification list

      // Remove duplicates
      const uniqueMemberIds = [...new Set(memberIds)];

      // Create notifications for all members
      await Promise.all(
        uniqueMemberIds.map(userId =>
          notificationService.createProjectCompletionNotification(
            userId,
            project.title,
            project.id
          )
        )
      );
    }

    return project;
  }

  // Other project service methods...
}

export const projectService = new ProjectService();