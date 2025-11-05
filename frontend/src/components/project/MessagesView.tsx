import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { api, type Conversation, type Message } from "@/lib/api";
import { socketService } from "@/lib/socket";
import { useUser } from "@/contexts/UserContext";
import {
	MessageSquare,
	Send,
	Smile,
	Paperclip,
	Search,
	Plus,
	MoreVertical,
	Phone,
	Video,
	Info,
	Hash,
	Check,
	CheckCheck,
	Loader2,
	Users,
	Layers,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Member {
	id: number;
	name: string;
	username: string;
	email: string;
	avatar?: string | null;
	role?: string;
}

interface Project {
	id: number;
	title: string;
	description?: string;
}

interface MessagesViewProps {
	projectMembers: Member[];
	project?: Project;
}

const MessagesView = ({ projectMembers, project }: MessagesViewProps) => {
	const { id: projectId } = useParams();
	const { user } = useUser();
	const { toast } = useToast();
	const scrollRef = useRef<HTMLDivElement>(null);

	const [selectedConversation, setSelectedConversation] =
		useState<Conversation | null>(null);
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [messages, setMessages] = useState<Message[]>([]);
	const [messageInput, setMessageInput] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [isCreatingConversation, setIsCreatingConversation] = useState(false);
	const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
	const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
	const [showNewConversationDialog, setShowNewConversationDialog] =
		useState(false);

	const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Initialize Socket.IO connection
	// Store selectedConversation and user in refs so callbacks always see the latest values
	const selectedConversationRef = useRef(selectedConversation);
	const userRef = useRef(user);
	
	useEffect(() => {
		selectedConversationRef.current = selectedConversation;
	}, [selectedConversation]);

	useEffect(() => {
		userRef.current = user;
	}, [user]);

	// Scroll to bottom helper
	const scrollToBottom = () => {
		requestAnimationFrame(() => {
			if (scrollRef.current) {
				scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
			}
		});
	};

	// Fetch conversations - defined early so we can use in callbacks
	const fetchConversationsInternal = useCallback(async () => {
		if (!projectId) return;

		try {
			const response: any = await api.getProjectConversations(
				parseInt(projectId)
			);
			setConversations(response || []);
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.message || "Failed to load conversations",
				variant: "destructive",
			});
		}
	}, [projectId, toast]);

	useEffect(() => {
		if (!socketService.isConnected()) {
			socketService.connect();
		}

		// Set up socket callbacks - using refs to always get latest values
		socketService.setCallbacks({
			onMessageNew: (message: Message) => {
				console.log('📨 Message received via Socket.IO:', message);
				console.log('Current conversation ID:', selectedConversationRef.current?.id);
				console.log('Current user ID:', userRef.current?.id);
				console.log('Message sender ID:', message.senderId);
				
				// Add message to UI if it's for the currently selected conversation
				// and not from current user (to avoid duplicates with optimistic update)
				if (
					message.conversationId === selectedConversationRef.current?.id &&
					message.senderId !== userRef.current?.id
				) {
					console.log('✅ Adding message to current conversation');
					setMessages((prev) => {
						// Check if message already exists
						if (prev.some((m) => m.id === message.id)) {
							console.log('⚠️ Message already exists, skipping');
							return prev;
						}
						return [...prev, message];
					});
					scrollToBottom();
				} else {
					console.log('⏭️ Message is for different conversation or from self');
				}

				// ALWAYS update conversation list to refresh unread counts and last message
				fetchConversationsInternal();
			},
			onMessageEdited: (message: Message) => {
				setMessages((prev) =>
					prev.map((m) => (m.id === message.id ? message : m))
				);
			},
			onMessageDeleted: (data: { messageId: number }) => {
				setMessages((prev) =>
					prev.filter((m) => m.id !== data.messageId)
				);
			},
			onUserTyping: (data: {
				userId: number;
				conversationId: number;
			}) => {
				if (
					data.conversationId === selectedConversationRef.current?.id &&
					data.userId !== userRef.current?.id
				) {
					setTypingUsers((prev) =>
						new Set(prev).add(data.userId)
					);
				}
			},
			onUserStopped: (data: {
				userId: number;
				conversationId: number;
			}) => {
				if (data.conversationId === selectedConversationRef.current?.id) {
					setTypingUsers((prev) => {
						const newSet = new Set(prev);
						newSet.delete(data.userId);
						return newSet;
					});
				}
			},
			onError: (error: { message: string }) => {
				toast({
					title: "Connection Error",
					description: error.message,
					variant: "destructive",
				});
			},
		});

		if (projectId) {
			socketService.joinProject(parseInt(projectId));
		}

		return () => {
			if (projectId) {
				socketService.leaveProject(parseInt(projectId));
			}
		};
	}, [projectId, toast, fetchConversationsInternal]);

	// Alias for internal function
	const fetchConversations = fetchConversationsInternal;

	// Fetch messages for selected conversation (memoized)
	const fetchMessages = useCallback(
		async (conversationId: number) => {
			try {
				// Clear messages immediately for instant feedback
				setMessages([]);

				// Join conversation room first
				socketService.joinConversation(conversationId);

				// Fetch messages in parallel with marking as read
				const [response] = await Promise.all([
					api.getConversationMessages(conversationId, 50),
					socketService.markConversationAsRead(conversationId),
				]);

				setMessages((response as Message[]) || []);
				scrollToBottom();
			} catch (error: any) {
				toast({
					title: "Error",
					description: error.message || "Failed to load messages",
					variant: "destructive",
				});
			}
		},
		[toast]
	);

	// Load conversations on mount - OPTIMIZED (no loading spinner)
	useEffect(() => {
		fetchConversations();
	}, [fetchConversations]);

	// Load messages when conversation is selected
	useEffect(() => {
		if (selectedConversation) {
			fetchMessages(selectedConversation.id);
		}

		return () => {
			if (selectedConversation) {
				socketService.leaveConversation(selectedConversation.id);
			}
		};
	}, [selectedConversation?.id]);

	// Handle send message
	const handleSendMessage = async () => {
		if (!messageInput.trim() || !selectedConversation) return;

		const content = messageInput.trim();
		const tempId = Date.now(); // Temporary ID for optimistic update

		// Clear input immediately for instant feedback
		setMessageInput("");

		// Stop typing indicator
		socketService.stopTyping(selectedConversation.id);

		// Optimistic update - add message immediately to UI
		const optimisticMessage: Message = {
			id: tempId,
			content,
			conversationId: selectedConversation.id,
			senderId: user!.id,
			sender: {
				id: user!.id,
				name: user!.name || "You",
				username: user!.username || "",
				email: user!.email,
			},
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			isEdited: false,
		};

		setMessages((prev) => [...prev, optimisticMessage]);
		scrollToBottom();

		try {
			// Send ONLY via REST API - backend will handle Socket.IO broadcast
			const response: any = await api.sendMessage({
				conversationId: selectedConversation.id,
				content,
			});

			// Replace optimistic message with real one from server
			setMessages((prev) =>
				prev.map((m) => (m.id === tempId ? response : m))
			);
		} catch (error: any) {
			// Remove optimistic message on error
			setMessages((prev) => prev.filter((m) => m.id !== tempId));

			toast({
				title: "Error",
				description: error.message || "Failed to send message",
				variant: "destructive",
			});
			setMessageInput(content); // Restore message on error
		}
	};

	// Handle key press
	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	// Handle typing indicator (debounced)
	const handleTyping = useCallback(() => {
		if (!selectedConversation) return;

		socketService.startTyping(selectedConversation.id);

		// Clear existing timeout
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
		}

		// Stop typing after 1 second of no input (reduced from 2 seconds)
		typingTimeoutRef.current = setTimeout(() => {
			socketService.stopTyping(selectedConversation.id);
		}, 1000);
	}, [selectedConversation]);

	// Create new conversation (Direct message only)
	const handleCreateConversation = async () => {
		if (
			!projectId ||
			selectedMembers.length !== 1 ||
			isCreatingConversation
		)
			return;

		setIsCreatingConversation(true);

		try {
			// Check if conversation already exists with this member
			const existingConv = conversations.find(
				(conv) =>
					conv.type === "DIRECT" &&
					conv.members.some((m) => m.id === selectedMembers[0])
			);

			if (existingConv) {
				// Just select the existing conversation
				setSelectedConversation(existingConv);
				setShowNewConversationDialog(false);
				setSelectedMembers([]);
				toast({
					title: "Conversation exists",
					description: "Opening existing conversation",
				});
				return;
			}

			// Create new direct message conversation
			const response: any = await api.createConversation({
				name: undefined, // Direct messages don't need names
				type: "DIRECT",
				projectId: parseInt(projectId),
				memberIds: [selectedMembers[0], user!.id],
			});

			toast({
				title: "Success",
				description: "Direct message started",
			});

			setShowNewConversationDialog(false);
			setSelectedMembers([]);
			fetchConversations();
			setSelectedConversation(response);
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.message || "Failed to create conversation",
				variant: "destructive",
			});
		} finally {
			setIsCreatingConversation(false);
		}
	};

	// Get initials from name
	const getInitials = (name?: string | null) => {
		if (!name) return "??";
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	// Format time
	const formatTime = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

		if (diffInHours < 24) {
			return date.toLocaleTimeString("en-US", {
				hour: "numeric",
				minute: "2-digit",
			});
		} else if (diffInHours < 48) {
			return "Yesterday";
		} else {
			return date.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			});
		}
	};

	// Filter conversations by search (only direct messages) - Memoized for performance
	const filteredConversations = useMemo(() => {
		return conversations.filter((conv) => {
			// Only show DIRECT conversations
			if (conv.type !== "DIRECT") return false;

			// Search by member name in direct conversations
			if (searchQuery) {
				const otherMember = conv.members.find((m) => m.id !== user?.id);
				const memberName = otherMember?.name || conv.name || "";
				return memberName
					.toLowerCase()
					.includes(searchQuery.toLowerCase());
			}

			return true;
		});
	}, [conversations, searchQuery, user?.id]);

	// Get typing indicator text
	const getTypingText = () => {
		if (typingUsers.size === 0) return null;

		const typingMembers =
			selectedConversation?.members.filter((m) =>
				typingUsers.has(m.id)
			) || [];

		if (typingMembers.length === 1) {
			return `${typingMembers[0].name} is typing...`;
		} else if (typingMembers.length === 2) {
			return `${typingMembers[0].name} and ${typingMembers[1].name} are typing...`;
		} else if (typingMembers.length > 2) {
			return `${typingMembers.length} people are typing...`;
		}
		return null;
	};

	return (
		<div className="flex h-[calc(100vh-180px)] bg-white rounded-lg overflow-hidden border border-slate-200">
			{/* Left Sidebar - Team Members List */}
			<div className="w-80 flex flex-col border-r border-slate-200 bg-white">
				{/* Header */}
				<div className="p-4 border-b border-slate-200">
					<h2 className="text-xl font-semibold text-slate-900">
						Chats
					</h2>
				</div>

				{/* Search */}
				<div className="p-3 border-b border-slate-200">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
						<Input
							placeholder="Search or start a new chat"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9 h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
						/>
					</div>
				</div>

				{/* Team Members & Conversations List */}
				<ScrollArea className="flex-1">
					<div className="py-2">
						{/* Team Members Section */}
						{projectMembers &&
							projectMembers.filter((m) => m.id !== user?.id)
								.length > 0 && (
								<div className="mb-2">
									<div className="px-4 py-2">
										<h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
											Team Members
										</h3>
									</div>
									{projectMembers
										.filter((m) => m.id !== user?.id)
										.map((member) => {
											// Check if conversation already exists with this member
											const existingConversation =
												conversations.find(
													(conv) =>
														conv.type ===
															"DIRECT" &&
														conv.members.some(
															(m) =>
																m.id ===
																member.id
														)
												);

											// Get unread count for this member's conversation
											const unreadCount = existingConversation?.unreadCount || 0;

											return (
												<button
													key={member.id}
													onClick={async () => {
														if (
															existingConversation
														) {
															// Instantly switch to existing conversation
															setSelectedConversation(
																existingConversation
															);
														} else {
															// Create new conversation - NO OPTIMISTIC UPDATE
															try {
																setIsCreatingConversation(
																	true
																);

																// Create conversation and wait for response
																const response: any =
																	await api.createConversation(
																		{
																			name: undefined,
																			type: "DIRECT",
																			projectId:
																				parseInt(
																					projectId!
																				),
																			memberIds:
																				[
																					member.id,
																					user!
																						.id,
																				],
																		}
																	);

																// Set the real conversation with valid ID
																setSelectedConversation(
																	response
																);

																// Add to conversations list
																setConversations(prev => [...prev, response]);
															} catch (error: any) {
																toast({
																	title: "Error",
																	description:
																		error.message ||
																		"Failed to start conversation",
																	variant:
																		"destructive",
																});
															} finally {
																setIsCreatingConversation(
																	false
																);
															}
														}
													}}
													className="w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 relative"
												>
													<div className="flex items-center gap-3">
														<div className="relative">
															<Avatar className="w-12 h-12">
																<AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white font-medium">
																	{getInitials(
																		member.name
																	)}
																</AvatarFallback>
															</Avatar>
															{/* Unread badge - WhatsApp style */}
															{unreadCount > 0 && (
																<div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-lg">
																	{unreadCount > 99 ? '99+' : unreadCount}
																</div>
															)}
														</div>
														<div className="flex-1 min-w-0">
															<h3 className="font-medium text-sm text-slate-900 truncate">
																{member.name}
															</h3>
															<p className="text-xs text-slate-500 truncate">
																{existingConversation?.lastMessage?.content || 'Click to message'}
															</p>
														</div>
													</div>
												</button>
											);
										})}
								</div>
							)}

						

						{/* Empty State */}
						{projectMembers.filter((m) => m.id !== user?.id)
							.length === 0 &&
							filteredConversations.length === 0 && (
								<div className="text-center py-8 text-slate-500">
									<Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
									<p className="text-sm">
										No team members yet
									</p>
									<p className="text-xs mt-1">
										Invite team members to start messaging
									</p>
								</div>
							)}
					</div>
				</ScrollArea>
			</div>

			{/* Main Chat Area */}
			{isCreatingConversation ? (
				<div className="flex-1 flex items-center justify-center bg-slate-50">
					<div className="text-center">
						<Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
						<p className="text-sm text-slate-600">Starting conversation...</p>
					</div>
				</div>
			) : selectedConversation ? (
				<div className="flex-1 flex flex-col bg-slate-50">
					{/* Chat Header */}
					<div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
						<div className="flex items-center gap-3">
							{(() => {
								const isDirect =
									selectedConversation.type === "DIRECT";
								const otherMember = isDirect
									? selectedConversation.members.find(
											(m) => m.id !== user?.id
									  )
									: null;
								const displayName =
									isDirect && otherMember
										? otherMember.name
										: selectedConversation.name ||
										  "Conversation";

								return (
									<>
										{isDirect ? (
											<Avatar className="w-10 h-10">
												<AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium">
													{getInitials(displayName)}
												</AvatarFallback>
											</Avatar>
										) : (
											<div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
												<Hash className="w-5 h-5 text-white" />
											</div>
										)}
										<div>
											<h2 className="font-semibold text-base text-slate-900">
												{displayName}
											</h2>
											<p className="text-xs text-slate-500">
												{isDirect
													? "Active now"
													: `${selectedConversation.members.length} members`}
											</p>
										</div>
									</>
								);
							})()}
						</div>

						{/* Header Actions */}
						<div className="flex items-center gap-1">
							<Button
								variant="ghost"
								size="sm"
								className="hover:bg-slate-100 text-slate-600 h-9 w-9 p-0"
							>
								<Search className="w-4 h-4" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="hover:bg-slate-100 text-slate-600 h-9 w-9 p-0"
							>
								<MoreVertical className="w-4 h-4" />
							</Button>
						</div>
					</div>

					{/* Messages Area */}
					<ScrollArea className="flex-1" ref={scrollRef}>
						<div className="p-4 space-y-4">
							{messages.length === 0 ? (
								<div className="text-center py-12 text-slate-500">
									<MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
									<p className="text-sm">No messages yet</p>
									<p className="text-xs mt-1">
										Start the conversation!
									</p>
								</div>
							) : (
								messages.map((message, index) => {
									const isOwnMessage =
										message.sender.id === user?.id;
									const showAvatar =
										index === 0 ||
										messages[index - 1].sender.id !==
											message.sender.id;

									return (
										<div
											key={message.id}
											className={`flex gap-3 ${
												isOwnMessage
													? "flex-row-reverse"
													: "flex-row"
											}`}
										>
											{/* Avatar */}
											<div className="flex-shrink-0">
												{showAvatar ? (
													<Avatar className="w-8 h-8">
														<AvatarFallback
															className={`${
																isOwnMessage
																	? "bg-gradient-to-br from-green-500 to-green-600"
																	: "bg-gradient-to-br from-blue-500 to-blue-600"
															} text-white text-xs font-medium`}
														>
															{getInitials(
																message.sender
																	.name
															)}
														</AvatarFallback>
													</Avatar>
												) : (
													<div className="w-8 h-8" />
												)}
											</div>

											{/* Message Content */}
											<div
												className={`flex-1 max-w-[70%] ${
													isOwnMessage
														? "items-end"
														: "items-start"
												}`}
											>
												{showAvatar && (
													<div
														className={`flex items-center gap-2 mb-1 ${
															isOwnMessage
																? "justify-end"
																: "justify-start"
														}`}
													>
														<span className="text-sm font-medium text-slate-900">
															{isOwnMessage
																? "You"
																: message.sender
																		.name}
														</span>
														<span className="text-xs text-slate-500">
															{formatTime(
																message.createdAt
															)}
														</span>
													</div>
												)}
												<div
													className={`px-3 py-2 rounded-lg ${
														isOwnMessage
															? "bg-green-500 text-white rounded-br-none"
															: "bg-white text-slate-900 rounded-bl-none shadow-sm"
													}`}
												>
													<p className="text-sm leading-relaxed whitespace-pre-wrap">
														{message.content}
													</p>
													{isOwnMessage && (
														<div className="flex items-center justify-end gap-1 mt-1">
															<CheckCheck className="w-3.5 h-3.5 text-green-100" />
														</div>
													)}
												</div>
												{message.isEdited && (
													<span className="text-xs text-slate-400 mt-1 block">
														Edited
													</span>
												)}
											</div>
										</div>
									);
								})
							)}

							{/* Typing Indicator */}
							{getTypingText() && (
								<div className="flex gap-3">
									<div className="w-8 h-8" />
									<div className="text-sm text-slate-500 italic">
										{getTypingText()}
									</div>
								</div>
							)}
						</div>
					</ScrollArea>

					{/* Message Input */}
					<div className="px-6 py-4 bg-white border-t border-slate-200">
						<div className="flex items-center gap-3">
							<Button
								variant="ghost"
								size="sm"
								className="hover:bg-slate-100 text-slate-600 h-10 w-10 p-0 flex-shrink-0 rounded-full"
							>
								<Paperclip className="w-5 h-5" />
							</Button>

							<div className="flex-1 relative">
								<Input
									placeholder="Type a message"
									value={messageInput}
									onChange={(e) => {
										setMessageInput(e.target.value);
										handleTyping();
									}}
									onKeyPress={handleKeyPress}
									className="h-11 rounded-full bg-slate-100 border-slate-100 focus:bg-white focus:border-slate-300"
								/>
							</div>

							<Button
								onClick={handleSendMessage}
								disabled={!messageInput.trim()}
								className="bg-green-500 hover:bg-green-600 h-10 w-10 p-0 flex-shrink-0 rounded-full"
							>
								<Send className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</div>
			) : (
				// Empty State
				<div className="flex-1 flex items-center justify-center bg-slate-50">
					<div className="text-center">
						<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
							<MessageSquare className="w-8 h-8 text-blue-600" />
						</div>
						<h3 className="text-lg font-semibold text-slate-900 mb-2">
							Select a conversation
						</h3>
						<p className="text-sm text-slate-500">
							Choose a conversation from the list to start
							messaging
						</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default MessagesView;
