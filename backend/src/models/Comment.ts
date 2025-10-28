// Comment model interfaces

export interface Comment {
  id: number;
  content: string;
  taskId: number;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentCreateInput {
  content: string;
  taskId: number;
  authorId: number;
}

export interface CommentUpdateInput {
  content?: string;
}

export interface CommentResponse {
  id: number;
  content: string;
  taskId: number;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
}
