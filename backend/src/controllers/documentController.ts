/**
 * Document controller for managing project wikis, meeting notes, and task descriptions
 */

import { Request, Response, NextFunction } from 'express';
import * as documentService from '../services/documentService';

/**
 * Get project documents
 * GET /api/v1/projects/:projectId/documents
 */
export const getProjectDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const projectId = parseInt(req.params.projectId);

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const documents = await documentService.getProjectDocuments(projectId, userId);

    res.status(200).json({
      message: 'Documents retrieved successfully',
      documents
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get project wiki
 * GET /api/v1/projects/:projectId/wiki
 */
export const getProjectWiki = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const projectId = parseInt(req.params.projectId);

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const wikiPages = await documentService.getProjectWiki(projectId, userId);

    res.status(200).json({
      message: 'Wiki pages retrieved successfully',
      pages: wikiPages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get document by ID
 * GET /api/v1/documents/:id
 */
export const getDocumentById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const documentId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const document = await documentService.getDocumentById(documentId, userId);

    if (!document) {
      res.status(404).json({ message: 'Document not found' });
      return;
    }

    res.status(200).json({
      message: 'Document retrieved successfully',
      document
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new document
 * POST /api/v1/documents
 */
export const createDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const documentData = req.body;
    const document = await documentService.createDocument(userId, documentData);

    res.status(201).json({
      message: 'Document created successfully',
      document
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a document
 * PUT /api/v1/documents/:id
 */
export const updateDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const documentId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const updateData = req.body;
    const document = await documentService.updateDocument(documentId, userId, updateData);

    res.status(200).json({
      message: 'Document updated successfully',
      document
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a document
 * DELETE /api/v1/documents/:id
 */
export const deleteDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const documentId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    await documentService.deleteDocument(documentId, userId);

    res.status(200).json({
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get meeting notes
 * GET /api/v1/meetings/:meetingId/notes
 */
export const getMeetingNotes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const meetingId = req.params.meetingId;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const notes = await documentService.getMeetingNotes(meetingId, userId);

    res.status(200).json({
      message: 'Meeting notes retrieved successfully',
      notes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get task description
 * GET /api/v1/tasks/:taskId/description
 */
export const getTaskDescription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const taskId = parseInt(req.params.taskId);

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const description = await documentService.getTaskDescription(taskId, userId);

    res.status(200).json({
      message: 'Task description retrieved successfully',
      description
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get document templates
 * GET /api/v1/documents/templates
 */
export const getDocumentTemplates = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const type = req.query.type as string;
    const templates = await documentService.getDocumentTemplates(type);

    res.status(200).json({
      message: 'Document templates retrieved successfully',
      templates
    });
  } catch (error) {
    next(error);
  }
};