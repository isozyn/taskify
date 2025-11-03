import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import { Filter, Download } from "lucide-react";
import TaskModal from "./TaskModal";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-styles.css';

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
    projectMembers: any[];
}

const CalendarView = ({ projectMembers }: CalendarViewProps) => {
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [currentView, setCurrentView] = useState<any>(Views.MONTH);

    // Mock tasks data - same as TimelineView for consistency
    const tasks = [
        {
            id: 1,
            title: "UX Research",
            description: "Conduct user interviews and analyze user behavior patterns to inform design decisions.",
            assignees: ["John Doe", "Jane Smith"],
            startDate: "2024-11-04",
            endDate: "2024-11-12",
            status: "in-progress",
            progress: 48,
            color: "from-blue-500 to-blue-600",
            priority: "high",
            tags: ["research", "ux"],
            subtasks: [
                { id: 1, title: "User interviews", completed: true },
                { id: 2, title: "Survey analysis", completed: true },
                { id: 3, title: "Persona creation", completed: false },
                { id: 4, title: "Journey mapping", completed: false },
            ],
        },
        {
            id: 2,
            title: "Information Architecture",
            description: "Design the site structure and navigation flow for optimal user experience.",
            assignees: ["Jane Smith", "Mike Johnson", "Sarah Wilson"],
            startDate: "2024-11-06",
            endDate: "2024-11-14",
            status: "complete",
            progress: 100,
            color: "from-emerald-500 to-emerald-600",
            priority: "medium",
            tags: ["architecture", "navigation"],
            subtasks: [
                { id: 1, title: "Site map creation", completed: true },
                { id: 2, title: "Navigation design", completed: true },
                { id: 3, title: "Content hierarchy", completed: true },
                { id: 4, title: "User flow diagrams", completed: true },
            ],
        },
        {
            id: 3,
            title: "Design Phase",
            description: "Create visual designs and mockups for all key pages and components.",
            assignees: ["Mike Johnson", "Sarah Wilson"],
            startDate: "2024-11-08",
            endDate: "2024-11-20",
            status: "in-progress",
            progress: 54,
            color: "from-teal-500 to-teal-600",
            priority: "high",
            tags: ["design", "mockups"],
            subtasks: [
                { id: 1, title: "Wireframes", completed: true },
                { id: 2, title: "Visual design", completed: true },
                { id: 3, title: "Component library", completed: false },
                { id: 4, title: "Responsive layouts", completed: false },
            ],
        },
        {
            id: 4,
            title: "Prototyping",
            description: "Build interactive prototypes for user testing and stakeholder review.",
            assignees: ["Sarah Wilson", "John Doe"],
            startDate: "2024-11-18",
            endDate: "2024-11-28",
            status: "upcoming",
            progress: 39,
            color: "from-sky-500 to-sky-600",
            priority: "medium",
            tags: ["prototype", "testing"],
            subtasks: [
                { id: 1, title: "Low-fi prototype", completed: true },
                { id: 2, title: "High-fi prototype", completed: false },
                { id: 3, title: "User testing", completed: false },
                { id: 4, title: "Iteration", completed: false },
            ],
        },
        {
            id: 5,
            title: "Development",
            description: "Implement the frontend and backend functionality according to specifications.",
            assignees: ["Mike Johnson", "Jane Smith"],
            startDate: "2024-11-14",
            endDate: "2024-11-22",
            status: "in-progress",
            progress: 54,
            color: "from-orange-500 to-orange-600",
            priority: "high",
            tags: ["development", "coding"],
            subtasks: [
                { id: 1, title: "Setup development environment", completed: true },
                { id: 2, title: "Core functionality", completed: true },
                { id: 3, title: "API integration", completed: false },
                { id: 4, title: "Testing", completed: false },
            ],
        },
    ];

    // Convert tasks to calendar events (memoized to prevent unnecessary re-renders)
    const calendarEvents = useMemo(() =>
        tasks.map(task => ({
            id: task.id,
            title: task.title,
            start: new Date(task.startDate),
            end: new Date(task.endDate),
            resource: task,
            allDay: false,
        })), [tasks]
    );

    // Custom event style getter for calendar (memoized)
    const eventStyleGetter = useMemo(() => (event: any) => {
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
    }, []);

    // Handle calendar event selection
    const handleSelectEvent = (event: any) => {
        setSelectedTask(event.resource);
    };



    // Get task statistics
    const getTaskStats = () => {
        const total = tasks.length;
        const completed = tasks.filter(task => task.status === 'complete').length;
        const inProgress = tasks.filter(task => task.status === 'in-progress').length;
        const upcoming = tasks.filter(task => task.status === 'upcoming').length;

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
                            selectable={false}
                            eventPropGetter={eventStyleGetter}
                            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                            defaultView={Views.MONTH}
                            view={currentView}
                            onView={(view) => setCurrentView(view)}
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


        </div>
    );
};

export default CalendarView;