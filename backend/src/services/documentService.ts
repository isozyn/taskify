/**
 * Document service for managing project wikis, meeting notes, and rich task descriptions
 */

import { PrismaClient } from '@prisma/client';
import { CreateDocumentRequest, UpdateDocumentRequest, Document, Block } from '../models/Document';

const prisma = new PrismaClient();

/**
 * Get documents by project ID
 */
export const getProjectDocuments = async (projectId: number, userId: number): Promise<Document[]> => {
  try {
    // Verify user has access to the project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      }
    });

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    const documents = await prisma.document.findMany({
      where: { projectId },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return documents.map(doc => ({
      ...doc,
      content: doc.content as Block[]
    }));
  } catch (error) {
    console.error('Error fetching project documents:', error);
    throw new Error('Failed to fetch project documents');
  }
};

/**
 * Get document by ID
 */
export const getDocumentById = async (documentId: string, userId: number): Promise<Document | null> => {
  try {
    const document = await prisma.document.findFirst({
      where: { id: documentId },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        project: {
          include: {
            members: true
          }
        }
      }
    });

    if (!document) {
      return null;
    }

    // Check if user has access
    const hasAccess = document.createdBy === userId ||
      (document.project && (
        document.project.ownerId === userId ||
        document.project.members.some(member => member.userId === userId)
      ));

    if (!hasAccess) {
      throw new Error('Access denied');
    }

    return {
      ...document,
      content: document.content as Block[]
    };
  } catch (error) {
    console.error('Error fetching document:', error);
    throw new Error('Failed to fetch document');
  }
};

/**
 * Create a new document
 */
export const createDocument = async (
  userId: number,
  documentData: CreateDocumentRequest
): Promise<Document> => {
  try {
    // If projectId is provided, verify user has access
    if (documentData.projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: documentData.projectId,
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      });

      if (!project) {
        throw new Error('Project not found or access denied');
      }
    }

    const document = await prisma.document.create({
      data: {
        title: documentData.title,
        content: documentData.content || [
          { id: `block-${Date.now()}`, type: 'paragraph', content: '' }
        ],
        type: documentData.type,
        projectId: documentData.projectId,
        meetingId: documentData.meetingId,
        taskId: documentData.taskId,
        createdBy: userId,
        isTemplate: documentData.isTemplate || false,
        templateName: documentData.templateName,
        tags: documentData.tags || []
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return {
      ...document,
      content: document.content as Block[]
    };
  } catch (error) {
    console.error('Error creating document:', error);
    throw new Error('Failed to create document');
  }
};

/**
 * Update a document
 */
export const updateDocument = async (
  documentId: string,
  userId: number,
  updateData: UpdateDocumentRequest
): Promise<Document> => {
  try {
    // Verify document exists and user has access
    const existingDoc = await getDocumentById(documentId, userId);
    if (!existingDoc) {
      throw new Error('Document not found or access denied');
    }

    const document = await prisma.document.update({
      where: { id: documentId },
      data: {
        ...(updateData.title && { title: updateData.title }),
        ...(updateData.content && { content: updateData.content }),
        ...(updateData.tags && { tags: updateData.tags }),
        updatedAt: new Date()
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return {
      ...document,
      content: document.content as Block[]
    };
  } catch (error) {
    console.error('Error updating document:', error);
    throw new Error('Failed to update document');
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (documentId: string, userId: number): Promise<void> => {
  try {
    // Verify document exists and user has access
    const existingDoc = await getDocumentById(documentId, userId);
    if (!existingDoc) {
      throw new Error('Document not found or access denied');
    }

    await prisma.document.delete({
      where: { id: documentId }
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    throw new Error('Failed to delete document');
  }
};

/**
 * Get project wiki pages
 */
export const getProjectWiki = async (projectId: number, userId: number): Promise<Document[]> => {
  try {
    const documents = await getProjectDocuments(projectId, userId);
    return documents.filter(doc => doc.type === 'WIKI' || doc.type === 'PAGE');
  } catch (error) {
    console.error('Error fetching project wiki:', error);
    throw new Error('Failed to fetch project wiki');
  }
};

/**
 * Get meeting notes for a meeting
 */
export const getMeetingNotes = async (meetingId: string, userId: number): Promise<Document | null> => {
  try {
    const document = await prisma.document.findFirst({
      where: {
        meetingId,
        type: 'MEETING_NOTES'
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!document) {
      return null;
    }

    return {
      ...document,
      content: document.content as Block[]
    };
  } catch (error) {
    console.error('Error fetching meeting notes:', error);
    throw new Error('Failed to fetch meeting notes');
  }
};

/**
 * Get task description document
 */
export const getTaskDescription = async (taskId: number, userId: number): Promise<Document | null> => {
  try {
    const document = await prisma.document.findFirst({
      where: {
        taskId,
        type: 'TASK_DESCRIPTION'
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!document) {
      return null;
    }

    return {
      ...document,
      content: document.content as Block[]
    };
  } catch (error) {
    console.error('Error fetching task description:', error);
    throw new Error('Failed to fetch task description');
  }
};

/**
 * Get document templates
 */
export const getDocumentTemplates = async (type?: string): Promise<Document[]> => {
  try {
    const documents = await prisma.document.findMany({
      where: {
        isTemplate: true,
        ...(type && { type })
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return documents.map(doc => ({
      ...doc,
      content: doc.content as Block[]
    }));
  } catch (error) {
    console.error('Error fetching document templates:', error);
    throw new Error('Failed to fetch document templates');
  }
};