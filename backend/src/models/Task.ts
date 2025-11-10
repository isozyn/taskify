// Task model interfaces
import { TaskStatus, Priority } from '@prisma/client';

export { TaskStatus, Priority };

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  startDate?: Date | null;
  endDate?: Date | null;
  projectId: number;
  assigneeId?: number | null;
  tags: string[];
  columnId?: string | null; // For custom workflow
  labelText?: string | null;
  labelColor?: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskCreateInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  startDate?: Date;
  endDate?: Date;
  projectId: number;
  assigneeId?: number;
  tags?: string[];
  columnId?: string; // For custom workflow
  labelText?: string;
  labelColor?: string;
  order?: number;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  startDate?: Date;
  endDate?: Date;
  assigneeId?: number; // Keep for backward compatibility
  assigneeIds?: number[]; // New multiple assignees field
  tags?: string[];
  columnId?: string; // For custom workflow
  labelText?: string;
  labelColor?: string;
  order?: number;
}

export interface TaskResponse {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  startDate?: Date | null;
  endDate?: Date | null;
  projectId: number;
  assigneeId?: number | null; // Keep for backward compatibility
  tags: string[];
  columnId?: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  subtasks?: any[]; // Optional subtasks array
  project?: any; // Optional project relation
  assignee?: any; // Optional assignee relation (backward compatibility)
  assignees?: Array<{
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
  }>; // New multiple assignees field
}
