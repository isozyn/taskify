// Conversation model interfaces

export interface Conversation {
  id: number;
  name?: string | null;
  type: 'PROJECT' | 'DIRECT' | 'GROUP';
  projectId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationWithDetails extends Conversation {
  members: ConversationMember[];
  messages?: any[];
  unreadCount?: number;
}

export interface ConversationMember {
  id: number;
  userId: number;
  conversationId: number;
  joinedAt: Date;
  lastReadAt?: Date | null;
  user?: {
    id: number;
    name: string;
    username: string;
    avatar?: string | null;
  };
}

export interface ConversationCreateInput {
  name?: string;
  type: 'PROJECT' | 'DIRECT' | 'GROUP';
  projectId: number;
  memberIds: number[];
}
