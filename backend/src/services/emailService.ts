// Email operations (password reset, etc.)

import nodemailer from 'nodemailer';
import * as authService from './authService';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send verification email
 */
export const sendVerificationEmail = async (
  email: string,
  userId: number,
  userName: string
): Promise<void> => {
  try {
    // Generate verification token (reusing JWT access token generation)
    const token = authService.generateAccessToken({
      id: userId,
      email: email,
      role: 'USER',
    });

    // Build verification link
    const verificationLink = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

    // Email HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
            .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Welcome to Taskify! Please verify your email address to complete your registration.</p>
              <p>Click the button below to verify your email:</p>
              <a href="${verificationLink}" style="background-color: #000; color: #fff;" class="button">Verify Email</a>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; background-color: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 3px;">
                ${verificationLink}
              </p>
              <p>This link will expire in 7 days.</p>
              <p>If you didn't create this account, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Taskify. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    await transporter.sendMail({
      from: `Taskify <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify your Taskify email',
      html: htmlContent,
      text: `Hi ${userName},\n\nPlease verify your email by clicking this link:\n${verificationLink}\n\nThis link will expire in 7 days.\n\nIf you didn't create this account, you can safely ignore this email.`,
    });

    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  userName: string
): Promise<void> => {
  try {
    // Build reset link
    const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

    // Email HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
            .button { display: inline-block; background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>We received a request to reset your Taskify password. Click the button below to reset it:</p>
              <a href="${resetLink}" class="button">Reset Password</a>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; background-color: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 3px;">
                ${resetLink}
              </p>
              <p>This link will expire in 1 hour.</p>
              <p>If you didn't request this, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Taskify. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    await transporter.sendMail({
      from: `Taskify <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset your Taskify password',
      html: htmlContent,
      text: `Hi ${userName},\n\nClick this link to reset your password:\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, you can safely ignore this email.`,
    });

    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};