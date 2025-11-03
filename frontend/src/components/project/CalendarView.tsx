import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import { Filter, Download, Video } from "lucide-react";
import TaskModal from "./TaskModal";
import SimpleGoogleMeetModal from "./SimpleGoogleMeetModal";
import ErrorBoundary from "../ErrorBoundary";
// Task interface
interface Task {
    id: number;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'BLOCKED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    assignees?: string[];
    tags?: string[];
    progress?: number;
}
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-styles.css';

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
    projectMembers: any[];
}

const CalendarView = ({ projectMembers }: CalendarViewProps) => {
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [showGoogleMeetModal, setShowGoogleMeetModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [currentView, setCurrentView] = useState<any>(Views.MONTH);
    const [meetings, setMeetings] = useState<any[]>([]);

    // Status color mapping
    const getStatusColor = (status: string) => {
        const colors = {
            TODO: { background: '#F3F4F6', border: '#6B7280', text: '#374151' },
            IN_PROGRESS: { background: '#FEF3C7', border: '#F59E0B', text: '#92400E' },
            IN_REVIEW: { background: '#DBEAFE', border: '#3B82F6', text: '#1E40AF' },
            COMPLETED: { background: '#D1FAE5', border: '#10B981', text: '#065F46' },
            BLOCKED: { background: '#FEE2E2', border: '#EF4444', text: '#991B1B' }
        };
        return colors[status as keyof typeof colors] || colors.TODO;
    };

    // Mock tasks data - updated for current dates
    const tasks: Task[] = [
        {
            id: 1,
            title: "UX Research",
            description: "Conduct user interviews and analyze user behavior patterns to inform design decisions.",
            assignees: ["John Doe", "Jane Smith"],
            startDate: "2024-11-04T09:00:00.000Z",
            endDate: "2024-11-12T17:00:00.000Z",
            status: "IN_PROGRESS",
            progress: 48,
            priority: "HIGH",
            tags: ["research", "ux"],
        },
        {
            id: 2,
            title: "Information Architecture",
            description: "Design the site structure and navigation flow for optimal user experience.",
            assignees: ["Jane Smith", "Mike Johnson", "Sarah Wilson"],
            startDate: "2024-11-06T09:00:00.000Z",
            endDate: "2024-11-14T17:00:00.000Z",
            status: "COMPLETED",
            progress: 100,
            priority: "MEDIUM",
            tags: ["architecture", "navigation"],
        },
        {
            id: 3,
            title: "Design Phase",
            description: "Create visual designs and mockups for all key pages and components.",
            assignees: ["Mike Johnson", "Sarah Wilson"],
            startDate: "2024-11-08T09:00:00.000Z",
            endDate: "2024-11-20T17:00:00.000Z",
            status: "IN_PROGRESS",
            progress: 54,
            priority: "HIGH",
            tags: ["design", "mockups"],
        },
        {
            id: 4,
            title: "Prototyping",
            description: "Build interactive prototypes for user testing and stakeholder review.",
            assignees: ["Sarah Wilson", "John Doe"],
            startDate: "2024-11-18T09:00:00.000Z",
            endDate: "2024-11-28T17:00:00.000Z",
            status: "TODO",
            progress: 39,
            priority: "MEDIUM",
            tags: ["prototype", "testing"],
        },
        {
            id: 5,
            title: "Development",
            description: "Implement the frontend and backend functionality according to specifications.",
            assignees: ["Mike Johnson", "Jane Smith"],
            startDate: "2024-11-14T09:00:00.000Z",
            endDate: "2024-11-22T17:00:00.000Z",
            status: "IN_PROGRESS",
            progress: 54,
            priority: "HIGH",
            tags: ["development", "coding"],
        },
    ];

    // Convert tasks to calendar events
    const taskEvents = useMemo(() => 
        tasks.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            start: new Date(task.startDate),
            end: new Date(task.endDate),
            resource: task,
            allDay: false,
            backgroundColor: getStatusColor(task.status).background,
            borderColor: getStatusColor(task.status).border,
            textColor: getStatusColor(task.status).text,
        })), [tasks]
    );

    // Convert meetings to calendar events
    const meetingEvents = useMemo(() => 
        meetings.map(meeting => ({
            id: meeting.id,
            title: `📹 ${meeting.title}`,
            description: meeting.description,
            start: new Date(meeting.start),
            end: new Date(meeting.end),
            resource: { ...meeting, type: 'meeting' },
            allDay: false,
            backgroundColor: '#10B981',
            borderColor: '#059669',
            textColor: '#ffffff',
            classNames: ['meeting-event']
        })), [meetings]
    );

    // Combine all calendar events
    const calendarEvents = useMemo(() => 
        [...taskEvents, ...meetingEvents], [taskEvents, meetingEvents]
    );

    // Custom event style getter for calendar
    const eventStyleGetter = (event: any) => {
        const task = event.resource;
        let backgroundColor = '#3174ad';

        switch (task.status) {
            case 'complete':
                backgroundColor = '#10b981';
                break;
            case 'in-progress':
                backgroundColor = '#f59e0b';
                break;
            case 'upcoming':
                backgroundColor = '#6366f1';
                break;
            default:
                backgroundColor = '#8b5cf6';
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '6px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
            }
        };
    };

    // Handle calendar event selection
    const handleSelectEvent = (event: any) => {
        setSelectedTask(event.resource);
    };

    // Handle slot selection (empty calendar slot) - Now opens Google Meet modal
    const handleSelectSlot = (slotInfo: any) => {
        setSelectedDate(slotInfo.start);
        setShowGoogleMeetModal(true);
    };

    // Handle meeting creation
    const handleMeetingCreated = (meeting: any) => {
        setMeetings(prev => [...prev, meeting]);
        // You can also add this to your calendar events if needed
    };

    // Get task statistics
    const getTaskStats = () => {
        const total = tasks.length;
        const completed = tasks.filter(task => task.status === 'COMPLETED').length;
        const inProgress = tasks.filter(task => task.status === 'IN_PROGRESS').length;
        const upcoming = tasks.filter(task => task.status === 'TODO').length;

        return { total, completed, inProgress, upcoming };
    };

    const stats = getTaskStats();

    return (
        <div className="space-y-6">
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
                            <div className="text-lg font-bold text-green-600">{stats.completed}</div>
                            <div className="text-xs text-slate-500">Done</div>
                        </div>
                        <div className="w-px h-8 bg-slate-200"></div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-amber-600">{stats.inProgress}</div>
                            <div className="text-xs text-slate-500">Active</div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <Button
                        onClick={() => setShowGoogleMeetModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        <Video className="w-4 h-4 mr-2" />
                        Create Meeting
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
                    <div className="h-[700px] bg-white rounded-lg relative overflow-hidden">
                        <Calendar
                            localizer={localizer}
                            events={calendarEvents}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ 
                                height: '100%',
                                position: 'static',
                                transform: 'none'
                            }}
                            onSelectEvent={handleSelectEvent}
                            onSelectSlot={handleSelectSlot}
                            selectable
                            eventPropGetter={eventStyleGetter}
                            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                            defaultView={Views.MONTH}
                            view={currentView}
                            onView={setCurrentView}
                            popup
                            showMultiDayTimes
                            step={60}
                            showAllEvents
                            components={{
                                event: ({ event }) => (
                                    <div className="p-1">
                                        <div className="font-semibold text-xs truncate">{event.title}</div>
                                        <div className="text-xs opacity-90">
                                            {event.resource.progress}% • {event.resource.assignees.length} assignee{event.resource.assignees.length !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                ),
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
                            <div className="w-4 h-4 rounded bg-green-500"></div>
                            <span className="text-sm font-medium text-slate-700">Complete</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-amber-500"></div>
                            <span className="text-sm font-medium text-slate-700">In Progress</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-indigo-500"></div>
                            <span className="text-sm font-medium text-slate-700">Upcoming</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-purple-500"></div>
                            <span className="text-sm font-medium text-slate-700">Other</span>
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

            {/* Google Meet Modal */}
            <ErrorBoundary>
                <SimpleGoogleMeetModal
                    open={showGoogleMeetModal}
                    onClose={() => setShowGoogleMeetModal(false)}
                    selectedDate={selectedDate}
                    onMeetingCreated={handleMeetingCreated}
                />
            </ErrorBoundary>
        </div>
    );
};

export default CalendarView;