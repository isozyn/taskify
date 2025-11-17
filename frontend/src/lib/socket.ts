// Socket.IO client service for real-time messaging

import { io, Socket } from "socket.io-client";
import type { Message } from "./api";

const SOCKET_URL =
	import.meta.env.VITE_API_URL?.replace("/api/v1", "") ||
	"http://localhost:5000";

interface SocketCallbacks {
	onMessageNew?: (message: Message) => void;
	onMessageEdited?: (message: Message) => void;
	onMessageDeleted?: (data: { messageId: number }) => void;
	onUserTyping?: (data: { userId: number; conversationId: number }) => void;
	onUserStopped?: (data: { userId: number; conversationId: number }) => void;
	onConversationCreated?: (data: {
		conversation: any;
		shouldJoin: boolean;
	}) => void;
	onError?: (error: { message: string }) => void;
}

class SocketService {
	private socket: Socket | null = null;
	private callbacks: SocketCallbacks = {};
	private connectionPromise: Promise<void> | null = null;
	private pendingJoins: { type: "project" | "conversation"; id: number }[] =
		[];

	/**
	 * Initialize socket connection with authentication from cookies or localStorage
	 */
	connect(): Promise<void> {
		if (this.socket?.connected) {
			return Promise.resolve();
		}

		if (this.connectionPromise) {
			return this.connectionPromise;
		}

		this.connectionPromise = new Promise((resolve, reject) => {
			// Get token from localStorage as fallback for cross-origin
			const accessToken = localStorage.getItem("accessToken");

			this.socket = io(SOCKET_URL, {
				withCredentials: true, // Send cookies with requests (includes accessToken cookie)
				auth: {
					token: accessToken, // Also send token from localStorage
				},
				transports: ["websocket", "polling"],
				reconnection: true,
				reconnectionDelay: 1000,
				reconnectionAttempts: 5,
			});

			this.setupEventListeners();

			this.socket.on("connect", () => {
				this.connectionPromise = null;

				// Process any pending joins
				while (this.pendingJoins.length > 0) {
					const join = this.pendingJoins.shift();
					if (join?.type === "project") {
						this.joinProject(join.id);
					} else if (join?.type === "conversation") {
						this.joinConversation(join.id);
					}
				}

				resolve();
			});

			this.socket.on("connect_error", (error) => {
				this.connectionPromise = null;
				reject(error);
			});
		});

		return this.connectionPromise;
	}

	/**
	 * Disconnect socket
	 */
	disconnect(): void {
		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
		}
	}

	/**
	 * Check if socket is connected
	 */
	isConnected(): boolean {
		return this.socket?.connected || false;
	}

	/**
	 * Setup event listeners
	 */
	private setupEventListeners(): void {
		if (!this.socket) return;

		this.socket.on("connect", () => {});

		this.socket.on("disconnect", (reason) => {});

		this.socket.on("error", (error) => {
			this.callbacks.onError?.(error);
		});

		this.socket.on("message:new", (message: Message) => {
			this.callbacks.onMessageNew?.(message);
		});

		this.socket.on("message:edited", (message: Message) => {
			this.callbacks.onMessageEdited?.(message);
		});

		this.socket.on("message:deleted", (data: { messageId: number }) => {
			this.callbacks.onMessageDeleted?.(data);
		});

		this.socket.on(
			"typing:user_typing",
			(data: { userId: number; conversationId: number }) => {
				this.callbacks.onUserTyping?.(data);
			}
		);

		this.socket.on(
			"typing:user_stopped",
			(data: { userId: number; conversationId: number }) => {
				this.callbacks.onUserStopped?.(data);
			}
		);

		this.socket.on(
			"conversation:created",
			(data: { conversation: any; shouldJoin: boolean }) => {
				this.callbacks.onConversationCreated?.(data);

				// Auto-join the conversation room if instructed
				if (data.shouldJoin && data.conversation?.id) {
					this.joinConversation(data.conversation.id);
				}
			}
		);

		this.socket.on("connect_error", (error) => {
			this.callbacks.onError?.({ message: error.message });
		});
	}

	/**
	 * Set callbacks for socket events
	 */
	setCallbacks(callbacks: SocketCallbacks): void {
		this.callbacks = { ...this.callbacks, ...callbacks };
	}

	/**
	 * Join a project room
	 */
	joinProject(projectId: number): void {
		if (!this.socket?.connected) {
			this.pendingJoins.push({ type: "project", id: projectId });
			return;
		}
		this.socket.emit("project:join", projectId);
	}

	/**
	 * Leave a project room
	 */
	leaveProject(projectId: number): void {
		if (!this.socket?.connected) return;
		this.socket.emit("project:leave", projectId);
	}

	/**
	 * Join a conversation room
	 */
	joinConversation(conversationId: number): void {
		if (!this.socket?.connected) {
			this.pendingJoins.push({
				type: "conversation",
				id: conversationId,
			});
			return;
		}
		this.socket.emit("conversation:join", conversationId);
	}

	/**
	 * Leave a conversation room
	 */
	leaveConversation(conversationId: number): void {
		if (!this.socket?.connected) return;
		this.socket.emit("conversation:leave", conversationId);
	}

	/**
	 * Send a message via socket
	 */
	sendMessage(conversationId: number, content: string): void {
		if (!this.socket?.connected) {
			return;
		}
		this.socket.emit("message:send", { conversationId, content });
	}

	/**
	 * Edit a message
	 */
	editMessage(messageId: number, content: string): void {
		if (!this.socket?.connected) {
			return;
		}
		this.socket.emit("message:edit", { messageId, content });
	}

	/**
	 * Delete a message
	 */
	deleteMessage(messageId: number): void {
		if (!this.socket?.connected) {
			return;
		}
		this.socket.emit("message:delete", messageId);
	}

	/**
	 * Mark conversation as read
	 */
	markConversationAsRead(conversationId: number): void {
		if (!this.socket?.connected) return;
		this.socket.emit("conversation:mark_read", conversationId);
	}

	/**
	 * Send typing indicator
	 */
	startTyping(conversationId: number): void {
		if (!this.socket?.connected) return;
		this.socket.emit("typing:start", conversationId);
	}

	/**
	 * Stop typing indicator
	 */
	stopTyping(conversationId: number): void {
		if (!this.socket?.connected) return;
		this.socket.emit("typing:stop", conversationId);
	}
}

// Export singleton instance
export const socketService = new SocketService();
