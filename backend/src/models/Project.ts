// Project model interfaces
import { ProjectStatus, WorkflowType } from "@prisma/client";

export { ProjectStatus, WorkflowType };

export interface Project {
	id: number;
	title: string;
	description?: string | null;
	color?: string | null;
	status: ProjectStatus;
	workflowType: WorkflowType;
	startDate?: Date | null;
	endDate?: Date | null;
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
	startDate?: string;
	endDate?: string;
	ownerId: number;
}

export interface ProjectUpdateInput {
	title?: string;
	description?: string;
	color?: string;
	status?: ProjectStatus;
	startDate?: string;
	endDate?: string;
	workflowType?: WorkflowType;
}

export interface ProjectResponse {
	id: number;
	title: string;
	description?: string | null;
	color?: string | null;
	status: ProjectStatus;
	workflowType: WorkflowType;
	startDate?: Date | null;
	endDate?: Date | null;
	ownerId: number;
	createdAt: Date;
	updatedAt: Date;
}
