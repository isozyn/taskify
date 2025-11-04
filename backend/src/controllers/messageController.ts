// Message controller for REST API endpoints

import { Request, Response } from 'express';
import { MessageService } from '../services/messageService';

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
   * Create a message (fallback for non-socket clients)
   */
  static async createMessage(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId, content } = req.body;
      const userId = req.user!.id;

      if (!content || !conversationId) {
        res.status(400).json({ message: 'Content and conversationId are required' });
        return;
      }

      const message = await MessageService.createMessage({
        content,
        senderId: userId,
        conversationId,
      });

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
