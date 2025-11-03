// /api/v1/auth/*

import express from 'express';
import * as authController from '../controllers/authController';
import { validateRequest } from '../middleware/validateRequest';
import { body } from 'express-validator';

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
], validateRequest, authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user and get access token
 * @access  Public
 */
router.post('/login', [
  body('email').trim().notEmpty().withMessage('Email or username is required'),
  body('password').notEmpty().withMessage('Password is required'),
], validateRequest, authController.login);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get('/me', authController.getCurrentUser);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh', authController.refresh);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user and revoke refresh token
 * @access  Public
 */
router.post('/logout', authController.logout);

/**
 * @route   GET /api/v1/auth/verify-email
 * @desc    Verify user email address
 * @access  Public
 * @query   token - Email verification token
 */
router.get('/verify-email', authController.verifyEmail);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send password reset link to user's email
 * @access  Public
 */
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please provide a valid email'),
], validateRequest, authController.forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset user password using reset token
 * @access  Public
 */
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
], validateRequest, authController.resetPassword);

export default router;