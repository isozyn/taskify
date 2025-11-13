// Email operations (password reset, verification, invitations)

import sgMail from "@sendgrid/mail";
import * as authService from "./authService";

// Email configuration
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "";
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@taskify.com";
const FROM_NAME = process.env.SENDGRID_FROM_NAME || "Taskify";

// Log configuration on startup (for debugging)
console.log("📧 SendGrid Email Service Initialized");
console.log(`   FROM_EMAIL: ${FROM_EMAIL}`);
console.log(`   FROM_NAME: ${FROM_NAME}`);
console.log(`   API_KEY configured: ${SENDGRID_API_KEY ? "Yes" : "No"}`);

if (!SENDGRID_API_KEY) {
	console.error("❌ CRITICAL: SENDGRID_API_KEY is not set!");
}

// Initialize SendGrid with API key
sgMail.setApiKey(SENDGRID_API_KEY);

/**
 * Send verification email
 */
export const sendVerificationEmail = async (
	email: string,
	userId: number,
	userName: string
): Promise<void> => {
	try {
		console.log(
			`📧 [SendGrid] Attempting to send verification email to: ${email}`
		);

		// Validate configuration
		if (!SENDGRID_API_KEY) {
			throw new Error("SendGrid API key is not configured");
		}

		if (!FROM_EMAIL) {
			throw new Error("SendGrid FROM_EMAIL is not configured");
		}

		// Generate verification token (reusing JWT access token generation)
		const token = authService.generateAccessToken({
			id: userId,
			email: email,
			role: "USER",
		});

		// Build verification link
		const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

		console.log(
			`📧 [SendGrid] Verification link generated: ${verificationLink}`
		);

		// Email HTML content - optimized for email clients
		const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button-wrapper { text-align: center; margin: 20px 0; }
            .button { display: inline-block; background-color: #007bff !important; color: white !important; padding: 14px 32px !important; text-decoration: none !important; border-radius: 5px; font-weight: bold; border: none; cursor: pointer; }
            .button:hover { background-color: #0056b3 !important; }
            .link-text { margin: 20px 0; padding: 10px; background-color: #fff; border: 1px solid #ddd; border-radius: 3px; word-break: break-all; font-size: 12px; }
            .footer { text-align: center; font-size: 12px; color: #666; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Verify Your Email</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Welcome to Taskify! Please verify your email address to complete your registration.</p>
              <p>Click the button below to verify your email:</p>
              <div class="button-wrapper">
                <a href="${verificationLink}" class="button" style="background-color: #007bff; color: white; padding: 14px 32px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email</a>
              </div>
              <p style="text-align: center; margin-top: 15px;">Or copy and paste this link in your browser:</p>
              <p class="link-text">${verificationLink}</p>
              <p style="color: #666; font-size: 13px;">This link will expire in 7 days.</p>
              <p style="color: #999; font-size: 13px;">If you didn't create this account, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Taskify. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

		console.log(`📧 [SendGrid] Preparing to send email...`);
		console.log(`   From: ${FROM_NAME} <${FROM_EMAIL}>`);
		console.log(`   To: ${email}`);
		console.log(`   Subject: Verify your Taskify email`);

		// Send email via SendGrid
		const result = await sgMail.send({
			to: email,
			from: {
				email: FROM_EMAIL,
				name: FROM_NAME,
			},
			subject: "Verify your Taskify email",
			html: htmlContent,
			text: `Hi ${userName},\n\nPlease verify your email by clicking this link:\n${verificationLink}\n\nThis link will expire in 7 days.\n\nIf you didn't create this account, you can safely ignore this email.`,
		});

		console.log(
			`✅ [SendGrid] Verification email sent successfully to ${email}`
		);
		console.log(`   SendGrid Response Status: ${result[0]?.statusCode}`);
	} catch (error: any) {
		console.error("❌ [SendGrid] Failed to send verification email");
		console.error("   Recipient:", email);
		console.error("   Error type:", error.constructor.name);
		console.error("   Error message:", error.message);

		// Log detailed SendGrid error
		if (error.response) {
			console.error(
				"   SendGrid Response Status:",
				error.response.statusCode
			);
			console.error(
				"   SendGrid Response Body:",
				JSON.stringify(error.response.body, null, 2)
			);
		}

		// Throw a more descriptive error
		const errorMessage =
			error.response?.body?.errors?.[0]?.message ||
			error.message ||
			"Unknown SendGrid error";
		throw new Error(`SendGrid Error: ${errorMessage}`);
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

		// Email HTML content - optimized for email clients
		const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button-wrapper { text-align: center; margin: 20px 0; }
            .button { display: inline-block; background-color: #28a745 !important; color: white !important; padding: 14px 32px !important; text-decoration: none !important; border-radius: 5px; font-weight: bold; border: none; cursor: pointer; }
            .button:hover { background-color: #218838 !important; }
            .link-text { margin: 20px 0; padding: 10px; background-color: #fff; border: 1px solid #ddd; border-radius: 3px; word-break: break-all; font-size: 12px; }
            .timeline { background-color: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 5px; margin: 15px 0; }
            .timeline h3 { margin: 0 0 10px 0; font-size: 16px; color: #333; }
            .timeline p { margin: 5px 0; }
            .role-badge { background-color: #007bff; color: white; padding: 4px 8px; border-radius: 3px; font-size: 12px; }
            .footer { text-align: center; font-size: 12px; color: #666; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">You're Invited to Join a Project!</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p><strong>${inviterName}</strong> has invited you to join the project <strong>"${projectName}"</strong> on Taskify.</p>
              <p>You've been assigned the role: <span class="role-badge">${role}</span></p>
              ${timelineSection}
              <p>Click the button below to accept the invitation and get started:</p>
              <div class="button-wrapper">
                <a href="${invitationLink}" class="button" style="background-color: #28a745; color: white; padding: 14px 32px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Accept Invitation</a>
              </div>
              <p style="text-align: center; margin-top: 15px;">Or copy and paste this link in your browser:</p>
              <p class="link-text">${invitationLink}</p>
              <p style="color: #666; font-size: 13px;">If you don't have a Taskify account yet, you'll be able to create one during the invitation process.</p>
              <p style="color: #666; font-size: 13px;">Looking forward to collaborating with you!</p>
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

		// Email HTML content - optimized for email clients
		const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button-wrapper { text-align: center; margin: 20px 0; }
            .button { display: inline-block; background-color: #dc3545 !important; color: white !important; padding: 14px 32px !important; text-decoration: none !important; border-radius: 5px; font-weight: bold; border: none; cursor: pointer; }
            .button:hover { background-color: #c82333 !important; }
            .link-text { margin: 20px 0; padding: 10px; background-color: #fff; border: 1px solid #ddd; border-radius: 3px; word-break: break-all; font-size: 12px; }
            .footer { text-align: center; font-size: 12px; color: #666; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>We received a request to reset your Taskify password. Click the button below to reset it:</p>
              <div class="button-wrapper">
                <a href="${resetLink}" class="button" style="background-color: #dc3545; color: white; padding: 14px 32px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
              </div>
              <p style="text-align: center; margin-top: 15px;">Or copy and paste this link in your browser:</p>
              <p class="link-text">${resetLink}</p>
              <p style="color: #666; font-size: 13px;">This link will expire in 1 hour.</p>
              <p style="color: #999; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
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
