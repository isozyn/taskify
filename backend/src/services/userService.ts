// User business logic & DB operations

import prisma from '../config/db';
import { User } from '@prisma/client';

interface UserCreateInput {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role?: 'USER' | 'ADMIN';
}

interface UserResponse {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a new user
 */
export const createUser = async (data: UserCreateInput): Promise<User> => {
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.password,
      avatar: data.avatar,
      role: data.role || 'USER',
    },
  });
  return user;
};

/**
 * Find user by email
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user;
};

/**
 * Find user by ID
 */
export const findUserById = async (id: number): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  return user;
};

/**
 * Update user
 */
export const updateUser = async (id: number, data: Partial<User>): Promise<User> => {
  const user = await prisma.user.update({
    where: { id },
    data,
  });
  return user;
};

/**
 * Convert User to UserResponse (exclude password)
 */
export const toUserResponse = (user: User): UserResponse => {
  const { password, resetToken, resetTokenExpiry, ...userResponse } = user;
  return userResponse;
};

/**
 * Store refresh token for a user
 */
export const addRefreshToken = async (
  userId: number,
  token: string,
  expiresAt: Date
): Promise<void> => {
  await prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });
};

/**
 * Find refresh token
 */
export const findRefreshToken = async (token: string) => {
  return await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });
};

/**
 * Revoke a specific refresh token
 */
export const revokeRefreshToken = async (token: string): Promise<void> => {
  await prisma.refreshToken.delete({
    where: { token },
  });
};

/**
 * Revoke all refresh tokens for a user (logout all devices)
 */
export const revokeAllRefreshTokens = async (userId: number): Promise<void> => {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
};
