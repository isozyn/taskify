// Project model interfaces
import { ProjectStatus, WorkflowType } from '@prisma/client';

export { ProjectStatus, WorkflowType };

export interface Project {
  id: number;
  title: string;
  description?: string | null;
  color?: string | null;
  status: ProjectStatus;
  workflowType: WorkflowType;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectCreateInput {
  title: string;
  description?: string;
  color?: string;
  status?: ProjectStatus;
  workflowType: WorkflowType;
  ownerId: number;
}

export interface ProjectUpdateInput {
  title?: string;
  description?: string;
  color?: string;
  status?: ProjectStatus;
  // workflowType cannot be changed after creation
}

export interface ProjectResponse {
  id: number;
  title: string;
  description?: string | null;
  color?: string | null;
  status: ProjectStatus;
  workflowType: WorkflowType;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
}
