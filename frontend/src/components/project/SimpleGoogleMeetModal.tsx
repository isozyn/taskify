/**
 * Enhanced Google Meet Modal Component with Team Invitations
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getAuthToken, isAuthenticated } from '../../utils/auth';
import { Badge } from '@/components/ui/badge';
import {
  Video,
  Copy,
  ExternalLink,
  CheckCircle,
  Users,
  Plus,
  X,
  Mail,
  UserPlus
} from 'lucide-react';

interface SimpleGoogleMeetModalProps {
  open: boolean;
  onClose: () => void;
  selectedDate?: Date;
  onMeetingCreated?: (meeting: any) => void;
  projectMembers?: Array<{
    id: number;
    name: string;
    email: string;
    avatar?: string;
  }>;
}

interface Invitee {
  email: string;
  name?: string;
  userId?: number;
  isTeamMember: boolean;
}

const SimpleGoogleMeetModal: React.FC<SimpleGoogleMeetModalProps> = ({
  open,
  onClose,
  selectedDate,
  onMeetingCreated,
  projectMembers = []
}) => {
  console.log('SimpleGoogleMeetModal rendered:', { open, selectedDate });
  const [isLoading, setIsLoading] = useState(false);
  const [meetingCreated, setMeetingCreated] = useState(false);
  const [meetLink, setMeetLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [newInviteeEmail, setNewInviteeEmail] = useState('');
  const [showTeamMembers, setShowTeamMembers] = useState(false);

  // Initialize form with selected date
  React.useEffect(() => {
    if (selectedDate && open) {
      const date = selectedDate.toISOString().split('T')[0];
      const currentTime = new Date().toTimeString().slice(0, 5);
      const endDateTime = new Date(selectedDate);
      endDateTime.setHours(endDateTime.getHours() + 1);

      setStartTime(`${date}T${currentTime}`);
      setEndTime(`${date}T${endDateTime.toTimeString().slice(0, 5)}`);
      setTitle('');
      setDescription('');
      setInvitees([]);
      setMeetingCreated(false);
      setMeetLink('');
      setShowTeamMembers(false);
    }
  }, [selectedDate, open]);

  // Add team member as invitee
  const addTeamMember = (member: any) => {
    // Validate member has email
    if (!member.email || typeof member.email !== 'string' || !member.email.includes('@')) {
      alert(`Cannot invite ${member.name || 'team member'}: No valid email address`);
      return;
    }

    const isAlreadyInvited = invitees.some(inv => inv.email === member.email);
    if (isAlreadyInvited) return;

    const newInvitee: Invitee = {
      email: member.email,
      name: member.name,
      userId: member.id,
      isTeamMember: true
    };

    setInvitees(prev => [...prev, newInvitee]);
  };

  // Add external invitee by email
  const addExternalInvitee = () => {
    if (!newInviteeEmail.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newInviteeEmail.trim())) {
      alert('Please enter a valid email address');
      return;
    }

    const isAlreadyInvited = invitees.some(inv => inv.email === newInviteeEmail.trim());
    if (isAlreadyInvited) {
      alert('This email is already invited');
      return;
    }

    const newInvitee: Invitee = {
      email: newInviteeEmail.trim(),
      isTeamMember: false
    };

    setInvitees(prev => [...prev, newInvitee]);
    setNewInviteeEmail('');
  };

  // Remove invitee
  const removeInvitee = (email: string) => {
    setInvitees(prev => prev.filter(inv => inv.email !== email));
  };

  const handleCreateMeeting = async () => {
    // Frontend validation
    if (!title.trim() || !startTime || !endTime) {
      alert('Please fill in all required fields');
      return;
    }

    if (title.trim().length > 200) {
      alert('Title must not exceed 200 characters');
      return;
    }

    if (description.trim().length > 1000) {
      alert('Description must not exceed 1000 characters');
      return;
    }

    if (invitees.length === 0) {
      alert('Please add at least one invitee');
      return;
    }

    // Validate and filter invitees
    const validInvitees = invitees.filter(invitee => {
      if (!invitee.email || typeof invitee.email !== 'string') {
        console.warn('Removing invitee with invalid email:', invitee);
        return false;
      }
      if (!invitee.email.includes('@')) {
        console.warn('Removing invitee with invalid email format:', invitee.email);
        return false;
      }
      return true;
    });

    if (validInvitees.length === 0) {
      alert('Please add at least one invitee with a valid email address');
      return;
    }

    if (validInvitees.length !== invitees.length) {
      alert(`Removed ${invitees.length - validInvitees.length} invitee(s) with invalid email addresses. Proceeding with ${validInvitees.length} valid invitee(s).`);
    }

    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      alert('Invalid date format');
      return;
    }

    if (start >= end) {
      alert('End time must be after start time');
      return;
    }

    setIsLoading(true);

    try {
      // Check authentication first
      if (!isAuthenticated()) {
        throw new Error('You must be logged in to create meetings. Please log in and try again.');
      }

      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Prepare meeting data for API using valid invitees
      const meetingData = {
        title: title.trim(),
        description: description.trim(),
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        invitees: validInvitees.map(inv => ({
          email: inv.email,
          name: inv.name || undefined, // Don't send empty strings
          userId: inv.userId || undefined // Don't send undefined as number
        }))
      };

      console.log('Creating meeting with authenticated user');
      console.log('API URL:', `${import.meta.env.VITE_API_URL}/meetings`);
      console.log('Meeting data:', JSON.stringify(meetingData, null, 2));
      console.log('Raw form data:', { title, description, startTime, endTime, invitees });

      // Call backend API to create meeting and send invitations
      const response = await fetch(`${import.meta.env.VITE_API_URL}/meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(meetingData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        let errorMessage = 'Failed to create meeting';
        try {
          const errorData = JSON.parse(errorText);
          console.error('Parsed error data:', errorData);
          
          if (errorData.errors && Array.isArray(errorData.errors)) {
            // Show detailed validation errors
            const validationErrors = errorData.errors.map((err: any) => 
              `${err.path || err.param}: ${err.msg}`
            ).join(', ');
            errorMessage = `Validation failed: ${validationErrors}`;
          } else {
            errorMessage = errorData.message || errorMessage;
          }
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${errorText || response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();

      setMeetLink(result.meeting.meetLink);
      setMeetingCreated(true);

      // Notify parent component
      if (onMeetingCreated) {
        onMeetingCreated({
          id: result.meeting.id,
          title: result.meeting.title,
          description: result.meeting.description,
          start: result.meeting.startTime,
          end: result.meeting.endTime,
          meetLink: result.meeting.meetLink,
          type: 'meeting',
          invitees: invitees
        });
      }

      // Show success message
      console.log(`Meeting created successfully! Invitations sent to ${result.invitationsSent} people.`);
      
      // Optionally open meeting notes
      if (window.confirm('Meeting created! Would you like to open meeting notes?')) {
        // You can implement navigation to meeting notes here
        console.log('Opening meeting notes for:', result.meeting.id);
      }

    } catch (error) {
      console.error('Error creating meeting:', error);
      alert(error instanceof Error ? error.message : 'Failed to create meeting. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(meetLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const handleJoinMeeting = () => {
    window.open(meetLink, '_blank', 'noopener,noreferrer');
  };

  const handleClose = () => {
    setMeetingCreated(false);
    setMeetLink('');
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white border shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-600" />
            {meetingCreated ? 'Meeting Created!' : 'Create Google Meet'}
          </DialogTitle>
        </DialogHeader>

        {!meetingCreated ? (
          <div className="space-y-4">
            {/* Meeting Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Meeting Title *</Label>
              <Input
                id="title"
                placeholder="Enter meeting title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Meeting agenda or description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            {/* Invitees Section */}
            <div className="space-y-3">
              <Label>Invite People *</Label>

              {/* Team Members */}
              {projectMembers.length > 0 && (
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTeamMembers(!showTeamMembers)}
                    className="w-full justify-start"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {showTeamMembers ? 'Hide' : 'Show'} Team Members ({projectMembers.filter(m => m.email && m.email.includes('@')).length})
                  </Button>

                  {showTeamMembers && (
                    <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto border rounded-lg p-2">
                      {projectMembers
                        .filter(member => member.email && typeof member.email === 'string' && member.email.includes('@'))
                        .map((member) => {
                        const isInvited = invitees.some(inv => inv.email === member.email);
                        return (
                          <div
                            key={member.id}
                            className={`flex items-center justify-between p-2 rounded border ${isInvited ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-medium">{member.name}</div>
                                <div className="text-xs text-gray-500">{member.email}</div>
                              </div>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant={isInvited ? "secondary" : "outline"}
                              onClick={() => isInvited ? removeInvitee(member.email) : addTeamMember(member)}
                              disabled={isInvited}
                            >
                              {isInvited ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Invited
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-3 h-3 mr-1" />
                                  Invite
                                </>
                              )}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* External Email Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email address"
                  value={newInviteeEmail}
                  onChange={(e) => setNewInviteeEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addExternalInvitee()}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addExternalInvitee}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Invited People List */}
              {invitees.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">
                    Invited People ({invitees.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {invitees.map((invitee, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {invitee.name || invitee.email}
                        {invitee.isTeamMember && <Users className="w-3 h-3" />}
                        <button
                          onClick={() => removeInvitee(invitee.email)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateMeeting}
                disabled={isLoading || !title.trim() || !startTime || !endTime || invitees.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    Create Meeting
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            {/* Success State */}
            <div className="flex flex-col items-center space-y-3">
              <CheckCircle className="w-16 h-16 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">Meeting Created Successfully!</h3>
              <p className="text-gray-600">Your Google Meet is ready to use</p>
            </div>

            {/* Meet Link */}
            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
              <div className="text-sm font-medium text-blue-900">Google Meet Link:</div>
              <div className="bg-white rounded border p-2 text-sm font-mono break-all">
                {meetLink}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleJoinMeeting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Join Meeting
                </Button>
              </div>
            </div>

            {/* Close Button */}
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SimpleGoogleMeetModal;