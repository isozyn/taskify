// Message controller for REST API endpoints

import { Request, Response } from 'express';
import { MessageService } from '../services/messageService';
import { getIO } from '../services/socketService';
import prisma from '../config/db';

export class MessageController {
  /**
   * Get messages for a conversation
   */
  static async getConversationMessages(req: Request, res: Response): Promise<void> {
    try {
      const conversationId = parseInt(req.params.conversationId);
      const limit = parseInt(req.query.limit as string) || 50;
      const before = req.query.before ? new Date(req.query.before as string) : undefined;

      const messages = await MessageService.getConversationMessages(conversationId, limit, before);

      res.status(200).json(messages);
    } catch (error: any) {
      console.error('Get messages error:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch messages' });
    }
  }

  /**
   * Create a message and broadcast via Socket.IO
   */
  static async createMessage(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId, content } = req.body;
      const userId = req.user!.id;

      if (!content || !conversationId) {
        res.status(400).json({ message: 'Content and conversationId are required' });
        return;
      }

      // Create message in database
      const message = await MessageService.createMessage({
        content,
        senderId: userId,
        conversationId,
      });

      // Broadcast to conversation room AND all members' personal rooms via Socket.IO
      try {
        const io = getIO();
        
        console.log(`📤 REST API: Message ${message.id} created in conversation ${conversationId}`);
        
        // Get all conversation members
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: {
            members: {
              select: {
                userId: true,
              }
            }
          }
        });

        if (!conversation) {
          console.error('❌ Conversation not found for broadcasting');
        } else {
          // Broadcast to conversation room (for users currently viewing the chat)
          io.to(`conversation:${conversationId}`).emit('message:new', message);
          console.log(`📨 REST: Broadcasted to conversation:${conversationId}`);
          
          // Also broadcast to OTHER members' personal rooms (exclude sender to avoid duplicates)
          conversation.members.forEach((member: any) => {
            // Skip sender - they already received it via conversation room
            if (member.userId !== userId) {
              io.to(`user:${member.userId}`).emit('message:new', message);
              console.log(`📨 REST: Broadcasted to user:${member.userId}`);
            }
          });
          
          // Update conversation's updatedAt timestamp
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
          });
        }
      } catch (socketError) {
        console.error('❌ Socket.IO broadcast error:', socketError);
        // Don't fail the request if socket broadcast fails
      }

      res.status(201).json(message);
    } catch (error: any) {
      console.error('Create message error:', error);
      res.status(500).json({ message: error.message || 'Failed to create message' });
    }
  }

  /**
   * Update a message
   */
  static async updateMessage(req: Request, res: Response): Promise<void> {
    try {
      const messageId = parseInt(req.params.messageId);
      const { content } = req.body;
      const userId = req.user!.id;

      if (!content) {
        res.status(400).json({ message: 'Content is required' });
        return;
      }

      const message = await MessageService.updateMessage(messageId, userId, { content });

      res.status(200).json(message);
    } catch (error: any) {
      console.error('Update message error:', error);
      res.status(error.message.includes('not found') ? 404 : error.message.includes('Not authorized') ? 403 : 500)
        .json({ message: error.message || 'Failed to update message' });
    }
  }

  /**
   * Delete a message
   */
  static async deleteMessage(req: Request, res: Response): Promise<void> {
    try {
      const messageId = parseInt(req.params.messageId);
      const userId = req.user!.id;

      await MessageService.deleteMessage(messageId, userId);

      res.status(204).send();
    } catch (error: any) {
      console.error('Delete message error:', error);
      res.status(error.message.includes('not found') ? 404 : error.message.includes('Not authorized') ? 403 : 500)
        .json({ message: error.message || 'Failed to delete message' });
    }
  }
}


