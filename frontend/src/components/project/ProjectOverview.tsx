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
  ArrowUpRight
} from "lucide-react";
import MemberDetailModal from "./MemberDetailModal";
import { api, Task } from "@/lib/api";

interface ProjectOverviewProps {
  project: any;
  workflowType?: "auto-sync" | "custom";
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

const ProjectOverview = ({ project, workflowType = "auto-sync" }: ProjectOverviewProps) => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tasks when component mounts
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response: any = await api.getTasksByProject(project.id);
        console.log("ProjectOverview - Fetched tasks:", response);
        // Response is directly an array of tasks
        setTasks(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
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

  // Determine theme colors based on workflow type
  const handleMemberClick = (memberId: number) => {
    // TODO: Fetch member details from API
    setIsMemberModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Quick Stats Grid - Jira Style */}
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overall Progress Card */}
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
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-slate-500">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recent activity</p>
              </div>
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
              <div className="space-y-3">
                {project.members.map((member: any) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-all cursor-pointer group border border-transparent hover:border-slate-200"
                    onClick={() => handleMemberClick(member.id)}
                  >
                    <Avatar className="w-10 h-10 group-hover:ring-2 group-hover:ring-blue-500/20 transition-all">
                      <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-semibold">
                        {member.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {member.name}
                      </p>
                      <p className="text-xs text-slate-500">Member</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Project Insights Card */}
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
        </div>
      </div>

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
