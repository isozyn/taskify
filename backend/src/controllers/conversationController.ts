// Conversation controller for REST API endpoints

import { Request, Response } from 'express';
import { ConversationService } from '../services/conversationService';

export class ConversationController {
  /**
   * Get all conversations for a project
   */
  static async getProjectConversations(req: Request, res: Response): Promise<void> {
    try {
      const projectId = parseInt(req.params.projectId);
      const userId = req.user!.id;

      const conversations = await ConversationService.getProjectConversations(projectId, userId);

      res.status(200).json(conversations);
    } catch (error: any) {
      console.error('Get conversations error:', error);
      res.status(error.message.includes('Not authorized') ? 403 : 500)
        .json({ message: error.message || 'Failed to fetch conversations' });
    }
  }

  /**
   * Get conversation by ID
   */
  static async getConversationById(req: Request, res: Response): Promise<void> {
    try {
      const conversationId = parseInt(req.params.conversationId);
      const userId = req.user!.id;

      const conversation = await ConversationService.getConversationById(conversationId, userId);

      if (!conversation) {
        res.status(404).json({ message: 'Conversation not found' });
        return;
      }

      res.status(200).json(conversation);
    } catch (error: any) {
      console.error('Get conversation error:', error);
      res.status(error.message.includes('Not authorized') ? 403 : 500)
        .json({ message: error.message || 'Failed to fetch conversation' });
    }
  }

  /**
   * Create a new conversation
   */
  static async createConversation(req: Request, res: Response): Promise<void> {
    try {
      const { name, type, projectId, memberIds } = req.body;
      const userId = req.user!.id;

      if (!projectId || !memberIds || !Array.isArray(memberIds)) {
        res.status(400).json({ message: 'projectId and memberIds array are required' });
        return;
      }

      // Ensure creator is included in members
      if (!memberIds.includes(userId)) {
        memberIds.push(userId);
      }

      const conversation = await ConversationService.createConversation({
        name,
        type: type || 'GROUP',
        projectId,
        memberIds,
      });

      res.status(201).json(conversation);
    } catch (error: any) {
      console.error('Create conversation error:', error);
      res.status(500).json({ message: error.message || 'Failed to create conversation' });
    }
  }

  /**
   * Get or create a direct conversation
   */
  static async getOrCreateDirectConversation(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, userId: otherUserId } = req.body;
      const userId = req.user!.id;

      if (!projectId || !otherUserId) {
        res.status(400).json({ message: 'projectId and userId are required' });
        return;
      }

      const conversation = await ConversationService.getOrCreateDirectConversation(
        projectId,
        userId,
        otherUserId
      );

      res.status(200).json(conversation);
    } catch (error: any) {
      console.error('Get or create direct conversation error:', error);
      res.status(500).json({ message: error.message || 'Failed to get or create conversation' });
    }
  }

  /**
   * Add member to conversation
   */
  static async addMember(req: Request, res: Response): Promise<void> {
    try {
      const conversationId = parseInt(req.params.conversationId);
      const { userId: newUserId } = req.body;
      const requesterId = req.user!.id;

      if (!newUserId) {
        res.status(400).json({ message: 'userId is required' });
        return;
      }

      await ConversationService.addMemberToConversation(conversationId, newUserId, requesterId);

      res.status(200).json({ message: 'Member added successfully' });
    } catch (error: any) {
      console.error('Add member error:', error);
      res.status(error.message.includes('Not authorized') ? 403 : 500)
        .json({ message: error.message || 'Failed to add member' });
    }
  }

  /**
   * Remove member from conversation
   */
  static async removeMember(req: Request, res: Response): Promise<void> {
    try {
      const conversationId = parseInt(req.params.conversationId);
      const { userId: userIdToRemove } = req.body;
      const requesterId = req.user!.id;

      if (!userIdToRemove) {
        res.status(400).json({ message: 'userId is required' });
        return;
      }

      await ConversationService.removeMemberFromConversation(conversationId, userIdToRemove, requesterId);

      res.status(200).json({ message: 'Member removed successfully' });
    } catch (error: any) {
      console.error('Remove member error:', error);
      res.status(error.message.includes('Not authorized') ? 403 : 500)
        .json({ message: error.message || 'Failed to remove member' });
    }
  }
}
