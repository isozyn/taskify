// API utility for making requests to the backend

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

interface ApiError {
	message: string;
	errors?: Array<{
		msg: string;
		path: string;
	}>;
}

class ApiClient {
	private baseURL: string;

	constructor(baseURL: string) {
		this.baseURL = baseURL;
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<T> {
		const url = `${this.baseURL}${endpoint}`;

		const config: RequestInit = {
			...options,
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
			credentials: "include", // Include cookies for refresh tokens
		};

		try {
			const response = await fetch(url, config);
			const data = await response.json();

			if (!response.ok) {
				throw {
					message: data.message || "An error occurred",
					errors: data.errors || [],
					status: response.status,
				};
			}

			return data;
		} catch (error) {
			if (error instanceof Error) {
				throw {
					message: error.message,
					errors: [],
				};
			}
			throw error;
		}
	}

	// Auth endpoints
	async register(data: {
		name: string;
		username: string;
		email: string;
		password: string;
	}) {
		return this.request("/auth/register", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async login(data: {
		email: string;
		password: string;
		rememberMe?: boolean;
	}) {
		return this.request("/auth/login", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async logout() {
		return this.request("/auth/logout", {
			method: "POST",
		});
	}

	async getCurrentUser() {
		return this.request("/auth/me", {
			method: "GET",
		});
	}

	async forgotPassword(email: string) {
		return this.request("/auth/forgot-password", {
			method: "POST",
			body: JSON.stringify({ email }),
		});
	}

	async resetPassword(token: string, password: string) {
		return this.request("/auth/reset-password", {
			method: "POST",
			body: JSON.stringify({ token, password }),
		});
	}

	async verifyEmail(token: string) {
		return this.request(`/auth/verify-email?token=${token}`, {
			method: "GET",
		});
	}

	async refreshToken() {
		return this.request("/auth/refresh", {
			method: "POST",
		});
	}

	// Project endpoints
	async getProjects() {
		return this.request("/projects", {
			method: "GET",
		});
	}

	async createProject(data: {
		title: string;
		description?: string;
		workflowType: "CUSTOM" | "AUTOMATED";
		color?: string;
		startDate?: string;
		endDate?: string;
	}) {
		return this.request("/projects", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async getProjectById(projectId: number) {
		return this.request(`/projects/${projectId}`, {
			method: "GET",
		});
	}

	async updateProject(
		projectId: number,
		data: {
			title?: string;
			description?: string;
			color?: string;
			status?: string;
		}
	) {
		return this.request(`/projects/${projectId}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteProject(projectId: number) {
		return this.request(`/projects/${projectId}`, {
			method: "DELETE",
		});
	}
}

// Export a singleton instance
export const api = new ApiClient(API_URL);

// Export types
export type { ApiError };

// Response types
export interface AuthResponse {
	message: string;
	user?: {
		id: number;
		name: string;
		username: string;
		email: string;
		role: string;
		isEmailVerified: boolean;
	};
	tokens?: {
		accessToken: string;
		refreshToken: string;
	};
}

export interface MessageResponse {
	message: string;
}

export interface Project {
	id: number;
	title: string;
	description?: string | null;
	color?: string | null;
	status: "ACTIVE" | "ARCHIVED" | "COMPLETED";
	workflowType: "CUSTOM" | "AUTOMATED";
	ownerId: number;
	createdAt: string;
	updatedAt: string;
}

export interface ProjectResponse {
	projects?: Project[];
	project?: Project;
}
