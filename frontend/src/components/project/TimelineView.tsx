import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import TaskModal from "./TaskModal";
import { api, Task } from "@/lib/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TimelineViewProps {
  projectMembers: any[];
}

const TimelineView = ({ projectMembers }: TimelineViewProps) => {
  const { id: projectId } = useParams();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'detailed' | 'fit-to-screen'>('detailed');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      if (!projectId) return;
      
      try {
        setIsLoading(true);
        const response: any = await api.getTasksByProject(parseInt(projectId));
        console.log("TimelineView - Fetched tasks:", response);
        
        // Filter tasks that have both start and end dates
        const tasksWithDates = Array.isArray(response) 
          ? response.filter(task => task.startDate && task.endDate)
          : [];
        
        setTasks(tasksWithDates);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  // Map API status to UI status
  const mapStatusToUI = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'complete';
      case 'IN_PROGRESS':
        return 'in-progress';
      case 'IN_REVIEW':
        return 'review';
      case 'TODO':
      case 'BACKLOG':
      default:
        return 'upcoming';
    }
  };

  // Map priority to color gradient
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'from-red-500 to-red-600';
      case 'HIGH':
        return 'from-orange-500 to-orange-600';
      case 'MEDIUM':
        return 'from-blue-500 to-blue-600';
      case 'LOW':
      default:
        return 'from-green-500 to-green-600';
    }
  };

  // Calculate progress based on status
  const calculateProgress = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 100;
      case 'IN_REVIEW':
        return 80;
      case 'IN_PROGRESS':
        return 50;
      case 'TODO':
        return 25;
      case 'BACKLOG':
      default:
        return 0;
    }
  };

  // Calculate task position on timeline based on dates (pixel-based for exact alignment)
  const calculateTaskPosition = (task: Task, weeks: Array<{ label: string; date: Date }>) => {
    if (!task.startDate || !task.endDate || weeks.length === 0) return { leftPx: 0, widthPx: 0, leftPercent: 0, widthPercent: 0 };

    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    
    // Normalize to start of day
    taskStart.setHours(0, 0, 0, 0);
    taskEnd.setHours(0, 0, 0, 0);

    // Find which week columns the task starts and ends in
    let startWeekIndex = -1;
    let endWeekIndex = -1;
    let startDayOffset = 0;
    let endDayOffset = 0;
    
    for (let i = 0; i < weeks.length; i++) {
      const weekStart = new Date(weeks[i].date);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weeks[i].date);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      // Check if task start falls in this week
      if (startWeekIndex === -1 && taskStart >= weekStart && taskStart <= weekEnd) {
        startWeekIndex = i;
        // Calculate which day of the week (0=Sunday, 6=Saturday)
        startDayOffset = Math.floor((taskStart.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000));
      }
      
      // Check if task end falls in this week
      if (taskEnd >= weekStart && taskEnd <= weekEnd) {
        endWeekIndex = i;
        endDayOffset = Math.floor((taskEnd.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000));
      }
    }

    // If task extends beyond our timeline, clamp it
    if (startWeekIndex === -1) {
      startWeekIndex = 0;
      startDayOffset = 0;
    }
    if (endWeekIndex === -1) {
      endWeekIndex = weeks.length - 1;
      endDayOffset = 6;
    }

    // Calculate pixel positions (each week = 60px, each day = 60/7 ≈ 8.57px)
    const pixelsPerDay = 60 / 7;
    const leftPx = (startWeekIndex * 60) + (startDayOffset * pixelsPerDay);
    const rightPx = (endWeekIndex * 60) + ((endDayOffset + 1) * pixelsPerDay); // +1 to include the end date
    const widthPx = rightPx - leftPx;

    // Calculate percentage positions for responsive layout
    const totalWeeks = weeks.length;
    const leftPercent = ((startWeekIndex + (startDayOffset / 7)) / totalWeeks) * 100;
    const widthPercent = (((endWeekIndex - startWeekIndex) + ((endDayOffset + 1 - startDayOffset) / 7)) / totalWeeks) * 100;

    return {
      leftPx: Math.max(0, leftPx),
      widthPx: Math.max(20, widthPx), // Minimum 20px width for visibility
      leftPercent: Math.max(0, leftPercent),
      widthPercent: Math.max(2, widthPercent) // Minimum 2% width for visibility
    };
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleTaskClose = () => {
    // Refresh tasks when modal closes (handles both update and cancel)
    if (projectId) {
      api.getTasksByProject(parseInt(projectId)).then((response: any) => {
        const tasksWithDates = Array.isArray(response) 
          ? response.filter(task => task.startDate && task.endDate)
          : [];
        setTasks(tasksWithDates);
      });
    }
    setSelectedTask(null);
  };

  const handleTaskDeleted = () => {
    setSelectedTask(null);
    // Refresh tasks after deletion
    if (projectId) {
      api.getTasksByProject(parseInt(projectId)).then((response: any) => {
        const tasksWithDates = Array.isArray(response) 
          ? response.filter(task => task.startDate && task.endDate)
          : [];
        setTasks(tasksWithDates);
      });
    }
  };

  // Generate date columns based on tasks
  const generateDateColumns = () => {
    // Always include current date in timeline
    const today = new Date(2025, 10, 13); // November 13, 2025
    
    if (tasks.length === 0) {
      // Default to show weeks around current date
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 21); // 3 weeks before
      const sundayStart = new Date(startDate);
      sundayStart.setDate(startDate.getDate() - startDate.getDay()); // Go to Sunday
      
      return Array.from({ length: 18 }, (_, i) => {
        const date = new Date(sundayStart);
        date.setDate(sundayStart.getDate() + (i * 7));
        return {
          label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          date: new Date(date)
        };
      });
    }

    // Find date range including all tasks and current date
    const allDates = [
      ...tasks.flatMap(task => [new Date(task.startDate!), new Date(task.endDate!)]),
      today
    ];
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    // Start from Sunday of the week containing the minimum date
    const timelineStart = new Date(minDate);
    timelineStart.setDate(minDate.getDate() - minDate.getDay()); // Go back to Sunday
    
    // Add buffer weeks
    timelineStart.setDate(timelineStart.getDate() - 14); // 2 weeks buffer before
    
    // Calculate end date with reasonable buffer (not a full year)
    const timelineEnd = new Date(maxDate);
    timelineEnd.setDate(maxDate.getDate() + 28); // 4 weeks buffer after
    
    // Calculate total weeks needed
    const daysDiff = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.ceil(daysDiff / 7) + 2; // Add small buffer

    // Generate weekly columns starting from Sunday
    return Array.from({ length: totalWeeks }, (_, i) => {
      const date = new Date(timelineStart);
      date.setDate(timelineStart.getDate() + (i * 7));
      // For display, show the Sunday date but make it clear it represents the whole week
      const weekEndDate = new Date(date);
      weekEndDate.setDate(date.getDate() + 6);
      const label = date.getDate() <= 15 
        ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : `${date.getDate()}`;
      return {
        label,
        date: new Date(date)
      };
    });
  };

  const weeks = generateDateColumns();

  // Check if a date column represents the current week
  const isCurrentWeek = (columnDate: Date) => {
    const today = new Date(2025, 10, 13); // November 13, 2025 (month is 0-indexed)
    const weekStart = new Date(columnDate);
    const weekEnd = new Date(columnDate);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    return today >= weekStart && today <= weekEnd;
  };


  return (
    <div className="space-y-6">
        <Card className="premium-card border-0 bg-gradient-to-br from-card via-card to-card/90 shadow-premium">
        <CardContent className="p-8">
          {/* Executive Timeline Header */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/30">
            <div className="space-y-2">
              <h2 className="heading-premium">Project Timeline</h2>
              <p className="text-executive">Strategic milestone tracking and resource allocation</p>
            </div>
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-1">
                <Button
                  variant={viewMode === 'detailed' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('detailed')}
                  className="h-8 px-3 text-xs font-semibold transition-all duration-300"
                >
                  <Maximize2 className="w-3 h-3 mr-1" />
                  Detailed
                </Button>
                <Button
                  variant={viewMode === 'fit-to-screen' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('fit-to-screen')}
                  className="h-8 px-3 text-xs font-semibold transition-all duration-300"
                >
                  <Minimize2 className="w-3 h-3 mr-1" />
                  Fit to Screen
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                className="font-semibold border-border/50 hover:bg-muted/50 transition-all duration-300"
              >
                Today
              </Button>
              <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
                <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-muted/50">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-bold px-4 text-foreground">
                  {tasks.length > 0 ? weeks[0].label + ' - ' + weeks[weeks.length - 1].label : new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-muted/50">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>



          {/* Executive Timeline Grid */}
          {tasks.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/30 mb-4">
                <ChevronRight className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Tasks Yet</h3>
              <p className="text-sm text-muted-foreground">
                Create tasks with start and end dates to see them on the timeline
              </p>
            </div>
          ) : viewMode === 'detailed' ? (
            <div className="space-y-4">
              {/* Horizontal Scroll Indicator */}
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 bg-blue-50 rounded-lg py-2 px-4 border border-blue-200">
                <ChevronLeft className="w-4 h-4" />
                <span className="font-medium">Scroll horizontally to view more timeline</span>
                <ChevronRight className="w-4 h-4" />
              </div>
              
              <div className="relative bg-gradient-to-r from-muted/20 to-transparent rounded-xl p-6 overflow-x-auto">
                <div style={{ minWidth: `${Math.max(1200, weeks.length * 60 + 220)}px` }}> {/* Dynamic width: 220px for task panel + timeline width */}
                {/* Enhanced Date Headers */}
                <div className="mb-6" style={{ paddingLeft: '220px' }}>
                  {/* Month/Year Header Row */}
                  <div className="flex mb-2" style={{ minWidth: `${weeks.length * 60}px` }}>
                    {weeks.map((week, idx) => {
                      const monthYear = week.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                      const showMonthYear = idx === 0 || week.date.getDate() <= 7; // Show at start and month boundaries
                      
                      return (
                        <div key={`month-${idx}`} className="text-center" style={{ minWidth: '60px' }}>
                          {showMonthYear && (
                            <div className="text-sm font-bold text-slate-700 bg-slate-100 rounded-md py-1 mx-1">
                              {monthYear}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Date Headers Row */}
                  <div className="flex border-b-2 border-slate-200 pb-2" style={{ minWidth: `${weeks.length * 60}px` }}>
                    {weeks.map((week, idx) => {
                      const isToday = isCurrentWeek(week.date);
                      const dayOfMonth = week.date.getDate();
                      const dayName = week.date.toLocaleDateString('en-US', { weekday: 'short' });
                      
                      return (
                        <div
                          key={week.label + idx}
                          className={`text-center relative ${
                            isToday
                              ? 'bg-blue-500 text-white rounded-lg py-2 mx-1 shadow-md' 
                              : 'py-2'
                          }`}
                          style={{ minWidth: '60px' }}
                        >
                          <div className={`text-xs font-medium ${isToday ? 'text-white' : 'text-slate-600'}`}>
                            {dayName}
                          </div>
                          <div className={`text-sm font-bold ${isToday ? 'text-white' : 'text-slate-900'}`}>
                            {dayOfMonth}
                          </div>
                          {isToday && (
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rotate-45"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              {/* Executive Task Rows */}
              <div className="space-y-1">
                {tasks.map((task, taskIdx) => {
                  const progress = calculateProgress(task.status);
                  const uiStatus = mapStatusToUI(task.status);
                  const colorGradient = getPriorityColor(task.priority);
                  const position = calculateTaskPosition(task, weeks);
                  
                  return (
                  <div key={task.id} className="flex items-center gap-4 group">
                    {/* Executive Task Info Panel */}
                    <div className="premium-card border-0 bg-gradient-to-r from-card to-card/80 overflow-hidden rounded-l-lg" style={{ width: '220px' }}>
                      {/* Progress Bar at Top */}
                      <div className="relative h-2 bg-muted/30 shadow-inner overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full transition-all duration-700 shadow-sm"
                          style={{ 
                            width: `${progress}%`,
                            background: uiStatus === 'in-progress' ? 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 50%, #60a5fa 100%)' :
                                       uiStatus === 'review' ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 50%, #4ade80 100%)' :
                                       uiStatus === 'complete' ? 'linear-gradient(90deg, #eab308 0%, #ca8a04 50%, #fbbf24 100%)' :
                                       'linear-gradient(90deg, #ef4444 0%, #dc2626 50%, #f87171 100%)',
                            boxShadow: progress > 0 ? '0 0 6px rgba(59, 130, 246, 0.3)' : 'none'
                          }}
                        />
                        {/* Animated shimmer effect for active progress */}
                        {progress > 0 && progress < 100 && (
                          <div 
                            className="absolute top-0 left-0 h-full opacity-30"
                            style={{
                              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                              animation: 'shimmer 2s infinite',
                              width: `${progress}%`,
                            }}
                          />
                        )}
                      </div>
                      
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-foreground truncate">{task.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-600">
                                {new Date(task.startDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                {' - '}
                                {new Date(task.endDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">{progress}%</span>
                            <div className={`w-2 h-2 rounded-full ${
                              uiStatus === 'complete' ? 'bg-green-500' : 
                              uiStatus === 'in-progress' ? 'bg-blue-500' : 
                              uiStatus === 'review' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Executive Timeline Bar */}
                    <div className="relative h-16 flex items-center bg-slate-50 border border-slate-200 rounded-r-lg border-l-0" style={{ width: `${weeks.length * 60}px` }}>
                      {/* Grid Lines with Date Markers */}
                      <div className="absolute inset-0 flex rounded-lg overflow-hidden">
                        {weeks.map((week, idx) => (
                          <div
                            key={week.label + idx}
                            className={`border-r relative ${
                              idx === 0 ? "border-l" : ""
                            } ${isCurrentWeek(week.date) 
                              ? 'border-blue-400 bg-blue-100' 
                              : idx % 4 === 0 
                              ? 'border-slate-300 bg-slate-100' 
                              : 'border-slate-200'
                            }`}
                            style={{ width: '60px' }}
                          >
                            {/* Today indicator */}
                            {isCurrentWeek(week.date) && (
                              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-500"></div>
                            )}
                            {/* Major date markers */}
                            {idx % 4 === 0 && (
                              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-xs font-bold text-slate-600 bg-white px-1 rounded shadow-sm">
                                {week.date.getDate()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Premium Progress Bar with Tooltip */}
                      <TooltipProvider>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <div
                              className="absolute h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5"
                              style={{
                                left: `${position.leftPx}px`,
                                width: `${position.widthPx}px`,
                              }}
                              onClick={() => handleTaskClick(task)}
                            >
                              <div className={`h-full rounded-xl bg-gradient-to-r ${colorGradient} flex items-center justify-between px-4 shadow-lg border border-white/20 relative overflow-hidden`}>
                                {/* Start Date Marker */}
                                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md z-20 border-2 border-current">
                                  <div className="w-1 h-1 rounded-full bg-current"></div>
                                </div>
                                
                                <div className="flex items-center gap-2 z-10">
                                  <span className="text-white text-xs font-bold tracking-wide">
                                    {new Date(task.startDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                  <div className="w-px h-4 bg-white/40"></div>
                                  <span className="text-white text-xs font-bold tracking-wide">
                                    {progress}%
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2 z-10">
                                  <span className="text-white text-xs font-bold tracking-wide">
                                    {new Date(task.endDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                                
                                {/* End Date Marker */}
                                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md z-20 border-2 border-current">
                                  <div className="w-1 h-1 rounded-full bg-current"></div>
                                </div>
                                
                                {/* Enhanced Progress Fill */}
                                <div 
                                  className="absolute top-0 left-0 h-full rounded-xl transition-all duration-800"
                                  style={{ 
                                    width: `${progress}%`,
                                    background: uiStatus === 'in-progress' ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.3) 0%, rgba(29, 78, 216, 0.3) 50%, rgba(96, 165, 250, 0.3) 100%)' :
                                               uiStatus === 'review' ? 'linear-gradient(90deg, rgba(34, 197, 94, 0.3) 0%, rgba(22, 163, 74, 0.3) 50%, rgba(74, 222, 128, 0.3) 100%)' :
                                               uiStatus === 'complete' ? 'linear-gradient(90deg, rgba(234, 179, 8, 0.3) 0%, rgba(202, 138, 4, 0.3) 50%, rgba(251, 191, 36, 0.3) 100%)' :
                                               'linear-gradient(90deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.3) 50%, rgba(248, 113, 113, 0.3) 100%)',
                                  }}
                                />
                                
                                {/* Animated shimmer effect for active progress */}
                                {progress > 0 && progress < 100 && (
                                  <div 
                                    className="absolute top-0 left-0 h-full opacity-40"
                                    style={{
                                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
                                      animation: 'shimmer 3s infinite',
                                      width: `${progress}%`,
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs p-3 bg-popover border border-border shadow-xl">
                            <div className="space-y-2">
                              <div className="font-semibold text-sm">{task.title}</div>
                              {task.description && (
                                <div className="text-xs text-muted-foreground line-clamp-2">{task.description}</div>
                              )}
                              <div className="flex items-center gap-2 text-xs">
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {task.priority}
                                </Badge>
                                <span className="text-muted-foreground">{uiStatus}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(task.startDate!).toLocaleDateString()} - {new Date(task.endDate!).toLocaleDateString()}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  );
                })}
              </div>
              
              </div> {/* Close wide container */}
            </div> {/* Close horizontal scroll container */}
            </div> 
          ) : (
            /* Fit to Screen View */
            <div className="relative bg-gradient-to-r from-muted/20 to-transparent rounded-xl p-6 overflow-hidden">
              {/* Enhanced Compact Headers */}
              <div className="mb-4 pl-[140px]">
                {/* Compact Date Headers */}
                <div className="flex border-b border-slate-200 pb-2">
                  {weeks.map((week, idx) => {
                    const isToday = isCurrentWeek(week.date);
                    const dayOfMonth = week.date.getDate();
                    
                    return (
                      <div
                        key={week.label + idx}
                        className={`flex-1 text-center text-xs font-bold tracking-wider ${
                          isToday
                            ? 'bg-blue-500 text-white rounded-md py-1 mx-0.5' 
                            : idx % 3 === 0 
                            ? 'text-slate-900 bg-slate-100 rounded-md py-1 mx-0.5' 
                            : 'text-slate-600 py-1'
                        }`}
                      >
                        <div>{dayOfMonth}</div>
                        <div className={`text-[10px] ${isToday ? 'text-white' : 'text-slate-500'}`}>
                          {week.date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Compact Task Rows */}
              <div className="space-y-0.5 max-h-[60vh] overflow-y-auto">
                {tasks.map((task, taskIdx) => {
                  const progress = calculateProgress(task.status);
                  const uiStatus = mapStatusToUI(task.status);
                  const colorGradient = getPriorityColor(task.priority);
                  const position = calculateTaskPosition(task, weeks);
                  
                  return (
                    <div key={task.id} className="flex items-center gap-3 group">
                      {/* Compact Task Info Panel */}
                      <div className="w-32 premium-card border-0 bg-gradient-to-r from-card to-card/80 overflow-hidden rounded-l-md">
                        {/* Progress Bar at Top */}
                        <div className="relative h-1.5 bg-muted/30 shadow-inner overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full transition-all duration-700 shadow-sm"
                            style={{ 
                              width: `${progress}%`,
                              background: uiStatus === 'in-progress' ? 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 50%, #60a5fa 100%)' :
                                         uiStatus === 'review' ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 50%, #4ade80 100%)' :
                                         uiStatus === 'complete' ? 'linear-gradient(90deg, #eab308 0%, #ca8a04 50%, #fbbf24 100%)' :
                                         'linear-gradient(90deg, #ef4444 0%, #dc2626 50%, #f87171 100%)',
                              boxShadow: progress > 0 ? '0 0 4px rgba(59, 130, 246, 0.2)' : 'none'
                            }}
                          />
                          {/* Animated shimmer effect for active progress */}
                          {progress > 0 && progress < 100 && (
                            <div 
                              className="absolute top-0 left-0 h-full opacity-25"
                              style={{
                                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                                animation: 'shimmer 2s infinite',
                                width: `${progress}%`,
                              }}
                            />
                          )}
                        </div>
                        
                        <div className="p-2">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-foreground truncate">{task.title}</h4>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-foreground">{progress}%</span>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                uiStatus === 'complete' ? 'bg-green-500' : 
                                uiStatus === 'in-progress' ? 'bg-blue-500' : 
                                uiStatus === 'review' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Compact Timeline Bar */}
                      <div className="flex-1 relative h-10 flex items-center bg-slate-50 border border-slate-200 rounded-r-md border-l-0">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 grid grid-cols-18">
                          {weeks.map((week, idx) => (
                            <div
                              key={week.label + idx}
                              className={`border-r ${
                                idx === 0 ? "border-l" : ""
                              } ${isCurrentWeek(week.date)
                                ? 'border-primary bg-primary/5'
                                : idx % 6 === 0 
                                ? 'border-slate-300' 
                                : 'border-slate-200'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Compact Progress Bar with Tooltip */}
                        <TooltipProvider>
                          <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                              <div
                                className="absolute h-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group-hover:scale-105"
                                style={{
                                  left: `${position.leftPercent}%`,
                                  width: `${position.widthPercent}%`,
                                }}
                                onClick={() => handleTaskClick(task)}
                              >
                                <div className={`h-full rounded-lg bg-gradient-to-r ${colorGradient} flex items-center justify-center px-2 shadow-md border border-white/20 relative overflow-hidden`}>
                                  <span className="text-white text-xs font-bold tracking-wide z-10">
                                    {progress}%
                                  </span>
                                  
                                  {/* Enhanced Progress Fill */}
                                  <div 
                                    className="absolute top-0 left-0 h-full rounded-lg transition-all duration-800"
                                    style={{ 
                                      width: `${progress}%`,
                                      background: uiStatus === 'in-progress' ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.4) 0%, rgba(29, 78, 216, 0.4) 50%, rgba(96, 165, 250, 0.4) 100%)' :
                                                 uiStatus === 'review' ? 'linear-gradient(90deg, rgba(34, 197, 94, 0.4) 0%, rgba(22, 163, 74, 0.4) 50%, rgba(74, 222, 128, 0.4) 100%)' :
                                                 uiStatus === 'complete' ? 'linear-gradient(90deg, rgba(234, 179, 8, 0.4) 0%, rgba(202, 138, 4, 0.4) 50%, rgba(251, 191, 36, 0.4) 100%)' :
                                                 'linear-gradient(90deg, rgba(239, 68, 68, 0.4) 0%, rgba(220, 38, 38, 0.4) 50%, rgba(248, 113, 113, 0.4) 100%)',
                                    }}
                                  />
                                  
                                  {/* Animated shimmer effect for active progress */}
                                  {progress > 0 && progress < 100 && (
                                    <div 
                                      className="absolute top-0 left-0 h-full opacity-50"
                                      style={{
                                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
                                        animation: 'shimmer 2.5s infinite',
                                        width: `${progress}%`,
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs p-3 bg-popover border border-border shadow-xl">
                              <div className="space-y-2">
                                <div className="font-semibold text-sm">{task.title}</div>
                                {task.description && (
                                  <div className="text-xs text-muted-foreground line-clamp-2">{task.description}</div>
                                )}
                                <div className="flex items-center gap-2 text-xs">
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                    {task.priority}
                                  </Badge>
                                  <span className="text-muted-foreground">{uiStatus}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(task.startDate!).toLocaleDateString()} - {new Date(task.endDate!).toLocaleDateString()}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Task Modal */}
      {selectedTask !== null && (
        <TaskModal
          task={selectedTask}
          open={selectedTask !== null}
          onClose={handleTaskClose}
          onDelete={handleTaskDeleted}
          projectMembers={projectMembers}
        />
      )}
      
      {/* CSS Animation Keyframes */}
      <style>
        {`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}
      </style>
    </div>
  );
};

export default TimelineView;
