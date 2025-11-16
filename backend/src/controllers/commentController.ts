import { Request, Response } from 'express';
import prisma from '../config/db';

export class CommentController {
  /**
   * Get all comments for a task
   */
  static async getTaskComments(req: Request, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;

      const comments = await prisma.comment.findMany({
        where: { taskId: parseInt(taskId) },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ comments });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  }

  /**
   * Create a new comment
   */
  static async createComment(req: Request, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const { content } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!content || content.trim() === '') {
        res.status(400).json({ error: 'Comment content is required' });
        return;
      }

      const comment = await prisma.comment.create({
        data: {
          content: content.trim(),
          taskId: parseInt(taskId),
          authorId: userId,
        },
        include: {
          author: {
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

      res.status(201).json({ comment });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create comment' });
    }
  }

  /**
   * Update a comment
   */
  static async updateComment(req: Request, res: Response): Promise<void> {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Check if user is the author
      const existingComment = await prisma.comment.findUnique({
        where: { id: parseInt(commentId) },
      });

      if (!existingComment) {
        res.status(404).json({ error: 'Comment not found' });
        return;
      }

      if (existingComment.authorId !== userId) {
        res.status(403).json({ error: 'You can only edit your own comments' });
        return;
      }

      const comment = await prisma.comment.update({
        where: { id: parseInt(commentId) },
        data: { content: content.trim() },
        include: {
          author: {
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

      res.json({ comment });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update comment' });
    }
  }

  /**
   * Delete a comment
   */
  static async deleteComment(req: Request, res: Response): Promise<void> {
    try {
      const { commentId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Check if user is the author
      const existingComment = await prisma.comment.findUnique({
        where: { id: parseInt(commentId) },
      });

      if (!existingComment) {
        res.status(404).json({ error: 'Comment not found' });
        return;
      }

      if (existingComment.authorId !== userId) {
        res.status(403).json({ error: 'You can only delete your own comments' });
        return;
      }

      await prisma.comment.delete({
        where: { id: parseInt(commentId) },
      });

      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  }
}
