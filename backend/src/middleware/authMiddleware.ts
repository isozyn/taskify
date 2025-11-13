// JWT verification

import { Request, Response, NextFunction } from "express";
import * as authService from "../services/authService";

// Extend Express Request type to include user
declare global {
	namespace Express {
		interface Request {
			user?: {
				id: number;
				email: string;
				role: string;
			};
		}
	}
}

/**
 * Middleware to verify JWT access token
 */
export const authenticateToken = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	try {
		// Debug logging
		console.log("[Auth] Cookies received:", req.cookies);
		console.log("[Auth] Headers:", req.headers);

		// Get token from cookies first, then fall back to Authorization header
		let token = req.cookies?.accessToken;

		if (!token) {
			// Fall back to Authorization header
			const authHeader = req.headers["authorization"];
			token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
		}

		if (!token) {
			console.log("[Auth] ❌ No token found in cookies or headers");
			res.status(401).json({ message: "Access token not provided" });
			return;
		}

		console.log("[Auth] ✅ Token found:", token.substring(0, 20) + "...");

		// Verify token
		const decoded = authService.verifyAccessToken(token);

		// Attach user to request
		req.user = decoded;

		next();
	} catch (error) {
		res.status(403).json({ message: "Invalid or expired access token" });
	}
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	if (!req.user) {
		res.status(401).json({ message: "Authentication required" });
		return;
	}

	if (req.user.role !== "ADMIN") {
		res.status(403).json({ message: "Admin access required" });
		return;
	}

	next();
};
