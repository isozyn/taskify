// Project model interfaces

export interface Project {
  id: number;
  title: string;
  description?: string | null;
  color?: string | null;
  status: ProjectStatus;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  COMPLETED = 'COMPLETED'
}

export interface ProjectCreateInput {
  title: string;
  description?: string;
  color?: string;
  status?: ProjectStatus;
  ownerId: number;
}

export interface ProjectUpdateInput {
  title?: string;
  description?: string;
  color?: string;
  status?: ProjectStatus;
}

export interface ProjectResponse {
  id: number;
  title: string;
  description?: string | null;
  color?: string | null;
  status: ProjectStatus;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
}
