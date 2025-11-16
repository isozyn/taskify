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
      // Notify all members via Socket.IO to join the new conversation room
      try {
        const { getIO } = require('../services/socketService');
        const io = getIO();
        
        memberIds.forEach((memberId: number) => {
          io.to(`user:${memberId}`).emit('conversation:created', {
            conversation,
            shouldJoin: true,
          });
        });
      } catch (socketError) {
        // Don't fail the request if socket notification fails
      }

      res.status(201).json(conversation);
    } catch (error: any) {
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
      // Notify both users to join the conversation room via Socket.IO
      try {
        const { getIO } = require('../services/socketService');
        const io = getIO();
        
        // Notify both users
        [userId, otherUserId].forEach((memberId) => {
          io.to(`user:${memberId}`).emit('conversation:created', {
            conversation,
            shouldJoin: true,
          });
        });
      } catch (socketError) {
      }

      res.status(200).json(conversation);
    } catch (error: any) {
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
      res.status(error.message.includes('Not authorized') ? 403 : 500)
        .json({ message: error.message || 'Failed to remove member' });
    }
  }

  /**
   * Create a group chat with all project members (Project owner only)
   */
  static async createProjectGroupChat(req: Request, res: Response): Promise<void> {
    try {
      const projectId = parseInt(req.params.projectId);
      const { name } = req.body;
      const userId = req.user!.id;

      if (!name || name.trim().length === 0) {
        res.status(400).json({ message: 'Group name is required' });
        return;
      }

      const conversation = await ConversationService.createProjectGroupChat(
        projectId,
        userId,
        name
      );
      // Notify all members via Socket.IO
      try {
        const { getIO } = require('../services/socketService');
        const io = getIO();
        
        conversation.members.forEach((member: any) => {
          io.to(`user:${member.id}`).emit('conversation:created', {
            conversation,
            shouldJoin: true,
          });
        });
      } catch (socketError) {
      }

      res.status(201).json(conversation);
    } catch (error: any) {
      const statusCode = error.message.includes('Not authorized') ? 403 : 
                         error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({ message: error.message || 'Failed to create group chat' });
    }
  }
}
