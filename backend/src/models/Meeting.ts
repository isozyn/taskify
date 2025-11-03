/**
 * Meeting model and types
 */

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  meetLink: string;
  createdBy: number;
  projectId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MeetingInvitation {
  id: string;
  meetingId: string;
  inviteeEmail: string;
  inviteeId?: number;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  sentAt: Date;
  respondedAt?: Date;
}

export interface CreateMeetingRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  invitees: Array<{
    email: string;
    userId?: number;
    name?: string;
  }>;
  projectId?: number;
}

export interface MeetingNotification {
  id: string;
  userId: number;
  meetingId: string;
  type: 'INVITATION' | 'REMINDER' | 'UPDATE' | 'CANCELLATION';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}