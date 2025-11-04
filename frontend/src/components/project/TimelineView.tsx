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

  // Calculate task position on timeline based on dates
  const calculateTaskPosition = (task: Task, weeks: Array<{ label: string; date: Date }>) => {
    if (!task.startDate || !task.endDate || weeks.length === 0) return { left: 0, width: 0 };

    const timelineStart = weeks[0].date;
    const timelineEnd = new Date(weeks[weeks.length - 1].date);
    timelineEnd.setDate(timelineEnd.getDate() + 7); // Add 7 days to get end of last week

    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);

    // Calculate total timeline duration in days
    const totalTimelineDays = Math.floor((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate days from timeline start to task start
    const daysSinceTimelineStart = Math.floor((taskStart.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate task duration in days
    const taskDuration = Math.floor((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)) + 1; // +1 to include end date

    // Calculate percentages
    const left = (daysSinceTimelineStart / totalTimelineDays) * 100;
    const width = (taskDuration / totalTimelineDays) * 100;

    return {
      left: Math.max(0, Math.min(left, 95)),
      width: Math.max(2, Math.min(width, 100 - left))
    };
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleTaskUpdated = () => {
    // Refresh tasks after update
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
    if (tasks.length === 0) {
      // Default to current month if no tasks
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return Array.from({ length: 18 }, (_, i) => {
        const date = new Date(startOfMonth);
        date.setDate(startOfMonth.getDate() + (i * 7)); // Weekly intervals
        return {
          label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          date: new Date(date)
        };
      });
    }

    // Find earliest start date and latest end date
    const allDates = tasks.flatMap(task => [
      new Date(task.startDate!),
      new Date(task.endDate!)
    ]);
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    // Calculate number of weeks needed
    const daysDiff = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    const weeksNeeded = Math.max(18, Math.ceil(daysDiff / 7) + 2); // Add buffer

    // Generate weekly date labels with actual date objects
    return Array.from({ length: Math.min(weeksNeeded, 24) }, (_, i) => {
      const date = new Date(minDate);
      date.setDate(minDate.getDate() + (i * 7));
      return {
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        date: new Date(date)
      };
    });
  };

  const weeks = generateDateColumns();

  // Check if a date column represents the current week
  const isCurrentWeek = (columnDate: Date) => {
    const today = new Date();
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
            <div className="relative bg-gradient-to-r from-muted/20 to-transparent rounded-xl p-6">
              {/* Premium Week Headers */}
              <div className="flex mb-6 pl-[280px]">
                {weeks.map((week, idx) => (
                  <div
                    key={week.label + idx}
                    className={`flex-1 text-center text-xs font-bold tracking-wider ${
                      isCurrentWeek(week.date) 
                        ? 'text-primary bg-primary/10 rounded-lg py-1' 
                        : idx % 2 === 0 
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    {week.label}
                  </div>
                ))}
              </div>

              {/* Executive Task Rows */}
              <div className="space-y-3">
                {tasks.map((task, taskIdx) => {
                  const progress = calculateProgress(task.status);
                  const uiStatus = mapStatusToUI(task.status);
                  const colorGradient = getPriorityColor(task.priority);
                  const position = calculateTaskPosition(task, weeks);
                  
                  return (
                  <div key={task.id} className="flex items-center gap-6 group">
                    {/* Executive Task Info Panel */}
                    <div className="w-64 premium-card border-0 bg-gradient-to-r from-card to-card/80 overflow-hidden">
                      {/* Progress Bar at Top */}
                      <div className="relative h-1 bg-muted/30">
                        <div
                          className="absolute top-0 left-0 h-1 bg-gradient-to-r from-primary to-accent transition-all duration-700"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      
                      <div className="p-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-foreground truncate">{task.title}</h4>
                            <p className="text-[9px] text-muted-foreground font-medium tracking-wide mt-0.5">
                              {task.priority} PRIORITY
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-foreground">{progress}%</div>
                            <div className={`w-2.5 h-2.5 rounded-full mt-0.5 mx-auto ${
                              uiStatus === 'complete' ? 'bg-success' : 
                              uiStatus === 'in-progress' ? 'bg-accent' : 
                              uiStatus === 'review' ? 'bg-warning' : 'bg-primary'
                            } shadow-md`}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Executive Timeline Bar */}
                    <div className="flex-1 relative h-12 flex items-center">
                      {/* Grid Lines */}
                      <div className="absolute inset-0 grid grid-cols-18">
                        {weeks.map((week, idx) => (
                          <div
                            key={week.label + idx}
                            className={`border-r ${
                              idx === 0 ? "border-l" : ""
                            } ${isCurrentWeek(week.date) 
                              ? 'border-primary bg-primary/5' 
                              : idx % 4 === 0 
                              ? 'border-slate-300' 
                              : 'border-slate-200'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Premium Progress Bar with Tooltip */}
                      <TooltipProvider>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <div
                              className="absolute h-10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer group-hover:scale-105 group-hover:-translate-y-1"
                              style={{
                                left: `${position.left}%`,
                                width: `${position.width}%`,
                              }}
                              onClick={() => handleTaskClick(task)}
                            >
                              <div className={`h-full rounded-xl bg-gradient-to-r ${colorGradient} flex items-center justify-between px-4 shadow-lg border border-white/20`}>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-white/80"></div>
                                  <span className="text-white text-xs font-bold tracking-wide">
                                    {progress}%
                                  </span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-white/80" />
                              </div>
                              {/* Progress Fill */}
                              <div 
                                className="absolute top-0 left-0 h-full rounded-xl bg-gradient-to-r from-white/20 to-transparent transition-all duration-700"
                                style={{ width: `${progress}%` }}
                              ></div>
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
          ) : (
            /* Fit to Screen View */
            <div className="relative bg-gradient-to-r from-muted/20 to-transparent rounded-xl p-6 overflow-hidden">
              {/* Compact Week Headers */}
              <div className="flex mb-4 pl-[176px]">
                {weeks.map((week, idx) => (
                  <div
                    key={week.label + idx}
                    className={`flex-1 text-center text-xs font-bold tracking-wider ${
                      isCurrentWeek(week.date)
                        ? 'text-primary bg-primary/10 rounded-lg py-1'
                        : idx % 3 === 0 
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    {week.label}
                  </div>
                ))}
              </div>

              {/* Compact Task Rows */}
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {tasks.map((task, taskIdx) => {
                  const progress = calculateProgress(task.status);
                  const uiStatus = mapStatusToUI(task.status);
                  const colorGradient = getPriorityColor(task.priority);
                  const position = calculateTaskPosition(task, weeks);
                  
                  return (
                    <div key={task.id} className="flex items-center gap-4 group">
                      {/* Compact Task Info Panel */}
                      <div className="w-40 premium-card border-0 bg-gradient-to-r from-card to-card/80 overflow-hidden">
                        {/* Progress Bar at Top */}
                        <div className="relative h-1 bg-muted/30">
                          <div
                            className="absolute top-0 left-0 h-1 bg-gradient-to-r from-primary to-accent transition-all duration-700"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        
                        <div className="p-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-foreground truncate">{task.title}</h4>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Badge 
                                  variant="outline" 
                                  className={`text-[9px] px-1 py-0 h-3.5 font-medium ${
                                    task.priority === 'URGENT' || task.priority === 'HIGH' ? 'border-red-300 text-red-600' :
                                    task.priority === 'MEDIUM' ? 'border-yellow-300 text-yellow-600' :
                                    'border-green-300 text-green-600'
                                  }`}
                                >
                                  {task.priority.charAt(0).toUpperCase()}
                                </Badge>
                                <span className="text-xs font-semibold text-foreground">{progress}%</span>
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  uiStatus === 'complete' ? 'bg-success' : 
                                  uiStatus === 'in-progress' ? 'bg-accent' : 
                                  uiStatus === 'review' ? 'bg-warning' : 'bg-primary'
                                } shadow-sm`}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Compact Timeline Bar */}
                      <div className="flex-1 relative h-8 flex items-center">
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
                                className="absolute h-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group-hover:scale-105"
                                style={{
                                  left: `${position.left}%`,
                                  width: `${position.width}%`,
                                }}
                                onClick={() => handleTaskClick(task)}
                              >
                                <div className={`h-full rounded-lg bg-gradient-to-r ${colorGradient} flex items-center justify-center px-2 shadow-md border border-white/20`}>
                                  <span className="text-white text-xs font-bold tracking-wide">
                                    {progress}%
                                  </span>
                                </div>
                                {/* Progress Fill */}
                                <div 
                                  className="absolute top-0 left-0 h-full rounded-lg bg-gradient-to-r from-white/20 to-transparent transition-all duration-500"
                                  style={{ width: `${progress}%` }}
                                ></div>
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
          onClose={() => setSelectedTask(null)}
          projectMembers={projectMembers}
        />
      )}
    </div>
  );
};

export default TimelineView;
