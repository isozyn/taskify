import { useState } from "react";
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

  // Determine theme colors based on workflow type
  const themeColors = {
    primary: workflowType === "custom" ? "purple" : "blue",
    gradientFrom: workflowType === "custom" ? "from-purple-500" : "from-blue-500",
    gradientTo: workflowType === "custom" ? "to-purple-600" : "to-blue-600",
    text: workflowType === "custom" ? "text-purple-600" : "text-blue-600",
    hover: workflowType === "custom" ? "hover:border-purple-300" : "hover:border-blue-300",
    ring: workflowType === "custom" ? "group-hover:ring-purple-300" : "group-hover:ring-blue-300",
    hoverText: workflowType === "custom" ? "group-hover:text-purple-600" : "group-hover:text-blue-600",
    bg: workflowType === "custom" ? "bg-purple-600" : "bg-blue-600",
    progressFrom: workflowType === "custom" ? "from-purple-500" : "from-blue-500",
    progressTo: workflowType === "custom" ? "to-purple-600" : "to-blue-600",
  };

  // Mock detailed member data - will be replaced with real data from backend
  const detailedMembers: TeamMember[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@company.com",
      role: "Full Stack Developer",
      joinDate: "2024-01-05",
      description: "Senior developer with expertise in React and Node.js. Passionate about creating scalable applications and mentoring junior developers.",
      assignedTasks: [
        { id: 1, title: "Design landing page mockup", status: "complete", priority: "high", dueDate: "2024-01-20" },
        { id: 4, title: "Database optimization", status: "in-progress", priority: "medium", dueDate: "2024-01-25" },
        { id: 7, title: "API documentation update", status: "upcoming", priority: "low", dueDate: "2024-01-30" },
      ]
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@company.com",
      role: "UI/UX Designer",
      joinDate: "2023-12-10",
      description: "Creative designer focused on user-centered design and accessibility. Specializes in creating intuitive and beautiful interfaces.",
      assignedTasks: [
        { id: 1, title: "Design landing page mockup", status: "complete", priority: "high", dueDate: "2024-01-20" },
        { id: 2, title: "Implement authentication", status: "in-progress", priority: "high", dueDate: "2024-01-18" },
        { id: 5, title: "User testing preparation", status: "review", priority: "low", dueDate: "2024-01-28" },
      ]
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.johnson@company.com",
      role: "Backend Developer",
      joinDate: "2024-01-15",
      description: "Backend specialist with strong database and API design skills. Experienced in microservices architecture and cloud infrastructure.",
      assignedTasks: [
        { id: 2, title: "Implement authentication", status: "in-progress", priority: "high", dueDate: "2024-01-18" },
        { id: 3, title: "Write API documentation", status: "upcoming", priority: "medium", dueDate: "2024-01-25" },
        { id: 8, title: "Performance testing", status: "review", priority: "medium", dueDate: "2024-01-24" },
      ]
    },
    {
      id: 4,
      name: "Sarah Wilson",
      email: "sarah.wilson@company.com",
      role: "Project Manager",
      joinDate: "2023-11-20",
      description: "Experienced project manager ensuring smooth delivery and team collaboration. Skilled in agile methodologies and stakeholder management.",
      assignedTasks: [
        { id: 4, title: "Database migration", status: "review", priority: "high", dueDate: "2024-01-17" },
        { id: 6, title: "Campaign analytics setup", status: "in-progress", priority: "high", dueDate: "2024-01-19" },
      ]
    }
  ];

  const handleMemberClick = (memberId: number) => {
    const member = detailedMembers.find(m => m.id === memberId);
    if (member) {
      setSelectedMember(member);
      setIsMemberModalOpen(true);
    }
  };

  // Mock stats
  const stats = {
    totalTasks: 24,
    completed: 16,
    inProgress: 5,
    overdue: 2,
  };

  const progress = (stats.completed / stats.totalTasks) * 100;

  // Mock activity data with more details
  const recentActivities = [
    {
      id: 1,
      user: "John Doe",
      action: "completed task",
      target: "Design landing page mockup",
      time: "2 hours ago",
      type: "completed"
    },
    {
      id: 2,
      user: "Jane Smith",
      action: "updated task",
      target: "Implement authentication",
      time: "5 hours ago",
      type: "updated"
    },
    {
      id: 3,
      user: "Mike Johnson",
      action: "added a comment on",
      target: "Write API documentation",
      time: "1 day ago",
      type: "comment"
    }
  ];

  // Mock work items stats
  const workItemsStats = [
    { type: "Epic", count: 3, color: "bg-purple-500" },
    { type: "Feature", count: 8, color: "bg-green-500" },
    { type: "Bug", count: 4, color: "bg-red-500" },
    { type: "Story", count: 9, color: "bg-blue-500" }
  ];

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
                    <p className="text-sm font-medium text-slate-900">Great progress!</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Keep up the momentum to reach your project goals. The team is on track for completion.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Types of Work Card */}
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900">Types of Work</CardTitle>
                  <CardDescription className="text-sm text-slate-600 mt-1">
                    Get a breakdown of work items by their types
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  View all items
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {workItemsStats.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex items-center gap-3 w-32">
                      <div className={`w-3 h-3 rounded-sm ${item.color}`} />
                      <span className="text-sm font-medium text-slate-700">{item.type}</span>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color}`}
                          style={{ width: `${(item.count / 24) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 w-8 text-right">{item.count}</span>
                  </div>
                ))}
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
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-semibold">
                        {activity.user.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900">
                        <span className="font-semibold">{activity.user}</span>{" "}
                        <span className="text-slate-600">{activity.action}</span>{" "}
                        <span className="font-medium text-blue-600 cursor-pointer hover:underline">
                          "{activity.target}"
                        </span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                    </div>
                    <div>
                      {activity.type === "completed" && (
                        <Badge className="bg-green-50 text-green-700 border-0 font-medium">
                          Completed
                        </Badge>
                      )}
                      {activity.type === "updated" && (
                        <Badge className="bg-blue-50 text-blue-700 border-0 font-medium">
                          Updated
                        </Badge>
                      )}
                      {activity.type === "comment" && (
                        <Badge className="bg-slate-100 text-slate-700 border-0 font-medium">
                          Comment
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
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
                  <span className="text-xs font-bold text-green-600">↑ 12%</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{Math.round(progress)}%</p>
              </div>
              
              <div className="p-3 bg-white/80 backdrop-blur rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-600">Team Velocity</span>
                  <span className="text-xs font-bold text-green-600">↑ 8%</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">4.2</p>
                <p className="text-xs text-slate-500 mt-1">tasks/day average</p>
              </div>

              <div className="p-3 bg-white/80 backdrop-blur rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-600">Est. Completion</span>
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-base font-bold text-slate-900">Feb 15, 2025</p>
                <p className="text-xs text-slate-500 mt-1">Based on current pace</p>
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
