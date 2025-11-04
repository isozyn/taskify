// Message service for handling message operations

import prisma from '../config/db';
import { MessageCreateInput, MessageUpdateInput, MessageWithSender } from '../models/Message';

export class MessageService {
  /**
   * Create a new message
   */
  static async createMessage(data: MessageCreateInput): Promise<MessageWithSender> {
    const message = await prisma.message.create({
      data: {
        content: data.content,
        senderId: data.senderId,
        conversationId: data.conversationId,
      },
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
    });

    return message;
  }

  /**
   * Get messages for a conversation
   */
  static async getConversationMessages(
    conversationId: number,
    limit: number = 50,
    before?: Date
  ): Promise<MessageWithSender[]> {
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        ...(before && { createdAt: { lt: before } }),
      },
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
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return messages.reverse(); // Return in ascending order
  }

  /**
   * Update a message
   */
  static async updateMessage(
    messageId: number,
    userId: number,
    data: MessageUpdateInput
  ): Promise<MessageWithSender> {
    // Verify the user owns the message
    const existingMessage = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!existingMessage) {
      throw new Error('Message not found');
    }

    if (existingMessage.senderId !== userId) {
      throw new Error('Not authorized to edit this message');
    }

    const message = await prisma.message.update({
      where: { id: messageId },
      data: {
        content: data.content,
        isEdited: true,
      },
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
    });

    return message;
  }

  /**
   * Delete a message
   */
  static async deleteMessage(messageId: number, userId: number): Promise<void> {
    // Verify the user owns the message
    const existingMessage = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!existingMessage) {
      throw new Error('Message not found');
    }

    if (existingMessage.senderId !== userId) {
      throw new Error('Not authorized to delete this message');
    }

    await prisma.message.delete({
      where: { id: messageId },
    });
  }

  /**
   * Mark conversation as read for a user
   */
  static async markConversationAsRead(
    conversationId: number,
    userId: number
  ): Promise<void> {
    await prisma.conversationMember.updateMany({
      where: {
        conversationId,
        userId,
      },
      data: {
        lastReadAt: new Date(),
      },
    });
  }
}
