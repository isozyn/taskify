// Email operations (password reset, verification, invitations)

import sgMail from "@sendgrid/mail";
import * as authService from "./authService";

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

// Email configuration
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@taskify.com";
const FROM_NAME = process.env.SENDGRID_FROM_NAME || "Taskify";

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
			role: "USER",
		});

		// Build verification link
		const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

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
              <p>&copy; 2025 Taskify. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

		// Send email via SendGrid
		await sgMail.send({
			to: email,
			from: {
				email: FROM_EMAIL,
				name: FROM_NAME,
			},
			subject: "Verify your Taskify email",
			html: htmlContent,
			text: `Hi ${userName},\n\nPlease verify your email by clicking this link:\n${verificationLink}\n\nThis link will expire in 7 days.\n\nIf you didn't create this account, you can safely ignore this email.`,
		});

		console.log(`✅ Verification email sent to ${email}`);
	} catch (error: any) {
		console.error(
			"❌ Failed to send verification email:",
			error.response?.body || error
		);
		throw new Error("Failed to send verification email");
	}
};

/**
 * Send project invitation email
 */
export const sendProjectInvitationEmail = async (
	email: string,
	projectName: string,
	inviterName: string,
	role: string,
	startDate?: Date | null,
	endDate?: Date | null
): Promise<void> => {
	try {
		// Validate email parameter
		if (!email || !email.includes("@")) {
			throw new Error(`Invalid email address: ${email}`);
		}

		// Build invitation link
		const invitationLink = `${
			process.env.FRONTEND_URL
		}/accept-invitation?email=${encodeURIComponent(
			email
		)}&project=${encodeURIComponent(projectName)}&role=${encodeURIComponent(
			role
		)}`;

		// Format dates
		const formatDate = (date: Date | null | undefined) => {
			if (!date) return null;
			return new Date(date).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			});
		};

		const formattedStartDate = formatDate(startDate);
		const formattedEndDate = formatDate(endDate);

		// Build project timeline section
		const timelineSection =
			formattedStartDate || formattedEndDate
				? `
              <div style="background-color: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 5px; margin: 15px 0;">
                <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">Project Timeline</h3>
                ${
					formattedStartDate
						? `<p style="margin: 5px 0;"><strong>Start Date:</strong> ${formattedStartDate}</p>`
						: ""
				}
                ${
					formattedEndDate
						? `<p style="margin: 5px 0;"><strong>Deadline:</strong> ${formattedEndDate}</p>`
						: ""
				}
              </div>
            `
				: "";

		// Email HTML content
		const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
            .button { display: inline-block; background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .role-badge { background-color: #007bff; color: white; padding: 4px 8px; border-radius: 3px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>You're Invited to Join a Project!</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p><strong>${inviterName}</strong> has invited you to join the project <strong>"${projectName}"</strong> on Taskify.</p>
              <p>You've been assigned the role: <span class="role-badge">${role}</span></p>
              ${timelineSection}
              <p>Click the button below to accept the invitation and get started:</p>
              <a href="${invitationLink}" class="button">Accept Invitation</a>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; background-color: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 3px;">
                ${invitationLink}
              </p>
              <p>If you don't have a Taskify account yet, you'll be able to create one during the invitation process.</p>
              <p>Looking forward to collaborating with you!</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Taskify. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

		// Debug email sending
		console.log(`📧 Sending project invitation email:`);
		console.log(`   To: ${email}`);
		console.log(`   From: ${FROM_NAME} <${FROM_EMAIL}>`);
		console.log(
			`   Subject: You're invited to join "${projectName}" on Taskify`
		);
		console.log(`   Inviter: ${inviterName}`);

		// Build plain text timeline
		const textTimeline =
			formattedStartDate || formattedEndDate
				? `\n\nProject Timeline:\n${
						formattedStartDate
							? `Start Date: ${formattedStartDate}\n`
							: ""
				  }${formattedEndDate ? `Deadline: ${formattedEndDate}\n` : ""}`
				: "";

		// Send email via SendGrid
		await sgMail.send({
			to: email, // This should be the invited person's email
			from: {
				email: FROM_EMAIL,
				name: FROM_NAME,
			},
			subject: `You're invited to join "${projectName}" on Taskify`,
			html: htmlContent,
			text: `Hi there,\n\n${inviterName} has invited you to join the project "${projectName}" on Taskify.\n\nYou've been assigned the role: ${role}${textTimeline}\n\nClick this link to accept the invitation:\n${invitationLink}\n\nIf you don't have a Taskify account yet, you'll be able to create one during the invitation process.`,
		});

		console.log(`✅ Project invitation email sent to ${email}`);
	} catch (error: any) {
		console.error(
			"❌ Failed to send project invitation email:",
			error.response?.body || error
		);
		throw new Error("Failed to send project invitation email");
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
		const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

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
              <p>&copy; 2025 Taskify. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

		// Send email via SendGrid
		await sgMail.send({
			to: email,
			from: {
				email: FROM_EMAIL,
				name: FROM_NAME,
			},
			subject: "Reset your Taskify password",
			html: htmlContent,
			text: `Hi ${userName},\n\nClick this link to reset your password:\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, you can safely ignore this email.`,
		});

		console.log(`✅ Password reset email sent to ${email}`);
	} catch (error: any) {
		console.error(
			"❌ Failed to send password reset email:",
			error.response?.body || error
		);
		throw new Error("Failed to send password reset email");
	}
};
