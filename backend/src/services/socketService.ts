// Socket.IO configuration and setup

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import * as authService from './authService';
import { MessageService } from '../services/messageService';
import prisma from '../config/db';

interface AuthenticatedSocket extends Socket {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

// Export io instance globally for use in controllers
let io: SocketIOServer;

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

export const setupSocketIO = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:8080',
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      // Get token from cookies
      const cookies = socket.handshake.headers.cookie;
      if (!cookies) {
        return next(new Error('No authentication cookie provided'));
      }

      // Parse accessToken from cookie string
      const tokenMatch = cookies.match(/accessToken=([^;]+)/);
      if (!tokenMatch) {
        return next(new Error('Access token not found in cookies'));
      }

      const token = tokenMatch[1];

      // Verify token
      const decoded = authService.verifyAccessToken(token);
      socket.user = decoded;

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', async (socket: AuthenticatedSocket) => {
    console.log(`🔌 User connected: ${socket.user?.id} (${socket.user?.email})`);

    // Join user's personal room for direct notifications
    socket.join(`user:${socket.user?.id}`);
    console.log(`✅ User ${socket.user?.id} joined personal room: user:${socket.user?.id}`);

    // Automatically join all conversations the user is a member of
    try {
      const userConversations = await prisma.conversationMember.findMany({
        where: {
          userId: socket.user!.id,
        },
        select: {
          conversationId: true,
        },
      });

      for (const membership of userConversations) {
        socket.join(`conversation:${membership.conversationId}`);
        console.log(`✅ User ${socket.user?.id} auto-joined conversation:${membership.conversationId}`);
      }
    } catch (error) {
      console.error('Failed to auto-join conversations:', error);
    }

    // Join project room
    socket.on('project:join', async (projectId: number) => {
      try {
        // Verify user is a project member or owner
        const project = await prisma.project.findUnique({
          where: { id: projectId },
          include: {
            members: {
              where: { userId: socket.user!.id },
            },
          },
        });

        if (!project) {
          socket.emit('error', { message: 'Project not found' });
          return;
        }

        const isOwner = project.ownerId === socket.user!.id;
        const isMember = project.members.length > 0;

        if (!isOwner && !isMember) {
          socket.emit('error', { message: 'Not authorized to join this project' });
          return;
        }

        socket.join(`project:${projectId}`);
        console.log(`User ${socket.user?.id} joined project:${projectId}`);
      } catch (error) {
        socket.emit('error', { message: 'Failed to join project' });
      }
    });

    // Leave project room
    socket.on('project:leave', (projectId: number) => {
      socket.leave(`project:${projectId}`);
      console.log(`User ${socket.user?.id} left project:${projectId}`);
    });

    // Join conversation room
    socket.on('conversation:join', async (conversationId: number) => {
      try {
        // Verify user is a conversation member
        const membership = await prisma.conversationMember.findFirst({
          where: {
            conversationId,
            userId: socket.user!.id,
          },
        });

        if (!membership) {
          console.log(`❌ User ${socket.user?.id} not authorized for conversation:${conversationId}`);
          socket.emit('error', { message: 'Not authorized to join this conversation' });
          return;
        }

        socket.join(`conversation:${conversationId}`);
        console.log(`✅ User ${socket.user?.id} joined conversation:${conversationId}`);

        // Mark conversation as read
        await MessageService.markConversationAsRead(conversationId, socket.user!.id);
        
        // Notify other members that this user is now active
        socket.to(`conversation:${conversationId}`).emit('user:joined_conversation', {
          userId: socket.user!.id,
          conversationId,
        });
      } catch (error) {
        console.error('Failed to join conversation:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Leave conversation room
    socket.on('conversation:leave', (conversationId: number) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`🚪 User ${socket.user?.id} left conversation:${conversationId}`);
      
      // Notify other members that this user left
      socket.to(`conversation:${conversationId}`).emit('user:left_conversation', {
        userId: socket.user!.id,
        conversationId,
      });
    });

    // Send message
    socket.on('message:send', async (data: { conversationId: number; content: string }) => {
      try {
        // Verify user is a conversation member
        const membership = await prisma.conversationMember.findFirst({
          where: {
            conversationId: data.conversationId,
            userId: socket.user!.id,
          },
        });

        if (!membership) {
          console.log(`❌ User ${socket.user?.id} not authorized to send to conversation:${data.conversationId}`);
          socket.emit('error', { message: 'Not authorized to send message' });
          return;
        }

        // Create message
        const message = await MessageService.createMessage({
          content: data.content,
          senderId: socket.user!.id,
          conversationId: data.conversationId,
        });

        console.log(`📤 Message ${message.id} created by user ${socket.user?.id} in conversation ${data.conversationId}`);

        // Get all conversation members
        const allMembers = await prisma.conversationMember.findMany({
          where: {
            conversationId: data.conversationId,
          },
          select: {
            userId: true,
          },
        });

        // Broadcast to conversation room (for users actively viewing the conversation)
        io.to(`conversation:${data.conversationId}`).emit('message:new', message);
        console.log(`📨 Broadcasted to conversation:${data.conversationId}`);

        // Also broadcast to OTHER members' personal rooms (exclude sender to avoid duplicates)
        allMembers.forEach((member) => {
          // Skip sender - they already received it via conversation room
          if (member.userId !== socket.user!.id) {
            io.to(`user:${member.userId}`).emit('message:new', message);
            console.log(`📨 Broadcasted to user:${member.userId}`);
          }
        });

        // Update conversation's updatedAt
        await prisma.conversation.update({
          where: { id: data.conversationId },
          data: { updatedAt: new Date() },
        });
      } catch (error) {
        console.error('❌ Failed to send message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Edit message
    socket.on('message:edit', async (data: { messageId: number; content: string }) => {
      try {
        const message = await MessageService.updateMessage(
          data.messageId,
          socket.user!.id,
          { content: data.content }
        );

        // Broadcast to conversation room
        io.to(`conversation:${message.conversationId}`).emit('message:edited', message);
      } catch (error) {
        console.error('Failed to edit message:', error);
        socket.emit('error', { message: 'Failed to edit message' });
      }
    });

    // Delete message
    socket.on('message:delete', async (messageId: number) => {
      try {
        // Get message to find conversation
        const message = await prisma.message.findUnique({
          where: { id: messageId },
        });

        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        await MessageService.deleteMessage(messageId, socket.user!.id);

        // Broadcast to conversation room
        io.to(`conversation:${message.conversationId}`).emit('message:deleted', { messageId });
      } catch (error) {
        console.error('Failed to delete message:', error);
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    // Mark conversation as read
    socket.on('conversation:mark_read', async (conversationId: number) => {
      try {
        await MessageService.markConversationAsRead(conversationId, socket.user!.id);
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    });

    // Typing indicator
    socket.on('typing:start', (conversationId: number) => {
      socket.to(`conversation:${conversationId}`).emit('typing:user_typing', {
        userId: socket.user!.id,
        conversationId,
      });
    });

    socket.on('typing:stop', (conversationId: number) => {
      socket.to(`conversation:${conversationId}`).emit('typing:user_stopped', {
        userId: socket.user!.id,
        conversationId,
      });
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user?.id}`);
    });
  });

  return io;
};
