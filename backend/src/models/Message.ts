// Message model interfaces

export interface Message {
  id: number;
  content: string;
  senderId: number;
  conversationId: number;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
}

export interface MessageWithSender extends Message {
  sender: {
    id: number;
    name: string;
    username: string;
    avatar?: string | null;
  };
}

export interface MessageCreateInput {
  content: string;
  senderId: number;
  conversationId: number;
}

export interface MessageUpdateInput {
  content: string;
}
