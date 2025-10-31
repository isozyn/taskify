// User business logic & DB operations

import prisma from '../config/db';
import { User } from '@prisma/client';
import { UserCreateInput, UserResponse } from '../models/User';

/**
 * Create a new user
 */
export const createUser = async (data: UserCreateInput): Promise<User> => {
  const user = await prisma.user.create({
    data: {
      name: data.name,
      username: data.username,
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
 * Find user by username
 */
export const findUserByUsername = async (username: string): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: { username },
  });
  return user;
};

/**
 * Find user by email OR username
 */
export const findUserByEmailOrUsername = async (emailOrUsername: string): Promise<User | null> => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: emailOrUsername },
        { username: emailOrUsername },
      ],
    },
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
  return userResponse as UserResponse;
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

/**
 * Set reset token for a user
 */
export const setResetToken = async (
  userId: number,
  resetToken: string,
  resetTokenExpiry: Date
): Promise<User> => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      resetToken,
      resetTokenExpiry,
    },
  });
  return user;
};

/**
 * Find user by reset token
 */
export const findUserByResetToken = async (resetToken: string): Promise<User | null> => {
  const user = await prisma.user.findFirst({
    where: {
      resetToken,
      resetTokenExpiry: {
        gte: new Date(), // Token must not be expired
      },
    },
  });
  return user;
};

/**
 * Clear reset token after use
 */
export const clearResetToken = async (userId: number): Promise<User> => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      resetToken: null,
      resetTokenExpiry: null,
    },
  });
  return user;
};
