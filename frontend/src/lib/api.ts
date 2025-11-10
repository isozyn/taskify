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
			credentials: "include", // Include cookies for authentication
		};

		try {
			const response = await fetch(url, config);
			const data = await response.json();

			if (!response.ok) {
				// Handle 401 Unauthorized - token expired or invalid
				if (response.status === 401) {
					// Only redirect to auth if not already on auth pages
					const currentPath = window.location.pathname;
					const authPaths = [
						"/auth",
						"/login",
						"/register",
						"/forgot-password",
						"/reset-password",
					];

					if (!authPaths.includes(currentPath)) {
						console.log(
							"[API] 401 Unauthorized - redirecting to login"
						);
						window.location.href = "/auth";
					}
				}

				// Support different backend error shapes: { message } or { error }
				throw {
					message: data.message || (data.error as string) || "An error occurred",
					errors: data.errors || data.errorDetails || [],
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

	async googleAuth() {
		return this.request("/auth/google", {
			method: "GET",
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
			workflowType?: "AUTOMATED" | "CUSTOM";
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

	async inviteProjectMembers(
		projectId: number,
		members: Array<{ email: string; role: string }>
	) {
		return this.request(`/projects/${projectId}/invite`, {
			method: "POST",
			body: JSON.stringify({ members }),
		});
	}

	async getProjectMembers(projectId: number) {
		return this.request(`/projects/${projectId}/members`, {
			method: "GET",
		});
	}

	async acceptProjectInvitation(projectName: string, role: string) {
		return this.request(`/projects/accept-invitation`, {
			method: "POST",
			body: JSON.stringify({ projectName, role }),
		});
	}

	// Task endpoints
	async getTasksByProject(projectId: number) {
		return this.request(`/projects/${projectId}/tasks`, {
			method: "GET",
		});
	}

	async getTaskById(taskId: number) {
		return this.request(`/tasks/${taskId}`, {
			method: "GET",
		});
	}

	async createTask(
		projectId: number,
		data: {
			title: string;
			description?: string;
			status?: string;
			priority?: string;
			startDate?: string;
			endDate?: string;
			assigneeId?: number;
			tags?: string[];
			columnId?: string;
			color?: string;
			labelText?: string;
			labelColor?: string;
		}
	) {
		console.log("Creating task with data:", data);
		console.log("Project ID:", projectId);
		return this.request(`/projects/${projectId}/tasks`, {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateTask(
		taskId: number,
		data: {
			title?: string;
			description?: string;
			status?: string;
			priority?: string;
			startDate?: string;
			endDate?: string;
			assigneeId?: number; // Keep for backward compatibility
			assigneeIds?: number[]; // New multiple assignees field
			tags?: string[];
			columnId?: string;
			color?: string;
			labelText?: string;
			labelColor?: string;
		}
	) {
		return this.request(`/tasks/${taskId}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	// Fast column move for drag and drop operations
	async moveTaskToColumn(taskId: number, columnId: string) {
		return this.request(`/tasks/${taskId}/move`, {
			method: "PATCH",
			body: JSON.stringify({ columnId }),
		});
	}

	async deleteTask(taskId: number) {
		return this.request(`/tasks/${taskId}`, {
			method: "DELETE",
		});
	}

	async markTaskIncomplete(taskId: number) {
		return this.request(`/tasks/${taskId}/mark-incomplete`, {
			method: "POST",
		});
	}

	// Subtask API
	async getSubtasks(taskId: number) {
		return this.request(`/tasks/${taskId}/subtasks`, {
			method: "GET",
		});
	}

	async createSubtask(
		taskId: number,
		data: {
			title: string;
			order?: number;
		}
	) {
		return this.request(`/tasks/${taskId}/subtasks`, {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateSubtask(
		subtaskId: number,
		data: {
			title?: string;
			completed?: boolean;
			order?: number;
		}
	) {
		return this.request(`/subtasks/${subtaskId}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteSubtask(subtaskId: number) {
		return this.request(`/subtasks/${subtaskId}`, {
			method: "DELETE",
		});
	}

	// Custom Columns API
	async getCustomColumns(projectId: number) {
		return this.request(`/projects/${projectId}/columns`, {
			method: "GET",
		});
	}

	async createCustomColumn(
		projectId: number,
		data: {
			title: string;
			color?: string;
			order?: number;
		}
	) {
		return this.request(`/projects/${projectId}/columns`, {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateCustomColumn(
		columnId: number,
		data: {
			title?: string;
			color?: string;
			order?: number;
		}
	) {
		return this.request(`/columns/${columnId}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteCustomColumn(columnId: number) {
		return this.request(`/columns/${columnId}`, {
			method: "DELETE",
		});
	}

	// Conversation endpoints
	async getProjectConversations(projectId: number) {
		return this.request(`/projects/${projectId}/conversations`, {
			method: "GET",
		});
	}

	async getConversationById(conversationId: number) {
		return this.request(`/conversations/${conversationId}`, {
			method: "GET",
		});
	}

	async createConversation(data: {
		name?: string;
		type: "DIRECT" | "GROUP";
		projectId: number;
		memberIds: number[];
	}) {
		return this.request(`/conversations`, {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async getOrCreateDirectConversation(projectId: number, userId: number) {
		return this.request(`/conversations/direct`, {
			method: "POST",
			body: JSON.stringify({ projectId, userId }),
		});
	}

	async createProjectGroupChat(projectId: number, name: string) {
		return this.request(`/projects/${projectId}/conversations/group`, {
			method: "POST",
			body: JSON.stringify({ name }),
		});
	}

	async addConversationMember(conversationId: number, userId: number) {
		return this.request(`/conversations/${conversationId}/members`, {
			method: "POST",
			body: JSON.stringify({ userId }),
		});
	}

	async removeConversationMember(conversationId: number, userId: number) {
		return this.request(`/conversations/${conversationId}/members`, {
			method: "DELETE",
			body: JSON.stringify({ userId }),
		});
	}

	// Message endpoints
	async getConversationMessages(
		conversationId: number,
		limit?: number,
		before?: Date
	) {
		const params = new URLSearchParams();
		if (limit) params.append("limit", limit.toString());
		if (before) params.append("before", before.toISOString());

		return this.request(
			`/conversations/${conversationId}/messages?${params.toString()}`,
			{
				method: "GET",
			}
		);
	}

	async sendMessage(data: { conversationId: number; content: string }) {
		return this.request(`/messages`, {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateMessage(messageId: number, content: string) {
		return this.request(`/messages/${messageId}`, {
			method: "PUT",
			body: JSON.stringify({ content }),
		});
	}

	async deleteMessage(messageId: number) {
		return this.request(`/messages/${messageId}`, {
			method: "DELETE",
		});
	}

	// Activity methods
	async getProjectActivities(projectId: number, limit?: number) {
		const queryParams = limit ? `?limit=${limit}` : "";
		return this.request(`/projects/${projectId}/activity${queryParams}`, {
			method: "GET",
		});
	}

	// Comment methods
	async getTaskComments(taskId: number) {
		return this.request(`/tasks/${taskId}/comments`, {
			method: "GET",
		});
	}

	async createComment(taskId: number, content: string) {
		return this.request(`/tasks/${taskId}/comments`, {
			method: "POST",
			body: JSON.stringify({ content }),
		});
	}

	async updateComment(commentId: number, content: string) {
		return this.request(`/comments/${commentId}`, {
			method: "PUT",
			body: JSON.stringify({ content }),
		});
	}

	async deleteComment(commentId: number) {
		return this.request(`/comments/${commentId}`, {
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
	startDate?: string | null;
	endDate?: string | null;
	createdAt: string;
	updatedAt: string;
	owner?: {
		id: number;
		name: string;
		email: string;
		avatar?: string | null;
		username: string;
	};
	members?: Array<{
		id: number;
		role: string;
		joinedAt: string;
		user: {
			id: number;
			name: string;
			email: string;
			avatar?: string | null;
			username: string;
		};
	}>;
}

export interface ProjectResponse {
	projects?: Project[];
	project?: Project;
}

export interface Task {
	id: number;
	title: string;
	description?: string | null;
	status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED" | "BLOCKED";
	priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
	startDate?: string | null;
	endDate?: string | null;
	projectId: number;
	assigneeId?: number | null;
	tags: string[];
	columnId?: string | null;
	color?: string | null;
	labelText?: string | null;
	labelColor?: string | null;
	order: number;
	createdAt: string;
	updatedAt: string;
	assignee?: {
		id: number;
		name: string;
		email: string;
		avatar?: string | null;
	} | null;
	subtasks?: Subtask[];
}

export interface TaskResponse {
	tasks?: Task[];
	task?: Task;
}

export interface Subtask {
	id: number;
	title: string;
	completed: boolean;
	order: number;
	taskId: number;
	createdAt: string;
	updatedAt: string;
}

export interface SubtasksResponse {
	subtasks: Subtask[];
}

export interface CustomColumn {
	id: number;
	title: string;
	color: string;
	order: number;
	projectId: number;
	createdAt: string;
	updatedAt: string;
}

export interface CustomColumnsResponse {
	columns: CustomColumn[];
}

export interface Conversation {
	id: number;
	name: string | null;
	type: "DIRECT" | "GROUP";
	projectId: number;
	createdBy?: number;
	createdAt: string;
	updatedAt: string;
	members: Array<{
		id: number;
		name: string;
		username: string;
		email: string;
		avatar?: string | null;
	}>;
	lastMessage?: Message;
	unreadCount?: number;
}

export interface Message {
	id: number;
	content: string;
	senderId: number;
	conversationId: number;
	isEdited: boolean;
	createdAt: string;
	updatedAt: string;
	sender: {
		id: number;
		name: string;
		username: string;
		email: string;
		avatar?: string | null;
	};
}

export interface ConversationResponse {
	conversations?: Conversation[];
	conversation?: Conversation;
}

export interface MessagesResponse {
	messages?: Message[];
	messageData?: Message;
}
