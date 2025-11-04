/**
 * Document model interfaces and types
 */

export interface Block {
  id: string;
  type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bulletList' | 'numberedList' | 'quote' | 'code' | 'todo';
  content: string;
  completed?: boolean;
  level?: number;
}

export interface Document {
  id: string;
  title: string;
  content: Block[];
  type: 'PAGE' | 'WIKI' | 'MEETING_NOTES' | 'TASK_DESCRIPTION' | 'TEMPLATE';
  projectId?: number;
  meetingId?: string;
  taskId?: number;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  isTemplate: boolean;
  templateName?: string;
  tags: string[];
}

export interface CreateDocumentRequest {
  title: string;
  content?: Block[];
  type: 'PAGE' | 'WIKI' | 'MEETING_NOTES' | 'TASK_DESCRIPTION' | 'TEMPLATE';
  projectId?: number;
  meetingId?: string;
  taskId?: number;
  isTemplate?: boolean;
  templateName?: string;
  tags?: string[];
}

export interface UpdateDocumentRequest {
  title?: string;
  content?: Block[];
  tags?: string[];
}

export interface DocumentResponse {
  id: string;
  title: string;
  content: Block[];
  type: string;
  projectId?: number;
  meetingId?: string;
  taskId?: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  isTemplate: boolean;
  templateName?: string;
  tags: string[];
  author?: {
    id: number;
    name: string;
    email: string;
  };
}