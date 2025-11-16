import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  Activity,
  Target,
  ArrowUpRight,
  Layers,
  RefreshCw,
  Plus,
  Settings,
  X,
  Check
} from "lucide-react";
import MemberDetailModal from "./MemberDetailModal";
import { api } from "@/lib/api";
import { Task, CustomColumn } from "@/lib/api";
import { useProjectTasks, useCustomColumns, useProjectActivities } from "@/hooks/useProjectData";

interface ProjectOverviewProps {
  project: any;
  workflowType?: "auto-sync" | "custom";
  onNavigateToBoard?: () => void;
}

interface TeamMember {
  id: number;
  name: string;
  avatar?: string;
  email: string;
  role: string;
  joinDate: string;
  description: string;
  assignedTasks: Array<{
    id: number;
    title: string;
    status: string;
    priority: string;
    dueDate: string;
  }>;
}

const ProjectOverview = ({ project, workflowType = "auto-sync", onNavigateToBoard }: ProjectOverviewProps) => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedColumnIds, setSelectedColumnIds] = useState<Set<number>>(new Set());
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);

  // Functions to save/load column preferences
  const getStorageKey = () => `taskify_column_selection_${project.id}`;

  const saveColumnPreferences = (columnIds: Set<number>) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(Array.from(columnIds)));
    } catch (error) {
    }
  };

  const loadColumnPreferences = (): Set<number> | null => {
    try {
      const saved = localStorage.getItem(getStorageKey());
      if (saved) {
        const ids = JSON.parse(saved);
        return new Set(ids);
      }
    } catch (error) {
    }
    return null;
  };

  // Function to fetch activities
  const fetchActivities = async () => {
    try {
      const activitiesResponse: any = await api.getProjectActivities(project.id, 10);
      setActivities(activitiesResponse?.activities || []);
    } catch (error) {
      setActivities([]);
    }
  };

  // Fetch tasks and custom columns when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch tasks
        const tasksResponse: any = await api.getTasksByProject(project.id);
        setTasks(Array.isArray(tasksResponse) ? tasksResponse : []);
        
        // Fetch custom columns if it's a custom workflow
        if (workflowType === "custom") {
          try {
            const columnsResponse: any = await api.getCustomColumns(project.id);
            const columnsArray = Array.isArray(columnsResponse) ? columnsResponse : columnsResponse?.columns || [];
            setCustomColumns(columnsArray);
            
            // Load saved preferences or show all columns by default
            const savedSelection = loadColumnPreferences();
            if (savedSelection && savedSelection.size > 0) {
              // Filter saved selection to only include existing columns
              const validColumnIds = new Set<number>(
                Array.from(savedSelection).filter(id => 
                  columnsArray.some((col: any) => col.id === id)
                )
              );
              setSelectedColumnIds(validColumnIds);
            } else {
              // Initially show all columns if no saved preferences
              const allColumnIds = new Set<number>(columnsArray.map((col: any) => col.id as number));
              setSelectedColumnIds(allColumnIds);
              saveColumnPreferences(allColumnIds);
            }
          } catch (error) {
            setCustomColumns([]);
          }
        }
        
        // Fetch recent activities
        await fetchActivities();
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [project.id, workflowType]);

  // Periodically refresh activities every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchActivities();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [project.id]);

  // Calculate stats from real task data
  const stats = {
    totalTasks: tasks.length,
    completed: tasks.filter(t => t.status === "COMPLETED").length,
    inProgress: tasks.filter(t => t.status === "IN_PROGRESS").length,
    overdue: tasks.filter(t => {
      if (!t.endDate) return false;
      return new Date(t.endDate) < new Date() && t.status !== "COMPLETED";
    }).length,
  };

  const progress = stats.totalTasks > 0 ? (stats.completed / stats.totalTasks) * 100 : 0;

  // Calculate team velocity (tasks completed per day)
  const calculateVelocity = () => {
    if (tasks.length === 0) return "0";
    
    const projectStart = new Date(project.createdAt);
    const today = new Date();
    const daysSinceStart = Math.max(1, Math.ceil((today.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)));
    
    return (stats.completed / daysSinceStart).toFixed(1);
  };

  // Estimate completion date based on velocity
  const estimateCompletion = () => {
    const velocity = parseFloat(calculateVelocity());
    if (velocity === 0 || stats.totalTasks === stats.completed) return null;
    
    const remainingTasks = stats.totalTasks - stats.completed;
    const daysRemaining = Math.ceil(remainingTasks / velocity);
    
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysRemaining);
    
    return completionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Helper function to map column title to valid TaskStatus enum
  const mapColumnTitleToStatus = (columnTitle: string): string => {
    // Map common column titles to valid enum values
    const titleLower = columnTitle.toLowerCase().trim();
    
    if (titleLower.includes('to do') || titleLower === 'todo' || titleLower === 'backlog') {
      return 'TODO';
    }
    if (titleLower.includes('in progress') || titleLower === 'doing' || titleLower === 'in development') {
      return 'IN_PROGRESS';
    }
    if (titleLower.includes('review') || titleLower === 'in review') {
      return 'IN_REVIEW';
    }
    if (titleLower.includes('done') || titleLower === 'complete' || titleLower === 'completed' || titleLower === 'finished') {
      return 'COMPLETED';
    }
    if (titleLower.includes('block') || titleLower === 'blocked' || titleLower === 'on hold') {
      return 'BLOCKED';
    }
    
    // Default fallback to TODO for any other custom column
    return 'TODO';
  };

  // Group tasks by column. For custom workflows we store columnId on tasks.
  const getTasksByColumn = (column: CustomColumn) => {
    if (workflowType === 'custom') {
      // Filter by columnId (stored as string) for custom workflows
      return tasks.filter(task => task.columnId === String(column.id));
    }

    // Fallback for auto-sync workflows: map column title to status
    const statusValue = mapColumnTitleToStatus(column.title);
    return tasks.filter(task => task.status === statusValue);
  };

  // Get color class for column
  const getColumnColorClass = (color: string) => {
    const colorMap: Record<string, { bg: string; border: string; text: string; icon: string }> = {
      slate: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', icon: 'bg-slate-100' },
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'bg-blue-100' },
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'bg-green-100' },
      yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: 'bg-yellow-100' },
      red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'bg-red-100' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'bg-purple-100' },
    };
    return colorMap[color] || colorMap.slate;
  };

  // Handle column selection for overview display
  const toggleColumnSelection = (columnId: number) => {
    const newSelection = new Set(selectedColumnIds);
    if (newSelection.has(columnId)) {
      newSelection.delete(columnId);
    } else {
      newSelection.add(columnId);
    }
    setSelectedColumnIds(newSelection);
    saveColumnPreferences(newSelection);
  };

  const selectAllColumns = () => {
    const allColumnIds = new Set(customColumns.map(col => col.id));
    setSelectedColumnIds(allColumnIds);
    saveColumnPreferences(allColumnIds);
  };

  const deselectAllColumns = () => {
    const emptySet = new Set<number>();
    setSelectedColumnIds(emptySet);
    saveColumnPreferences(emptySet);
  };

  // Get filtered columns for display
  const displayedColumns = customColumns.filter(col => selectedColumnIds.has(col.id));

  // Determine theme colors based on workflow type
  const handleMemberClick = (memberId: number) => {
    // TODO: Fetch member details from API
    setIsMemberModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Quick Stats Grid - Only for Auto-Sync workflow */}
      {workflowType === "auto-sync" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">In Progress</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.inProgress}</p>
                  <p className="text-xs text-slate-500">Active tasks</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Completed</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.completed}</p>
                  <p className="text-xs text-slate-500">{Math.round(progress)}% of total</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Overdue</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.overdue}</p>
                  <p className="text-xs text-slate-500">Need attention</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Total Tasks</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalTasks}</p>
                  <p className="text-xs text-slate-500">All work items</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center">
                  <Target className="w-5 h-5 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Simple Task Stats for Custom Workflow */}
      {workflowType === "custom" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Total Tasks</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalTasks}</p>
                  <p className="text-xs text-slate-500">All work items</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Workflow Stages</p>
                  <p className="text-3xl font-bold text-slate-900">{customColumns.length}</p>
                  <p className="text-xs text-slate-500">Custom columns</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Team Size</p>
                  <p className="text-3xl font-bold text-slate-900">{project.members?.length || 0}</p>
                  <p className="text-xs text-slate-500">Active members</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Custom Workflow Status Section */}
      {workflowType === "custom" && customColumns.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Workflow Status</h3>
              <p className="text-sm text-slate-600">
                {displayedColumns.length === 0 
                  ? "No stages selected for display" 
                  : `Showing ${displayedColumns.length} of ${customColumns.length} stages`
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {displayedColumns.length}/{customColumns.length} stages
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsColumnSelectorOpen(true)}
                className="h-8 px-2"
              >
                <Settings className="w-4 h-4 mr-1" />
                Customize
              </Button>
            </div>
          </div>
          
          {displayedColumns.length === 0 ? (
            <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
              <CardContent className="p-8">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mx-auto">
                    <Settings className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">
                      No Stages Selected
                    </h3>
                    <p className="text-xs text-slate-600">
                      Click "Customize" to choose which workflow stages to display
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayedColumns
                .sort((a, b) => a.order - b.order)
                .map((column) => {
                const columnTasks = getTasksByColumn(column);
                const colors = getColumnColorClass(column.color);

                return (
                  <Card 
                    key={column.id} 
                    className={`border-2 ${colors.border} ${colors.bg} hover:shadow-md transition-all duration-200 cursor-pointer group`}
                  >
                    <CardContent className="p-5">
                      <div className="space-y-3">
                        {/* Icon and Title */}
                        <div className="flex items-start justify-between">
                          <div className={`w-10 h-10 rounded-lg ${colors.icon} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <Layers className={`w-5 h-5 ${colors.text}`} />
                          </div>
                        </div>

                        {/* Column Name */}
                        <div>
                          <h4 className={`text-sm font-semibold ${colors.text} truncate`}>
                            {column.title}
                          </h4>
                        </div>

                        {/* Task Count */}
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-slate-900">
                              {columnTasks.length}
                            </span>
                            <span className="text-sm text-slate-500">
                              {columnTasks.length === 1 ? "task" : "tasks"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Empty State for Custom Workflow with No Columns */}
      {workflowType === "custom" && customColumns.length === 0 && !loading && (
        <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
          <CardContent className="p-12">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                  <Layers className="w-8 h-8 text-slate-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No Workflow Columns Yet
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Create columns in the Board tab to start tracking your workflow progress here
                </p>
              </div>
              <Button variant="outline" className="mt-4" onClick={onNavigateToBoard}>
                Go to Board →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Show Progress Card only for Auto-Sync workflow */}
          {workflowType === "auto-sync" && (
            <Card className="border-0 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">Overall Progress</CardTitle>
                    <CardDescription className="text-sm text-slate-600 mt-1">
                      Project Completion
                    </CardDescription>
                  </div>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-semibold">
                    {stats.completed} / {stats.totalTasks} tasks
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-3">
                  <Progress value={progress} className="h-3 rounded-full" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">
                      {Math.round(progress)}% Complete
                    </span>
                    <span className="text-slate-500">
                      {stats.totalTasks - stats.completed} remaining
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {stats.totalTasks === 0 ? "Get started!" : progress >= 75 ? "Great progress!" : progress >= 50 ? "Keep it up!" : "Just getting started"}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {stats.totalTasks === 0 
                          ? "Create your first task to start tracking progress." 
                          : progress >= 75
                          ? "You're almost there! Keep up the momentum to reach your project goals."
                          : progress >= 50
                          ? "Halfway there! The team is making solid progress."
                          : "Keep going! Every completed task brings you closer to your goals."}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Show Task Overview Card for Custom workflow */}
          {workflowType === "custom" && (
            <Card className="border-0 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">Task Overview</CardTitle>
                    <CardDescription className="text-sm text-slate-600 mt-1">
                      Current work distribution
                    </CardDescription>
                  </div>
                  <Badge className="bg-purple-50 text-purple-700 border-purple-200 font-semibold">
                    {stats.totalTasks} total tasks
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Layers className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {stats.totalTasks === 0 ? "Ready to start!" : customColumns.length === 0 ? "Create your workflow!" : "Workflow active"}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {stats.totalTasks === 0 
                          ? "Create your first task and organize it in your custom workflow." 
                          : customColumns.length === 0
                          ? "Set up your custom columns in the Board tab to organize your work."
                          : `Tasks are organized across ${customColumns.length} custom workflow stages.`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity Card */}
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900">Recent Activity</CardTitle>
                  <CardDescription className="text-sm text-slate-600 mt-1">
                    Stay up to date with what's happening across the space
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchActivities}
                  className="h-8 w-8 p-0 hover:bg-slate-100"
                  title="Refresh activities"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {activities.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-slate-700">{activity.description}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Team Members Card */}
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-900">Team Members</CardTitle>
                <Users className="w-5 h-5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {!project.members || project.members.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">No team members yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {project.members.map((member: any) => {
                    const memberName = member.user?.name || member.name || 'Unknown';
                    const memberId = member.user?.id || member.id;
                    
                    return (
                      <div
                        key={memberId}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-all cursor-pointer group border border-transparent hover:border-slate-200"
                        onClick={() => handleMemberClick(memberId)}
                      >
                        <Avatar className="w-10 h-10 group-hover:ring-2 group-hover:ring-blue-500/20 transition-all">
                          <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-semibold">
                            {memberName
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {memberName}
                          </p>
                          <p className="text-xs text-slate-500">{member.role || 'Member'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Insights Card - Auto-Sync workflow */}
          {workflowType === "auto-sync" && (
            <Card className="border-0 bg-gradient-to-br from-slate-50 to-blue-50 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                  </div>
                  <CardTitle className="text-base font-semibold text-slate-900">Project Insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-white/80 backdrop-blur rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-600">Completion Rate</span>
                    <span className="text-xs font-bold text-slate-400">
                      {stats.totalTasks > 0 ? (progress >= 50 ? "↑" : "→") : "--"}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{Math.round(progress)}%</p>
                </div>
                
                <div className="p-3 bg-white/80 backdrop-blur rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-600">Team Velocity</span>
                    <span className="text-xs font-bold text-slate-400">
                      {tasks.length > 0 ? "→" : "--"}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{calculateVelocity()}</p>
                  <p className="text-xs text-slate-500 mt-1">tasks/day average</p>
                </div>

                <div className="p-3 bg-white/80 backdrop-blur rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-600">Est. Completion</span>
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <p className="text-base font-bold text-slate-900">
                    {estimateCompletion() || "--"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {estimateCompletion() ? "Based on current pace" : "No data yet"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}


        </div>
      </div>

      {/* Column Selector Modal */}
      {isColumnSelectorOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Customize Workflow Display</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsColumnSelectorOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="text-sm text-slate-600 mb-4">
                Choose which workflow stages to display on the overview
              </p>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {customColumns.map((column) => {
                  const colors = getColumnColorClass(column.color);
                  const isSelected = selectedColumnIds.has(column.id);
                  
                  return (
                    <div
                      key={column.id}
                      onClick={() => toggleColumnSelection(column.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected 
                          ? `${colors.bg} ${colors.border} border-2` 
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-green-500' : 'border-2 border-slate-300'} flex items-center justify-center`}>
                        {isSelected && <Check className="w-2 h-2 text-white" />}
                      </div>
                      <div className={`w-8 h-8 rounded-lg ${colors.icon} flex items-center justify-center`}>
                        <Layers className={`w-4 h-4 ${colors.text}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isSelected ? colors.text : 'text-slate-700'}`}>
                          {column.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {getTasksByColumn(column).length} tasks
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAllColumns}
                    className="text-xs"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={deselectAllColumns}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                </div>
                <Button
                  onClick={() => setIsColumnSelectorOpen(false)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member Detail Modal */}
      <MemberDetailModal
        member={selectedMember}
        isOpen={isMemberModalOpen}
        onOpenChange={setIsMemberModalOpen}
      />
    </div>
  );
};

export default ProjectOverview;
