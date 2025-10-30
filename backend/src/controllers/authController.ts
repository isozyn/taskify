// Login, register, password reset

import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';
import * as authService from '../services/authService';
import * as emailService from '../services/emailService';

/**
 * Register new user
 * POST /api/v1/auth/register
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await authService.hashPassword(password);

    // Create user
    const user = await userService.createUser({
      name,
      email,
      password: hashedPassword,
    });

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user.email, user.id, user.name);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails, but log the error
    }

    // Return user response without password
    const userResponse = userService.toUserResponse(user);

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/v1/auth/login
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, rememberMe } = req.body;

    // Find user by email
    const user = await userService.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Compare passwords
    const isPasswordValid = await authService.comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      res.status(403).json({ 
        message: 'Please verify your email before logging in',
        userId: user.id,
        email: user.email
      });
      return;
    }

    // Generate tokens
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = authService.generateAccessToken(tokenPayload);
    const refreshToken = authService.generateRefreshToken(tokenPayload);

    // Store refresh token in database
    const refreshTokenExpiry = authService.getTokenExpiryDate(
      process.env.JWT_REFRESH_EXPIRES_IN || '30d'
    );
    await userService.addRefreshToken(user.id, refreshToken, refreshTokenExpiry);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe
        ? 30 * 24 * 60 * 60 * 1000 // 30 days
        : 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return access token and user info
    const userResponse = userService.toUserResponse(user);

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      res.status(401).json({ message: 'Refresh token not provided' });
      return;
    }

    // Verify refresh token
    const decoded = authService.verifyRefreshToken(refreshToken);

    // Check if token exists in database
    const tokenRecord = await userService.findRefreshToken(refreshToken);
    if (!tokenRecord) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      await userService.revokeRefreshToken(refreshToken);
      res.status(401).json({ message: 'Refresh token expired' });
      return;
    }

    // Generate new access token
    const tokenPayload = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    const newAccessToken = authService.generateAccessToken(tokenPayload);

    res.status(200).json({
      message: 'Token refreshed successfully',
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      // Revoke refresh token from database
      await userService.revokeRefreshToken(refreshToken);
    }

    // Clear cookie
    res.clearCookie('refreshToken');

    res.status(200).json({
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify email address
 * GET /api/v1/auth/verify-email
 */
export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.query;

    // Check if token is provided
    if (!token || typeof token !== 'string') {
      res.status(400).json({ message: 'Verification token is required' });
      return;
    }

    // Verify the token
    const decoded = authService.verifyAccessToken(token);

    // Find user by ID
    const user = await userService.findUserById(decoded.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if already verified
    if (user.isEmailVerified) {
      res.status(200).json({ message: 'Email already verified' });
      return;
    }

    // Update user to mark email as verified
    await userService.updateUser(user.id, {
      isEmailVerified: true,
    });

    res.status(200).json({
      message: 'Email verified successfully',
      user: userService.toUserResponse(user),
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid or expired')) {
      res.status(400).json({ message: 'Invalid or expired verification token' });
    } else {
      next(error);
    }
  }
};