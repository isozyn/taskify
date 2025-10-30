// /api/v1/auth/*

import express from 'express';
import * as authController from '../controllers/authController';
import { 
  validateRegister, 
  validateLogin, 
  validateForgotPassword, 
  validateResetPassword 
} from '../middleware/validateRequest';

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateRegister, authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user and get access token
 * @access  Public
 */
router.post('/login', validateLogin, authController.login);

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
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset user password using reset token
 * @access  Public
 */
router.post('/reset-password', validateResetPassword, authController.resetPassword);

export default router;