import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import { Filter, Download, CheckCircle2, Calendar as CalendarIcon, Plus, Video } from "lucide-react";
import TaskModal from "./TaskModal";
import MeetingModal from "./MeetingModal";
import MeetingDetailsModal from "./MeetingDetailsModal";
import { api, CalendarSyncStatus } from "@/lib/api";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-styles.css';

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
    projectMembers: any[];
    project?: any;
}

const CalendarView = ({ projectMembers, project }: CalendarViewProps) => {
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
    const [currentView, setCurrentView] = useState<any>(Views.MONTH);
    const [showMeetingModal, setShowMeetingModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
    const [customEvents, setCustomEvents] = useState<any[]>([]);
    const [syncStatus, setSyncStatus] = useState<CalendarSyncStatus>({
        calendarSyncEnabled: false,
        calendarConnected: false,
    });

    // Fetch sync status
    useEffect(() => {
        const fetchSyncStatus = async () => {
            try {
                const response: any = await api.getCalendarSyncStatus();
                setSyncStatus(response);
            } catch (error) {
                console.error("Failed to fetch sync status:", error);
            }
        };
        fetchSyncStatus();
    }, []);

    // Convert custom events to calendar events (memoized to prevent unnecessary re-renders)
    const calendarEvents = useMemo(() => {
        const events: any[] = [];

        // Add project as a calendar event if it has dates
        if (project?.startDate && project?.endDate) {
            events.push({
                id: `project-${project.id}`,
                title: `📋 ${project.title}`,
                start: new Date(project.startDate),
                end: new Date(project.endDate),
                resource: {
                    id: project.id,
                    title: project.title,
                    description: project.description,
                    eventType: 'project',
                    status: 'project',
                    isProject: true,
                },
                allDay: true,
            });
        }

        // Add custom created events (meetings/tasks)
        const customCalendarEvents = customEvents.map(event => ({
            id: event.id,
            title: event.title,
            start: new Date(event.startDate),
            end: new Date(event.endDate),
            resource: {
                ...event,
                eventType: event.type,
            },
            allDay: event.allDay || false,
        }));

        return [...events, ...customCalendarEvents];
    }, [customEvents, project]);

    // Custom event style getter for calendar (memoized) - Google Calendar style
    const eventStyleGetter = useMemo(() => (event: any) => {
        const task = event.resource;
        let backgroundColor = '#3174ad';
        let borderColor = '#3174ad';

        if (task.eventType === 'project') {
            backgroundColor = '#059669';
            borderColor = '#047857';
        } else if (task.eventType === 'meeting') {
            backgroundColor = '#1a73e8';
            borderColor = '#1557b0';
        } else {
            switch (task.status) {
                case 'complete':
                    backgroundColor = '#10b981';
                    borderColor = '#059669';
                    break;
                case 'in-progress':
                    backgroundColor = '#f59e0b';
                    borderColor = '#d97706';
                    break;
                case 'upcoming':
                    backgroundColor = '#6366f1';
                    borderColor = '#4f46e5';
                    break;
                default:
                    backgroundColor = '#8b5cf6';
                    borderColor = '#7c3aed';
            }
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '4px',
                opacity: 0.95,
                color: 'white',
                border: `1px solid ${borderColor}`,
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                padding: '2px 6px',
            }
        };
    }, []);

    // Handle calendar event selection
    const handleSelectEvent = (event: any) => {
        if (event.resource.eventType === 'project') {
            // Show project details
            console.log('Project clicked:', event);
            // Could open a project details modal here
        } else if (event.resource.eventType === 'meeting') {
            // Open meeting details modal
            setSelectedMeeting(event.resource);
        } else {
            setSelectedTask(event.resource);
        }
    };

    // Handle event deletion
    const handleDeleteEvent = async (eventId: string) => {
        const event = customEvents.find(e => e.id === eventId);
        
        // Remove from local state
        setCustomEvents(prev => prev.filter(event => event.id !== eventId));
        
        // If it has a Google Calendar event ID, delete from Google Calendar too
        if (event?.googleCalendarEventId && syncStatus.calendarSyncEnabled) {
            try {
                await api.deleteCalendarEvent(event.googleCalendarEventId);
                console.log('Google Calendar event deleted successfully');
            } catch (error) {
                console.error('Failed to delete Google Calendar event:', error);
            }
        }
    };

    // Handle slot selection (clicking on empty calendar space)
    const handleSelectSlot = (slotInfo: any) => {
        setSelectedSlot({
            start: slotInfo.start,
            end: slotInfo.end,
        });
        setShowMeetingModal(true);
    };

    // Handle event creation
    const handleCreateEvent = async (eventData: any) => {
        const newEvent = {
            id: `custom-${Date.now()}`,
            ...eventData,
            status: eventData.type === 'meeting' ? 'meeting' : 'upcoming',
        };
        
        // Add to local state immediately for instant feedback
        setCustomEvents(prev => [...prev, newEvent]);
        console.log('Event created and added to calendar:', newEvent);

        // If it's a meeting and calendar sync is enabled, create in Google Calendar
        if (eventData.type === 'meeting' && syncStatus.calendarSyncEnabled && syncStatus.calendarConnected) {
            try {
                // Get attendee emails
                const attendeeEmails = eventData.attendees
                    .map((id: string) => projectMembers.find(m => m.id === id)?.email)
                    .filter(Boolean);

                const calendarEventData = {
                    summary: eventData.title,
                    description: eventData.description || '',
                    startDateTime: new Date(eventData.startDate).toISOString(),
                    endDateTime: new Date(eventData.endDate).toISOString(),
                    attendees: attendeeEmails,
                    includeGoogleMeet: true,
                };

                console.log('Creating Google Calendar event:', calendarEventData);
                const response: any = await api.createCalendarEvent(calendarEventData);
                
                if (response.event) {
                    // Update the event with the real Google Calendar event ID and Meet link
                    const updatedEvent = {
                        ...newEvent,
                        googleCalendarEventId: response.event.id,
                        meetingLink: response.event.hangoutLink || response.event.conferenceData?.entryPoints?.[0]?.uri || newEvent.meetingLink,
                    };
                    
                    // Update the event in state with real Google Meet link
                    setCustomEvents(prev => 
                        prev.map(e => e.id === newEvent.id ? updatedEvent : e)
                    );
                    
                    console.log('Google Calendar event created successfully:', response.event);
                }
            } catch (error) {
                console.error('Failed to create Google Calendar event:', error);
                // Event is still in local calendar even if Google sync fails
            }
        }
    };



    // Get event statistics
    const getEventStats = () => {
        const total = customEvents.length + (project?.startDate && project?.endDate ? 1 : 0);
        const meetings = customEvents.filter(event => event.type === 'meeting').length;
        const tasks = customEvents.filter(event => event.type === 'task').length;
        const projects = project?.startDate && project?.endDate ? 1 : 0;

        return { total, meetings, tasks, projects };
    };

    const stats = getEventStats();

    return (
        <div className="space-y-6">
            {/* Google Calendar Sync Status Banner */}
            {syncStatus.calendarSyncEnabled && syncStatus.calendarConnected && (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-green-900">
                            Google Calendar Sync Active
                        </p>
                        <p className="text-xs text-green-700">
                            Tasks are automatically syncing to your Google Calendar
                        </p>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        Synced
                    </Badge>
                </div>
            )}

            {/* Calendar Header with Stats and Actions */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-slate-900">Project Calendar</h2>
                    <p className="text-slate-600">Manage tasks and deadlines in calendar view</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Quick Stats */}
                    <div className="flex items-center gap-4 px-4 py-2 bg-white rounded-lg border border-slate-200">
                        <div className="text-center">
                            <div className="text-lg font-bold text-slate-900">{stats.total}</div>
                            <div className="text-xs text-slate-500">Total</div>
                        </div>
                        <div className="w-px h-8 bg-slate-200"></div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">{stats.meetings}</div>
                            <div className="text-xs text-slate-500">Meetings</div>
                        </div>
                        <div className="w-px h-8 bg-slate-200"></div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">{stats.tasks}</div>
                            <div className="text-xs text-slate-500">Tasks</div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => setShowMeetingModal(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create
                    </Button>

                    <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>

                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Main Calendar Card */}
            <Card className="border border-slate-200 shadow-sm bg-white">
                <CardContent className="p-6">
                    <div className="h-[700px] bg-white rounded-lg">
                        <Calendar
                            localizer={localizer}
                            events={calendarEvents}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            onSelectEvent={handleSelectEvent}
                            onSelectSlot={handleSelectSlot}
                            selectable={true}
                            eventPropGetter={eventStyleGetter}
                            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                            defaultView={Views.MONTH}
                            view={currentView}
                            onView={(view) => setCurrentView(view)}
                            popup
                            showMultiDayTimes
                            step={30}
                            timeslots={2}
                            showAllEvents

                            components={{
                                event: ({ event }) => {
                                    const isMeeting = event.resource.eventType === 'meeting';
                                    const isProject = event.resource.eventType === 'project';
                                    const isComplete = event.resource.status === 'complete';
                                    const hasMeetingLink = event.resource.meetingLink;
                                    
                                    return (
                                        <div className="px-1 py-0.5">
                                            <div className="flex items-center gap-1">
                                                {isMeeting && <Video className="w-3 h-3" />}
                                                {isComplete && <span className="text-xs">✓</span>}
                                                <span className="font-medium text-xs truncate">{event.title}</span>
                                            </div>
                                            {isMeeting && hasMeetingLink && (
                                                <div className="text-xs opacity-90 truncate">
                                                    📹 Google Meet
                                                </div>
                                            )}
                                            {!isMeeting && !isProject && event.resource.assignees && event.resource.assignees.length > 0 && (
                                                <div className="text-xs opacity-90 truncate">
                                                    {event.resource.assignees[0]}{event.resource.assignees.length > 1 ? ` +${event.resource.assignees.length - 1}` : ''}
                                                </div>
                                            )}
                                            {isProject && (
                                                <div className="text-xs opacity-90 truncate">
                                                    Project Timeline
                                                </div>
                                            )}
                                        </div>
                                    );
                                },

                                toolbar: ({ label, onNavigate, onView, view }) => (
                                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                                        <div className="flex items-center gap-4">
                                            <h3 className="text-xl font-bold text-slate-900">{label}</h3>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onNavigate('PREV')}
                                                >
                                                    ←
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onNavigate('TODAY')}
                                                >
                                                    Today
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onNavigate('NEXT')}
                                                >
                                                    →
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {[
                                                { key: Views.MONTH, label: 'Month' },
                                                { key: Views.WEEK, label: 'Week' },
                                                { key: Views.DAY, label: 'Day' },
                                                { key: Views.AGENDA, label: 'Agenda' }
                                            ].map(({ key, label }) => (
                                                <Button
                                                    key={key}
                                                    variant={view === key ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => onView(key)}
                                                    className={view === key ? "bg-blue-600 hover:bg-blue-700" : ""}
                                                >
                                                    {label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                ),
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Calendar Legend */}
            <Card className="border border-slate-200 shadow-sm bg-white">
                <CardContent className="p-4">
                    <div className="flex items-center justify-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-green-600"></div>
                            <span className="text-sm font-medium text-slate-700">Project Timeline</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-blue-600"></div>
                            <span className="text-sm font-medium text-slate-700">Meetings</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-indigo-500"></div>
                            <span className="text-sm font-medium text-slate-700">Tasks</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Task Detail Modal */}
            {selectedTask && (
                <TaskModal
                    task={selectedTask}
                    open={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                    projectMembers={projectMembers}
                />
            )}

            {/* Meeting/Event Creation Modal */}
            <MeetingModal
                open={showMeetingModal}
                onClose={() => {
                    setShowMeetingModal(false);
                    setSelectedSlot(null);
                }}
                selectedSlot={selectedSlot || undefined}
                projectMembers={projectMembers}
                onCreateEvent={handleCreateEvent}
            />

            {/* Meeting Details Modal */}
            {selectedMeeting && (
                <MeetingDetailsModal
                    open={!!selectedMeeting}
                    onClose={() => setSelectedMeeting(null)}
                    meeting={selectedMeeting}
                    projectMembers={projectMembers}
                    onDelete={handleDeleteEvent}
                />
            )}
        </div>
    );
};

export default CalendarView;