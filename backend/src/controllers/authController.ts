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
		const isProduction = process.env.NODE_ENV === "production";
		const cookieOptions = {
			httpOnly: true,
			secure: isProduction,
			sameSite: isProduction ? ("none" as const) : ("lax" as const),
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

		// Return user info only (tokens are in HTTP-only cookies)
		const userResponse = userService.toUserResponse(user);

		res.status(200).json({
			message: "Login successful",
			user: userResponse,
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

		// Revoke refresh token from database if it exists
		if (refreshToken) {
			try {
				await userService.revokeRefreshToken(refreshToken);
			} catch (error) {
				// Token might not exist, continue with logout
				console.log('Failed to revoke refresh token:', error);
			}
		}

		// Clear both cookies regardless of token existence
		res.clearCookie("refreshToken", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
			path: "/",
		});

		res.clearCookie("accessToken", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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

			const isProduction = process.env.NODE_ENV === "production";
			const cookieOptions = {
				httpOnly: true,
				secure: isProduction,
				sameSite: isProduction ? ("none" as const) : ("lax" as const),
				path: "/",
			};

			// Set refresh token as HTTP-only cookie
			res.cookie("refreshToken", refreshToken, {
				...cookieOptions,
				maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
			});

			// Set access token as HTTP-only cookie
			res.cookie("accessToken", accessToken, {
				...cookieOptions,
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			});

			res.status(200).json({
				message: "Email already verified",
				user: userService.toUserResponse(user),
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

		const isProduction = process.env.NODE_ENV === "production";
		const cookieOptions = {
			httpOnly: true,
			secure: isProduction,
			sameSite: isProduction ? ("none" as const) : ("lax" as const),
			path: "/",
		};

		// Set refresh token as HTTP-only cookie
		res.cookie("refreshToken", refreshToken, {
			...cookieOptions,
			maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
		});

		// Set access token as HTTP-only cookie
		res.cookie("accessToken", accessToken, {
			...cookieOptions,
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		res.status(200).json({
			message: "Email verified successfully",
			user: userService.toUserResponse(updatedUser),
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
					googleAccessToken: googleUser.accessToken,
					googleRefreshToken: googleUser.refreshToken,
					googleTokenExpiry: googleUser.tokenExpiry,
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
					googleAccessToken: googleUser.accessToken,
					googleRefreshToken: googleUser.refreshToken,
					googleTokenExpiry: googleUser.tokenExpiry,
				});
			}
		} else {
			// User exists with Google ID, update tokens
			user = await userService.updateUser(user.id, {
				googleAccessToken: googleUser.accessToken,
				googleRefreshToken: googleUser.refreshToken,
				googleTokenExpiry: googleUser.tokenExpiry,
			} as any);
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
		const isProduction = process.env.NODE_ENV === "production";
		const cookieOptions = {
			httpOnly: true,
			secure: isProduction,
			sameSite: isProduction ? ("none" as const) : ("lax" as const),
		};

		res.cookie("refreshToken", refreshToken, {
			...cookieOptions,
			maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
		});

		res.cookie("accessToken", accessToken, {
			...cookieOptions,
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		// In development with debug flag, show token for testing
		// Set OAUTH_DEBUG=true in .env to enable this page
		if (process.env.NODE_ENV === "development" && process.env.OAUTH_DEBUG === "true") {
			res.send(`
				<!DOCTYPE html>
				<html>
				<head>
					<title>Google OAuth Success</title>
					<style>
						body {
							font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
							max-width: 800px;
							margin: 50px auto;
							padding: 20px;
							background: #f5f5f5;
						}
						.container {
							background: white;
							padding: 40px;
							border-radius: 10px;
							box-shadow: 0 2px 10px rgba(0,0,0,0.1);
						}
						h1 { color: #28a745; margin-bottom: 20px; }
						.token-box {
							background: #f4f4f4;
							padding: 15px;
							border-radius: 5px;
							word-break: break-all;
							font-family: 'Courier New', monospace;
							font-size: 12px;
							margin: 20px 0;
							max-height: 200px;
							overflow-y: auto;
						}
						button {
							background: #28a745;
							color: white;
							border: none;
							padding: 12px 24px;
							border-radius: 5px;
							cursor: pointer;
							font-size: 16px;
							margin: 10px 5px 10px 0;
						}
						button:hover { background: #218838; }
						.info { background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0; }
						.user-info { background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
					</style>
				</head>
				<body>
					<div class="container">
						<h1>✅ Google OAuth Successful!</h1>
						
						<div class="user-info">
							<h3>👤 User Information:</h3>
							<p><strong>Name:</strong> ${user.name}</p>
							<p><strong>Email:</strong> ${user.email}</p>
							<p><strong>User ID:</strong> ${user.id}</p>
						</div>

						<h3>🔑 Your Access Token:</h3>
						<div class="token-box" id="token">${accessToken}</div>
						<button onclick="copyToken()">📋 Copy Token</button>
						<button onclick="testAPI()">🧪 Test Calendar API</button>
						
						<div class="info">
							<h4>📝 How to use this token:</h4>
							<p><strong>1. Copy the token above</strong></p>
							<p><strong>2. Use it in your API requests:</strong></p>
							<div class="token-box">
curl -H "Authorization: Bearer YOUR_TOKEN" \\
  http://localhost:5000/api/v1/calendar/sync/status
							</div>
							<p><strong>3. Or test it right here by clicking "Test Calendar API"</strong></p>
						</div>

						<div id="testResult"></div>

						<button onclick="goToDashboard()" style="background: #007bff;">
							🚀 Go to Dashboard
						</button>
					</div>

					<script>
						function copyToken() {
							const token = document.getElementById('token').textContent;
							navigator.clipboard.writeText(token).then(() => {
								alert('✅ Token copied to clipboard!');
							});
						}

						async function testAPI() {
							const token = document.getElementById('token').textContent;
							const result = document.getElementById('testResult');
							result.innerHTML = '<div style="padding: 15px; background: #fff3cd; border-radius: 5px;">⏳ Testing API...</div>';
							
							try {
								const response = await fetch('http://localhost:5000/api/v1/calendar/sync/status', {
									headers: { 'Authorization': 'Bearer ' + token }
								});
								const data = await response.json();
								
								result.innerHTML = \`
									<div style="padding: 15px; background: #d4edda; border-radius: 5px; margin-top: 20px;">
										<h3>✅ API Test Successful!</h3>
										<div class="token-box">\${JSON.stringify(data, null, 2)}</div>
										<p><strong>Calendar Connected:</strong> \${data.calendarConnected ? '✅ Yes' : '❌ No'}</p>
										<p><strong>Sync Enabled:</strong> \${data.calendarSyncEnabled ? '✅ Yes' : '❌ No'}</p>
									</div>
								\`;
							} catch (error) {
								result.innerHTML = \`
									<div style="padding: 15px; background: #f8d7da; border-radius: 5px; margin-top: 20px;">
										<h3>❌ API Test Failed</h3>
										<p>\${error.message}</p>
									</div>
								\`;
							}
						}

						function goToDashboard() {
							window.location.href = '${process.env.FRONTEND_URL}/dashboard';
						}
					</script>
				</body>
				</html>
			`);
			return;
		}

		// In production, redirect to frontend dashboard
		res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
	} catch (error) {
		console.error("Google OAuth callback error:", error);
		res.redirect(
			`${process.env.FRONTEND_URL}/auth?error=google_auth_failed`
		);
	}
};
