/**
 * Meeting service for handling meeting creation, invitations, and notifications
 */

import { v4 as uuidv4 } from 'uuid';
import * as emailService from './emailService';
import * as notificationService from './notificationService';
import { CreateMeetingRequest, Meeting, MeetingInvitation } from '../models/Meeting';

// In-memory storage for demo (replace with database in production)
const meetings: Meeting[] = [];
const invitations: MeetingInvitation[] = [];

/**
 * Generate Google Meet link
 */
const generateMeetLink = (): string => {
  const meetingId = Math.random().toString(36).substring(2, 15);
  return `https://meet.google.com/${meetingId}`;
};

/**
 * Create a new meeting with invitations
 */
export const createMeeting = async (
  creatorId: number,
  meetingData: CreateMeetingRequest
): Promise<{ meeting: Meeting; invitations: MeetingInvitation[] }> => {
  try {
    // Create meeting
    const meeting: Meeting = {
      id: uuidv4(),
      title: meetingData.title,
      description: meetingData.description,
      startTime: new Date(meetingData.startTime),
      endTime: new Date(meetingData.endTime),
      meetLink: generateMeetLink(),
      createdBy: creatorId,
      projectId: meetingData.projectId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    meetings.push(meeting);

    // Create invitations
    const meetingInvitations: MeetingInvitation[] = [];
    
    for (const invitee of meetingData.invitees) {
      const invitation: MeetingInvitation = {
        id: uuidv4(),
        meetingId: meeting.id,
        inviteeEmail: invitee.email,
        inviteeId: invitee.userId,
        status: 'PENDING',
        sentAt: new Date()
      };

      invitations.push(invitation);
      meetingInvitations.push(invitation);

      // Send email invitation
      await sendMeetingInvitation(meeting, invitation, invitee.name);

      // Send in-app notification if user exists
      if (invitee.userId) {
        await notificationService.createNotification({
          userId: invitee.userId,
          type: 'MEETING_INVITATION',
          title: `Meeting Invitation: ${meeting.title}`,
          message: `You've been invited to a meeting "${meeting.title}" scheduled for ${meeting.startTime.toLocaleString()}`,
          data: {
            meetingId: meeting.id,
            meetLink: meeting.meetLink,
            startTime: meeting.startTime,
            endTime: meeting.endTime
          }
        });
      }
    }

    return { meeting, invitations: meetingInvitations };
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw new Error('Failed to create meeting');
  }
};

/**
 * Send meeting invitation email
 */
const sendMeetingInvitation = async (
  meeting: Meeting,
  invitation: MeetingInvitation,
  inviteeName?: string
): Promise<void> => {
  try {
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📅 Meeting Invitation</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333; margin-top: 0;">${meeting.title}</h2>
          
          ${meeting.description ? `<p style="color: #666; font-size: 16px; line-height: 1.5;">${meeting.description}</p>` : ''}
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">📋 Meeting Details</h3>
            <p style="margin: 8px 0;"><strong>📅 Date:</strong> ${meeting.startTime.toLocaleDateString()}</p>
            <p style="margin: 8px 0;"><strong>🕐 Time:</strong> ${meeting.startTime.toLocaleTimeString()} - ${meeting.endTime.toLocaleTimeString()}</p>
            <p style="margin: 8px 0;"><strong>⏱️ Duration:</strong> ${Math.round((meeting.endTime.getTime() - meeting.startTime.getTime()) / (1000 * 60))} minutes</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${meeting.meetLink}" 
               style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 16px;">
              🎥 Join Google Meet
            </a>
          </div>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #1976d2; font-size: 14px;">
              <strong>💡 Tip:</strong> Click the link above or copy this URL to your browser: <br>
              <code style="background: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${meeting.meetLink}</code>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              This invitation was sent from Taskify Project Management
            </p>
          </div>
        </div>
      </div>
    `;

    await emailService.sendEmail({
      to: invitation.inviteeEmail,
      subject: `📅 Meeting Invitation: ${meeting.title}`,
      html: emailContent
    });

    console.log(`Meeting invitation sent to ${invitation.inviteeEmail}`);
  } catch (error) {
    console.error('Error sending meeting invitation:', error);
    // Don't throw error - meeting should still be created even if email fails
  }
};

/**
 * Get meetings for a user
 */
export const getUserMeetings = async (userId: number): Promise<Meeting[]> => {
  // Get meetings where user is creator or invitee
  const userInvitations = invitations.filter(inv => inv.inviteeId === userId);
  const invitedMeetingIds = userInvitations.map(inv => inv.meetingId);
  
  return meetings.filter(meeting => 
    meeting.createdBy === userId || invitedMeetingIds.includes(meeting.id)
  );
};

/**
 * Get meeting by ID
 */
export const getMeetingById = async (meetingId: string): Promise<Meeting | null> => {
  return meetings.find(meeting => meeting.id === meetingId) || null;
};

/**
 * Update invitation status
 */
export const updateInvitationStatus = async (
  invitationId: string,
  status: 'ACCEPTED' | 'DECLINED'
): Promise<MeetingInvitation | null> => {
  const invitation = invitations.find(inv => inv.id === invitationId);
  if (!invitation) return null;

  invitation.status = status;
  invitation.respondedAt = new Date();

  return invitation;
};

/**
 * Get invitations for a meeting
 */
export const getMeetingInvitations = async (meetingId: string): Promise<MeetingInvitation[]> => {
  return invitations.filter(inv => inv.meetingId === meetingId);
};