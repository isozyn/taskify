/**
 * Meeting Notes Modal - Opens from calendar meetings
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MeetingNotes from './MeetingNotes';

interface MeetingNotesModalProps {
  open: boolean;
  onClose: () => void;
  meeting: {
    id: string;
    title: string;
    start: Date;
    attendees?: string[];
  } | null;
}

const MeetingNotesModal: React.FC<MeetingNotesModalProps> = ({
  open,
  onClose,
  meeting
}) => {
  if (!meeting) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <MeetingNotes
          meetingId={meeting.id}
          meetingTitle={meeting.title}
          meetingDate={meeting.start}
          attendees={meeting.attendees}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default MeetingNotesModal;