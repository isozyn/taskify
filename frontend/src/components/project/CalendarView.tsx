import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import { Filter, Download, Video, Calendar as CalendarIcon } from "lucide-react";
import TaskModal from "./TaskModal";
import SimpleGoogleMeetModal from "./SimpleGoogleMeetModal";
import MeetingNotesModal from "./MeetingNotesModal";
import ErrorBoundary from "../ErrorBoundary";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-styles.css';

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
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showDateActionModal, setShowDateActionModal] = useState(false);
    const [showEventModal, setShowEventModal] = useState(false);
    const [showDayAgenda, setShowDayAgenda] = useState(false);
    const [showMeetingNotes, setShowMeetingNotes] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
    const [filters, setFilters] = useState({
        status: [] as string[],
        priority: [] as string[],
        assignee: [] as string[],
        dateRange: { start: null as Date | null, end: null as Date | null }
    });
    const [events, setEvents] = useState<any[]>([]);

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

    // Filter tasks based on current filters
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            // Status filter
            if (filters.status.length > 0 && !filters.status.includes(task.status)) {
                return false;
            }
            
            // Priority filter
            if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
                return false;
            }
            
            // Assignee filter
            if (filters.assignee.length > 0) {
                const hasMatchingAssignee = task.assignees?.some(assignee => 
                    filters.assignee.includes(assignee)
                );
                if (!hasMatchingAssignee) return false;
            }
            
            // Date range filter
            if (filters.dateRange.start && filters.dateRange.end) {
                const taskStart = new Date(task.startDate);
                const taskEnd = new Date(task.endDate);
                if (taskEnd < filters.dateRange.start || taskStart > filters.dateRange.end) {
                    return false;
                }
            }
            
            return true;
        });
    }, [tasks, filters]);

    // Convert filtered tasks to calendar events
    const taskEvents = useMemo(() => 
        filteredTasks.map(task => ({
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
        })), [filteredTasks]
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

    // Convert general events to calendar events
    const generalEvents = useMemo(() => 
        events.map(event => ({
            id: event.id,
            title: `📅 ${event.title}`,
            description: event.description,
            start: new Date(event.start),
            end: new Date(event.end),
            resource: { ...event, type: 'event' },
            allDay: event.allDay || false,
            backgroundColor: '#8B5CF6',
            borderColor: '#7C3AED',
            textColor: '#ffffff',
            classNames: ['general-event']
        })), [events]
    );

    // Combine all calendar events
    const calendarEvents = useMemo(() => 
        [...taskEvents, ...meetingEvents, ...generalEvents], [taskEvents, meetingEvents, generalEvents]
    );

    // Custom event style getter using our new utility function
    const eventStyleGetter = useMemo(() => (event: any) => {
        // The styling is now handled by our calendar utilities
        // This function can be simplified or removed entirely
        return {
            className: 'task-calendar-event'
        };
    }, []);

    // Handle calendar event selection using our utility
    const handleSelectEvent = (event: any) => {
        setSelectedTask(event.resource);
    };

    // Handle slot selection (empty calendar slot) - Show action options
    const handleSelectSlot = (slotInfo: any) => {
        console.log('Date clicked:', slotInfo.start);
        setSelectedDate(slotInfo.start);
        setShowDateActionModal(true);
        console.log('showDateActionModal set to true');
    };

    // Handle meeting creation
    const handleMeetingCreated = (meeting: any) => {
        setMeetings(prev => [...prev, meeting]);
        // You can also add this to your calendar events if needed
    };

    // Handle event creation
    const handleEventCreated = (event: any) => {
        setEvents(prev => [...prev, event]);
    };

    // Get events for a specific date
    const getEventsForDate = (date: Date) => {
        const dateStr = date.toDateString();
        
        // Get tasks for this date
        const dayTasks = filteredTasks.filter(task => {
            const taskStart = new Date(task.startDate);
            const taskEnd = new Date(task.endDate);
            return taskStart.toDateString() === dateStr || 
                   taskEnd.toDateString() === dateStr ||
                   (taskStart <= date && taskEnd >= date);
        });

        // Get meetings for this date
        const dayMeetings = meetings.filter(meeting => {
            const meetingStart = new Date(meeting.start);
            return meetingStart.toDateString() === dateStr;
        });

        // Get general events for this date
        const dayEvents = events.filter(event => {
            const eventStart = new Date(event.start);
            return eventStart.toDateString() === dateStr;
        });

        return { tasks: dayTasks, meetings: dayMeetings, events: dayEvents };
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

    // Export functionality
    const handleExport = () => {
        const exportData = {
            exportDate: new Date().toISOString(),
            projectData: {
                tasks: filteredTasks,
                meetings: meetings,
                stats: stats
            }
        };

        // Create CSV format
        const csvHeaders = ['Title', 'Status', 'Priority', 'Start Date', 'End Date', 'Progress', 'Assignees', 'Tags'];
        const csvRows = filteredTasks.map(task => [
            task.title,
            task.status,
            task.priority,
            new Date(task.startDate).toLocaleDateString(),
            new Date(task.endDate).toLocaleDateString(),
            `${task.progress}%`,
            task.assignees?.join('; ') || '',
            task.tags?.join('; ') || ''
        ]);

        const csvContent = [
            csvHeaders.join(','),
            ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `project-calendar-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            status: [],
            priority: [],
            assignee: [],
            dateRange: { start: null, end: null }
        });
    };

    // Check if any filters are active
    const hasActiveFilters = filters.status.length > 0 || 
                            filters.priority.length > 0 || 
                            filters.assignee.length > 0 || 
                            filters.dateRange.start || 
                            filters.dateRange.end;

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

                    {/* Test button to verify modal works */}
                    <Button
                        onClick={() => {
                            setSelectedDate(new Date());
                            setShowDateActionModal(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="bg-blue-50"
                    >
                        Test Date Modal
                    </Button>

                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowFilterModal(true)}
                        className={hasActiveFilters ? "bg-blue-50 border-blue-300 text-blue-700" : ""}
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filter {hasActiveFilters && `(${filters.status.length + filters.priority.length + filters.assignee.length})`}
                    </Button>

                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleExport}
                    >
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
                            selectable={true}
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
                                            {event.resource.progress}% • {event.resource.assignees?.length || 0} assignee{(event.resource.assignees?.length || 0) !== 1 ? 's' : ''}
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
                    projectMembers={projectMembers}
                />
            </ErrorBoundary>

            {/* Date Action Modal */}
            {showDateActionModal && selectedDate && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">
                                {selectedDate.toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDateActionModal(false)}
                            >
                                ✕
                            </Button>
                        </div>

                        <div className="space-y-3">
                            <Button
                                onClick={() => {
                                    setShowDateActionModal(false);
                                    setShowEventModal(true);
                                }}
                                className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                <CalendarIcon className="w-4 h-4 mr-3" />
                                Create Event
                            </Button>

                            <Button
                                onClick={() => {
                                    setShowDateActionModal(false);
                                    setShowGoogleMeetModal(true);
                                }}
                                className="w-full justify-start bg-green-600 hover:bg-green-700 text-white"
                            >
                                <Video className="w-4 h-4 mr-3" />
                                Create Meeting
                            </Button>

                            <Button
                                onClick={() => {
                                    setShowDateActionModal(false);
                                    setShowDayAgenda(true);
                                }}
                                variant="outline"
                                className="w-full justify-start"
                            >
                                <Filter className="w-4 h-4 mr-3" />
                                View Day Agenda
                            </Button>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                            <p className="text-sm text-gray-600 mb-2">Quick Preview:</p>
                            {(() => {
                                const dayData = getEventsForDate(selectedDate);
                                const totalItems = dayData.tasks.length + dayData.meetings.length + dayData.events.length;
                                
                                if (totalItems === 0) {
                                    return <p className="text-sm text-gray-500">No events scheduled for this day</p>;
                                }
                                
                                return (
                                    <div className="text-sm text-gray-600">
                                        {dayData.tasks.length > 0 && <span>{dayData.tasks.length} task{dayData.tasks.length !== 1 ? 's' : ''}</span>}
                                        {dayData.meetings.length > 0 && <span>{dayData.tasks.length > 0 ? ', ' : ''}{dayData.meetings.length} meeting{dayData.meetings.length !== 1 ? 's' : ''}</span>}
                                        {dayData.events.length > 0 && <span>{(dayData.tasks.length > 0 || dayData.meetings.length > 0) ? ', ' : ''}{dayData.events.length} event{dayData.events.length !== 1 ? 's' : ''}</span>}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Modal */}
            {showFilterModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Filter Tasks</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowFilterModal(false)}
                            >
                                ✕
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Status</label>
                                <div className="space-y-2">
                                    {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'BLOCKED'].map(status => (
                                        <label key={status} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={filters.status.includes(status)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFilters(prev => ({
                                                            ...prev,
                                                            status: [...prev.status, status]
                                                        }));
                                                    } else {
                                                        setFilters(prev => ({
                                                            ...prev,
                                                            status: prev.status.filter(s => s !== status)
                                                        }));
                                                    }
                                                }}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">{status.replace('_', ' ')}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Priority Filter */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Priority</label>
                                <div className="space-y-2">
                                    {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(priority => (
                                        <label key={priority} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={filters.priority.includes(priority)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFilters(prev => ({
                                                            ...prev,
                                                            priority: [...prev.priority, priority]
                                                        }));
                                                    } else {
                                                        setFilters(prev => ({
                                                            ...prev,
                                                            priority: prev.priority.filter(p => p !== priority)
                                                        }));
                                                    }
                                                }}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">{priority}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Assignee Filter */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Assignees</label>
                                <div className="space-y-2">
                                    {['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'].map(assignee => (
                                        <label key={assignee} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={filters.assignee.includes(assignee)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFilters(prev => ({
                                                            ...prev,
                                                            assignee: [...prev.assignee, assignee]
                                                        }));
                                                    } else {
                                                        setFilters(prev => ({
                                                            ...prev,
                                                            assignee: prev.assignee.filter(a => a !== assignee)
                                                        }));
                                                    }
                                                }}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">{assignee}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-6 pt-4 border-t">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearFilters}
                                disabled={!hasActiveFilters}
                            >
                                Clear All
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowFilterModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => setShowFilterModal(false)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Event Creation Modal */}
            {showEventModal && selectedDate && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Create Event</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowEventModal(false)}
                            >
                                ✕
                            </Button>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target as HTMLFormElement);
                            const eventData = {
                                id: Date.now().toString(),
                                title: formData.get('title') as string,
                                description: formData.get('description') as string,
                                start: new Date(`${selectedDate.toDateString()} ${formData.get('startTime')}`),
                                end: new Date(`${selectedDate.toDateString()} ${formData.get('endTime')}`),
                                allDay: formData.get('allDay') === 'on',
                                type: 'event'
                            };
                            
                            handleEventCreated(eventData);
                            setShowEventModal(false);
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Event Title *</label>
                                    <input
                                        name="title"
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Enter event title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Event description (optional)"
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1">Start Time</label>
                                        <input
                                            name="startTime"
                                            type="time"
                                            defaultValue="09:00"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1">End Time</label>
                                        <input
                                            name="endTime"
                                            type="time"
                                            defaultValue="10:00"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        name="allDay"
                                        type="checkbox"
                                        className="mr-2"
                                    />
                                    <label className="text-sm">All Day Event</label>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowEventModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    Create Event
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Day Agenda Modal */}
            {showDayAgenda && selectedDate && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">
                                Agenda for {selectedDate.toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDayAgenda(false)}
                            >
                                ✕
                            </Button>
                        </div>

                        {(() => {
                            const dayData = getEventsForDate(selectedDate);
                            const allItems = [
                                ...dayData.tasks.map(task => ({ ...task, type: 'task', time: new Date(task.startDate) })),
                                ...dayData.meetings.map(meeting => ({ ...meeting, type: 'meeting', time: new Date(meeting.start) })),
                                ...dayData.events.map(event => ({ ...event, type: 'event', time: new Date(event.start) }))
                            ].sort((a, b) => a.time.getTime() - b.time.getTime());

                            if (allItems.length === 0) {
                                return (
                                    <div className="text-center py-8">
                                        <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600">No events scheduled for this day</p>
                                        <p className="text-sm text-gray-500 mt-2">Click "Create Event" or "Create Meeting" to add something</p>
                                    </div>
                                );
                            }

                            return (
                                <div className="space-y-4">
                                    {allItems.map((item, index) => (
                                        <div key={`${item.type}-${item.id || index}`} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                            <div className="flex-shrink-0">
                                                {item.type === 'task' && (
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                                        item.status === 'COMPLETED' ? 'bg-green-500' :
                                                        item.status === 'IN_PROGRESS' ? 'bg-amber-500' :
                                                        item.status === 'BLOCKED' ? 'bg-red-500' : 'bg-gray-500'
                                                    } text-white text-xs font-bold`}>
                                                        T
                                                    </div>
                                                )}
                                                {item.type === 'meeting' && (
                                                    <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-white">
                                                        <Video className="w-4 h-4" />
                                                    </div>
                                                )}
                                                {item.type === 'event' && (
                                                    <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center text-white">
                                                        <CalendarIcon className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                                                    <span className="text-sm text-gray-500">
                                                        {item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                
                                                {item.description && (
                                                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                                                )}
                                                
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span className="capitalize">{item.type}</span>
                                                    {item.type === 'task' && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="capitalize">{item.status?.replace('_', ' ')}</span>
                                                            <span>•</span>
                                                            <span>{item.progress}% Complete</span>
                                                        </>
                                                    )}
                                                    {item.assignees && item.assignees.length > 0 && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{item.assignees.length} assignee{item.assignees.length !== 1 ? 's' : ''}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}

                        <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t">
                            <Button
                                onClick={() => {
                                    setShowDayAgenda(false);
                                    setShowEventModal(true);
                                }}
                                variant="outline"
                                size="sm"
                            >
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                Add Event
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowDayAgenda(false);
                                    setShowGoogleMeetModal(true);
                                }}
                                variant="outline"
                                size="sm"
                            >
                                <Video className="w-4 h-4 mr-2" />
                                Add Meeting
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarView;