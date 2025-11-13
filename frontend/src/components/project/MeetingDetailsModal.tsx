import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Clock, MapPin, Users, Calendar, ExternalLink, Copy, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface MeetingDetailsModalProps {
    open: boolean;
    onClose: () => void;
    meeting: any;
    projectMembers: any[];
    onDelete?: (meetingId: string) => void;
}

const MeetingDetailsModal = ({ open, onClose, meeting, projectMembers, onDelete }: MeetingDetailsModalProps) => {
    const [copied, setCopied] = useState(false);

    if (!meeting) return null;

    const isMeeting = meeting.type === 'meeting';
    const hasGoogleMeet = meeting.includeGoogleMeet && meeting.meetingLink;

    const copyMeetingLink = () => {
        if (meeting.meetingLink) {
            navigator.clipboard.writeText(meeting.meetingLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDelete = () => {
        if (onDelete && confirm('Are you sure you want to delete this event?')) {
            onDelete(meeting.id);
            onClose();
        }
    };

    const getAttendeeNames = () => {
        if (!meeting.attendees || meeting.attendees.length === 0) return [];
        return meeting.attendees
            .map((id: string) => projectMembers.find(m => m.id === id)?.name)
            .filter(Boolean);
    };

    const attendeeNames = getAttendeeNames();

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <DialogTitle className="text-2xl font-bold text-slate-900">
                                {meeting.title}
                            </DialogTitle>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant={isMeeting ? 'default' : 'secondary'} className="text-xs">
                                    {isMeeting ? (
                                        <>
                                            <Video className="w-3 h-3 mr-1" />
                                            Meeting
                                        </>
                                    ) : (
                                        <>
                                            <Calendar className="w-3 h-3 mr-1" />
                                            Task
                                        </>
                                    )}
                                </Badge>
                                {meeting.status === 'complete' && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                        Completed
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Google Meet Link - Prominent Display */}
                    {hasGoogleMeet && (
                        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg">
                                    <Video className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-blue-900 mb-1">Join with Google Meet</p>
                                    <a
                                        href={meeting.meetingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 underline text-sm break-all flex items-center gap-1"
                                    >
                                        {meeting.meetingLink}
                                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                    </a>
                                    <div className="flex gap-2 mt-3">
                                        <Button
                                            size="sm"
                                            onClick={() => window.open(meeting.meetingLink, '_blank')}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Video className="w-4 h-4 mr-2" />
                                            Join Meeting
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={copyMeetingLink}
                                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                                        >
                                            <Copy className="w-4 h-4 mr-2" />
                                            {copied ? 'Copied!' : 'Copy Link'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Date and Time */}
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-slate-500 mt-0.5" />
                            <div>
                                <p className="font-medium text-slate-900">
                                    {format(new Date(meeting.startDate), 'EEEE, MMMM d, yyyy')}
                                </p>
                                <p className="text-sm text-slate-600">
                                    {format(new Date(meeting.startDate), 'h:mm a')} - {format(new Date(meeting.endDate), 'h:mm a')}
                                </p>
                            </div>
                        </div>

                        {/* Location (if not Google Meet) */}
                        {!hasGoogleMeet && meeting.location && (
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-slate-500 mt-0.5" />
                                <div>
                                    <p className="font-medium text-slate-900">Location</p>
                                    <p className="text-sm text-slate-600">{meeting.location}</p>
                                </div>
                            </div>
                        )}

                        {/* Attendees */}
                        {attendeeNames.length > 0 && (
                            <div className="flex items-start gap-3">
                                <Users className="w-5 h-5 text-slate-500 mt-0.5" />
                                <div>
                                    <p className="font-medium text-slate-900">
                                        {isMeeting ? 'Attendees' : 'Assignees'} ({attendeeNames.length})
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {attendeeNames.map((name, index) => (
                                            <Badge key={index} variant="outline" className="text-sm">
                                                {name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {meeting.description && (
                        <div className="space-y-2">
                            <p className="font-medium text-slate-900">Description</p>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-200">
                                {meeting.description}
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={handleDelete}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                        <Button onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MeetingDetailsModal;
