// Task model interfaces

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
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
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
  order?: number;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  startDate?: Date;
  endDate?: Date;
  assigneeId?: number;
  tags?: string[];
  columnId?: string; // For custom workflow
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
  assigneeId?: number | null;
  tags: string[];
  columnId?: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
