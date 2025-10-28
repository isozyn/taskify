// User model interfaces

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  avatar?: string | null;
  role: Role;
  isEmailVerified: boolean;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface UserCreateInput {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role?: Role;
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  password?: string;
  avatar?: string;
  role?: Role;
  isEmailVerified?: boolean;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  role: Role;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
