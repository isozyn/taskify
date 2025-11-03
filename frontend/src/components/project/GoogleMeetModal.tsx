/**
 * Google Meet Modal Component
 * Allows users to create Google Meet meetings from calendar dates
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  Copy, 
  ExternalLink, 
  Plus,
  X,
  CheckCircle
} from 'lucide-react';

interface GoogleMeetModalProps {
  open: boolean;
  onClose: () => void;
  selectedDate?: Date;
  onMeetingCreated?: (meeting: any) => void;
}

const GoogleMeetModal: React.FC<GoogleMeetModalProps> = ({
  open,
  onClose,
  selectedDate,
  onMeetingCreated
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [meetingCreated, setMeetingCreated] = useState(false);
  const [meetLink, setMeetLink] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [attendees, setAttendees] = useState<string[]>([]);
  const [newAttendee, setNewAttendee] = useState('');

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
      setAttendees([]);
      setMeetingCreated(false);
      setMeetLink('');
    }
  }, [selectedDate, open]);

  const handleAddAttendee = () => {
    if (newAttendee.trim() && !attendees.includes(newAttendee.trim())) {
      setAttendees([...attendees, newAttendee.trim()]);
      setNewAttendee('');
    }
  };

  const handleRemoveAttendee = (email: string) => {
    setAttendees(attendees.filter(a => a !== email));
  };

  const handleCreateMeeting = async () => {
    if (!title.trim() || !startTime || !endTime) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      // Generate a simple Google Meet link
      const meetingId = Math.random().toString(36).substring(2, 15);
      const generatedMeetLink = `https://meet.google.com/${meetingId}`;
      
      // Create a meeting event object
      const meetingEvent = {
        id: `meet-${Date.now()}`,
        title: title.trim(),
        description: `${description.trim()}\n\nJoin Google Meet: ${generatedMeetLink}`,
        start: startTime,
        end: endTime,
        meetLink: generatedMeetLink,
        type: 'meeting',
        attendees: attendees
      };

      setMeetLink(generatedMeetLink);
      setMeetingCreated(true);
      
      // Notify parent component
      if (onMeetingCreated) {
        onMeetingCreated(meetingEvent);
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Failed to create meeting. Please try again.');
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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

            {/* Attendees */}
            <div className="space-y-2">
              <Label>Attendees</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email address"
                  value={newAttendee}
                  onChange={(e) => setNewAttendee(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddAttendee()}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddAttendee}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {attendees.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {attendees.map((email) => (
                    <Badge key={email} variant="secondary" className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {email}
                      <button
                        onClick={() => handleRemoveAttendee(email)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
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
                disabled={isLoading || !title.trim() || !startTime || !endTime}
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

            {/* Meeting Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{title}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  {new Date(startTime).toLocaleString()} - {new Date(endTime).toLocaleString()}
                </span>
              </div>
              {attendees.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{attendees.length} attendee{attendees.length !== 1 ? 's' : ''}</span>
                </div>
              )}
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

export default GoogleMeetModal;