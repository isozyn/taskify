// Login, register, password reset

import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import * as userService from "../services/userService";
import * as authService from "../services/authService";
import * as emailService from "../services/emailService";
import * as googleAuthService from "../services/googleAuthService";

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
		const { name, username, email, password } = req.body;

		// Check if user already exists by email
		const existingEmail = await userService.findUserByEmail(email);
		if (existingEmail) {
			res.status(400).json({
				message: "User with this email already exists",
			});
			return;
		}

		// Check if username already exists
		const existingUsername = await userService.findUserByUsername(username);
		if (existingUsername) {
			res.status(400).json({ message: "Username already taken" });
			return;
		}

		// Hash password
		const hashedPassword = await authService.hashPassword(password);

		// Create user
		const user = await userService.createUser({
			name,
			username,
			email,
			password: hashedPassword,
		});

		// Send verification email
		try {
			await emailService.sendVerificationEmail(
				user.email,
				user.id,
				user.name
			);
		} catch (emailError) {
			console.error("Failed to send verification email:", emailError);
			// Don't fail registration if email fails, but log the error
		}

		// Return user response without password
		const userResponse = userService.toUserResponse(user);

		res.status(201).json({
			message:
				"User registered successfully. Please check your email to verify your account.",
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

		// Find user by email or username
		const user = await userService.findUserByEmailOrUsername(email);
		if (!user) {
			res.status(401).json({
				message: "Invalid email, username or password",
			});
			return;
		}

		// Compare passwords
		const isPasswordValid = await authService.comparePassword(
			password,
			user.password || ""
		);
		if (!isPasswordValid) {
			res.status(401).json({
				message: "Invalid email, username or password",
			});
			return;
		}

		// Check if email is verified
		if (!user.isEmailVerified) {
			res.status(403).json({
				message: "Please verify your email before logging in",
				userId: user.id,
				email: user.email,
			});
			return;
		}

		// Generate tokens
		const tokenPayload = {
			id: user.id,
			email: user.email,
			role: user.role,
		};

		console.log("[Auth Debug] Generating tokens for user:", {
			userId: user.id,
			email: user.email,
			username: user.username,
		});

		// Security: Revoke all existing refresh tokens for this user (prevent session fixation)
		// This ensures only one active session per user at a time
		await userService.revokeAllRefreshTokens(user.id);

		const accessToken = authService.generateAccessToken(tokenPayload);
		const refreshToken = authService.generateRefreshToken(tokenPayload);

		// Store refresh token in database
		const refreshTokenExpiry = authService.getTokenExpiryDate(
			process.env.JWT_REFRESH_EXPIRES_IN || "30d"
		);
		await userService.addRefreshToken(
			user.id,
			refreshToken,
			refreshTokenExpiry
		);

		// Set refresh token as httpOnly cookie
		const cookieOptions = {
			httpOnly: true,
			secure: true,
			sameSite: "none" as const,
			path: "/",
		};

		console.log("[Login] Setting cookies with options:", cookieOptions);
		console.log("[Login] Request origin:", req.headers.origin);
		console.log("[Login] CORS allowed origin:", process.env.FRONTEND_URL);

		res.cookie("refreshToken", refreshToken, {
			...cookieOptions,
			maxAge: rememberMe
				? 30 * 24 * 60 * 60 * 1000 // 30 days
				: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		// Set access token as httpOnly cookie
		res.cookie("accessToken", accessToken, {
			...cookieOptions,
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		console.log("[Login] ✅ Cookies set successfully");

		// Return user info only (no tokens in response)
		const userResponse = userService.toUserResponse(user);

		// Also return tokens in response body for cross-domain deployments
		res.status(200).json({
			message: "Login successful",
			user: userResponse,
			accessToken,
			refreshToken,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Get current user
 * GET /api/v1/auth/me
 */
export const getCurrentUser = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { accessToken } = req.cookies;

		if (!accessToken) {
			res.status(401).json({ message: "Not authenticated" });
			return;
		}

		// Verify access token
		const decoded = authService.verifyAccessToken(accessToken);

		// Log for debugging
		console.log("[Auth Debug] Token decoded for user:", {
			userId: decoded.id,
			email: decoded.email,
			role: decoded.role,
		});

		// Find user by ID
		const user = await userService.findUserById(decoded.id);
		if (!user) {
			console.log("[Auth Debug] User not found in database:", decoded.id);
			res.status(404).json({ message: "User not found" });
			return;
		}

		console.log("[Auth Debug] User found:", {
			userId: user.id,
			email: user.email,
			username: user.username,
		});

		// Return user data
		const userResponse = userService.toUserResponse(user);

		res.status(200).json({
			user: userResponse,
		});
	} catch (error) {
		if (
			error instanceof Error &&
			error.message.includes("Invalid or expired")
		) {
			res.status(401).json({ message: "Invalid or expired token" });
		} else {
			next(error);
		}
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
			res.status(401).json({ message: "Refresh token not provided" });
			return;
		}

		// Verify refresh token
		const decoded = authService.verifyRefreshToken(refreshToken);

		// Check if token exists in database
		const tokenRecord = await userService.findRefreshToken(refreshToken);
		if (!tokenRecord) {
			res.status(401).json({ message: "Invalid refresh token" });
			return;
		}

		// Check if token is expired
		if (tokenRecord.expiresAt < new Date()) {
			await userService.revokeRefreshToken(refreshToken);
			res.status(401).json({ message: "Refresh token expired" });
			return;
		}

		// Generate new access token
		const tokenPayload = {
			id: decoded.id,
			email: decoded.email,
			role: decoded.role,
		};

		const newAccessToken = authService.generateAccessToken(tokenPayload);

		// Set new access token as httpOnly cookie
		res.cookie("accessToken", newAccessToken, {
			httpOnly: true,
			secure: true,
			sameSite: "none",
			path: "/",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		res.status(200).json({
			message: "Token refreshed successfully",
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

		// Clear both cookies
		res.clearCookie("refreshToken", {
			httpOnly: true,
			secure: true,
			sameSite: "none",
			path: "/",
		});

		res.clearCookie("accessToken", {
			httpOnly: true,
			secure: true,
			sameSite: "none",
			path: "/",
		});

		res.status(200).json({
			message: "Logout successful",
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
		if (!token || typeof token !== "string") {
			res.status(400).json({ message: "Verification token is required" });
			return;
		}

		// Verify the token
		const decoded = authService.verifyAccessToken(token);

		// Find user by ID
		const user = await userService.findUserById(decoded.id);
		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		// Check if already verified
		if (user.isEmailVerified) {
			// If already verified, generate tokens and return user data
			const tokenPayload = {
				id: user.id,
				email: user.email,
				role: user.role,
			};

			const accessToken = authService.generateAccessToken(tokenPayload);
			const refreshToken = authService.generateRefreshToken(tokenPayload);

			// Store refresh token in database
			const refreshExpiresAt = new Date(
				Date.now() + 30 * 24 * 60 * 60 * 1000
			); // 30 days
			await userService.addRefreshToken(
				user.id,
				refreshToken,
				refreshExpiresAt
			);

			// Set refresh token as HTTP-only cookie
			res.cookie("refreshToken", refreshToken, {
				httpOnly: true,
				secure: true,
				sameSite: "none",
				path: "/",
				maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
			});

			// Set access token as HTTP-only cookie
			res.cookie("accessToken", accessToken, {
				httpOnly: true,
				secure: true,
				sameSite: "none",
				path: "/",
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			});

			res.status(200).json({
				message: "Email already verified",
				user: userService.toUserResponse(user),
				accessToken,
				refreshToken,
			});
			return;
		}

		// Update user to mark email as verified
		const updatedUser = await userService.updateUser(user.id, {
			isEmailVerified: true,
		});

		// Generate tokens after verification
		const tokenPayload = {
			id: updatedUser.id,
			email: updatedUser.email,
			role: updatedUser.role,
		};

		const accessToken = authService.generateAccessToken(tokenPayload);
		const refreshToken = authService.generateRefreshToken(tokenPayload);

		// Store refresh token in database
		const refreshExpiresAt = new Date(
			Date.now() + 30 * 24 * 60 * 60 * 1000
		); // 30 days
		await userService.addRefreshToken(
			updatedUser.id,
			refreshToken,
			refreshExpiresAt
		);

		// Set refresh token as HTTP-only cookie
		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: "none",
			path: "/",
			maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
		});

		// Set access token as HTTP-only cookie
		res.cookie("accessToken", accessToken, {
			httpOnly: true,
			secure: true,
			sameSite: "none",
			path: "/",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		res.status(200).json({
			message: "Email verified successfully",
			user: userService.toUserResponse(updatedUser),
			accessToken,
			refreshToken,
		});
	} catch (error) {
		if (
			error instanceof Error &&
			error.message.includes("Invalid or expired")
		) {
			res.status(400).json({
				message: "Invalid or expired verification token",
			});
		} else {
			next(error);
		}
	}
};

/**
 * Forgot password - Send reset link
 * POST /api/v1/auth/forgot-password
 */
export const forgotPassword = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { email } = req.body;

		// Find user by email
		const user = await userService.findUserByEmail(email);

		// Always return success message (don't reveal if email exists for security)
		if (!user) {
			res.status(200).json({
				message:
					"If that email exists in our system, a password reset link has been sent.",
			});
			return;
		}

		// Generate secure reset token using crypto
		const resetToken = crypto.randomBytes(32).toString("hex");

		// Set token expiry to 1 hour from now
		const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

		// Save reset token to database
		await userService.setResetToken(user.id, resetToken, resetTokenExpiry);

		// Send password reset email
		try {
			await emailService.sendPasswordResetEmail(
				user.email,
				resetToken,
				user.name
			);
		} catch (emailError) {
			console.error("Failed to send password reset email:", emailError);
			// Clear the token if email fails
			await userService.clearResetToken(user.id);
			res.status(500).json({
				message: "Failed to send password reset email",
			});
			return;
		}

		res.status(200).json({
			message:
				"If that email exists in our system, a password reset link has been sent.",
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Reset password using token
 * POST /api/v1/auth/reset-password
 */
export const resetPassword = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { token, password } = req.body;

		// Find user by reset token
		const user = await userService.findUserByResetToken(token);

		if (!user) {
			res.status(400).json({
				message: "Invalid or expired reset token",
			});
			return;
		}

		// Hash the new password
		const hashedPassword = await authService.hashPassword(password);

		// Update user password
		await userService.updateUser(user.id, {
			password: hashedPassword,
		});

		// Clear reset token
		await userService.clearResetToken(user.id);

		// Optionally: Revoke all refresh tokens to force re-login on all devices
		await userService.revokeAllRefreshTokens(user.id);

		res.status(200).json({
			message:
				"Password reset successful. You can now log in with your new password.",
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Google OAuth - Get auth URL
 * GET /api/v1/auth/google
 */
export const googleAuth = async (
	_req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const authUrl = googleAuthService.getGoogleAuthUrl();
		res.status(200).json({ url: authUrl });
	} catch (error) {
		next(error);
	}
};

/**
 * Google OAuth - Callback handler
 * GET /api/v1/auth/google/callback
 */
export const googleCallback = async (
	req: Request,
	res: Response,
	_next: NextFunction
): Promise<void> => {
	try {
		const { code } = req.query;

		if (!code || typeof code !== "string") {
			res.redirect(`${process.env.FRONTEND_URL}/auth?error=no_code`);
			return;
		}

		// Verify Google token and get user info
		const googleUser = await googleAuthService.verifyGoogleToken(code);

		// Check if user exists by Google ID
		let user = await userService.findUserByGoogleId(googleUser.googleId);

		if (!user) {
			// Check if user exists by email
			user = await userService.findUserByEmail(googleUser.email);

			if (user) {
				// Link Google account to existing user
				user = await userService.updateUser(user.id, {
					googleId: googleUser.googleId,
					authProvider: "GOOGLE",
					avatar: googleUser.picture || user.avatar,
					isEmailVerified: true, // Google emails are verified
				} as any);
			} else {
				// Create new user with Google account
				// Generate username from email
				const baseUsername = googleUser.email.split("@")[0];
				let username = baseUsername;
				let counter = 1;

				// Ensure username is unique
				while (await userService.findUserByUsername(username)) {
					username = `${baseUsername}${counter}`;
					counter++;
				}

				user = await userService.createUser({
					name: googleUser.name,
					email: googleUser.email,
					username,
					password: null, // No password for Google users
					googleId: googleUser.googleId,
					authProvider: "GOOGLE",
					avatar: googleUser.picture,
					isEmailVerified: true, // Google emails are verified
				});
			}
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
			process.env.JWT_REFRESH_EXPIRES_IN || "30d"
		);
		await userService.addRefreshToken(
			user.id,
			refreshToken,
			refreshTokenExpiry
		);

		// Set tokens as httpOnly cookies
		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: "none",
			maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
		});

		res.cookie("accessToken", accessToken, {
			httpOnly: true,
			secure: true,
			sameSite: "none",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		// Redirect to frontend dashboard
		res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
	} catch (error) {
		console.error("Google OAuth callback error:", error);
		res.redirect(
			`${process.env.FRONTEND_URL}/auth?error=google_auth_failed`
		);
	}
};
