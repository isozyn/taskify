// Project model interfaces

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

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  COMPLETED = 'COMPLETED'
}

export enum WorkflowType {
  CUSTOM = 'CUSTOM',
  AUTOMATED = 'AUTOMATED'
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
