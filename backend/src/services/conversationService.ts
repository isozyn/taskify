// Conversation service for handling conversation operations

import prisma from '../config/db';
import { ConversationCreateInput, ConversationWithDetails } from '../models/Conversation';

export class ConversationService {
  /**
   * Create a new conversation
   */
  static async createConversation(data: ConversationCreateInput): Promise<ConversationWithDetails> {
    // Create conversation with members
    const conversation = await prisma.conversation.create({
      data: {
        name: data.name,
        type: data.type,
        projectId: data.projectId,
        members: {
          create: data.memberIds.map((userId) => ({
            userId,
          })),
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return conversation;
  }

  /**
   * Get conversation by ID
   */
  static async getConversationById(conversationId: number, userId: number): Promise<ConversationWithDetails | null> {
    // Verify user is a member
    const membership = await prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId,
      },
    });

    if (!membership) {
      throw new Error('Not authorized to access this conversation');
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return conversation;
  }

  /**
   * Get all conversations for a project
   */
  static async getProjectConversations(projectId: number, userId: number): Promise<ConversationWithDetails[]> {
    // Verify user is a project member or owner
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Check if user is project owner or a member
    const isOwner = project.ownerId === userId;
    const isMember = project.members.length > 0;

    if (!isOwner && !isMember) {
      throw new Error('Not authorized to access this project');
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        projectId,
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Calculate unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const member = conversation.members.find((m) => m.userId === userId);
        const lastReadAt = member?.lastReadAt || new Date(0);

        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            createdAt: {
              gt: lastReadAt,
            },
            senderId: {
              not: userId,
            },
          },
        });

        return {
          ...conversation,
          unreadCount,
        };
      })
    );

    return conversationsWithUnread;
  }

  /**
   * Get or create a direct conversation between two users in a project
   */
  static async getOrCreateDirectConversation(
    projectId: number,
    userId1: number,
    userId2: number
  ): Promise<ConversationWithDetails> {
    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        projectId,
        type: 'DIRECT',
        members: {
          every: {
            userId: {
              in: [userId1, userId2],
            },
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (existingConversation && existingConversation.members.length === 2) {
      return existingConversation;
    }

    // Create new conversation
    return this.createConversation({
      type: 'DIRECT',
      projectId,
      memberIds: [userId1, userId2],
    });
  }

  /**
   * Add member to conversation
   */
  static async addMemberToConversation(
    conversationId: number,
    userId: number,
    requesterId: number
  ): Promise<void> {
    // Verify requester is a member
    const requesterMembership = await prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId: requesterId,
      },
    });

    if (!requesterMembership) {
      throw new Error('Not authorized to add members');
    }

    // Add member
    await prisma.conversationMember.create({
      data: {
        conversationId,
        userId,
      },
    });
  }

  /**
   * Remove member from conversation
   */
  static async removeMemberFromConversation(
    conversationId: number,
    userId: number,
    requesterId: number
  ): Promise<void> {
    // Verify requester is a member
    const requesterMembership = await prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId: requesterId,
      },
    });

    if (!requesterMembership) {
      throw new Error('Not authorized to remove members');
    }

    // Remove member
    await prisma.conversationMember.deleteMany({
      where: {
        conversationId,
        userId,
      },
    });
  }
}
