// CustomColumn model interfaces

export interface CustomColumn {
  id: number;
  projectId: number;
  title: string;
  color: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomColumnCreateInput {
  projectId: number;
  title: string;
  color?: string;
  order?: number;
}

export interface CustomColumnUpdateInput {
  title?: string;
  color?: string;
  order?: number;
}

export interface CustomColumnResponse {
  id: number;
  projectId: number;
  title: string;
  color: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
