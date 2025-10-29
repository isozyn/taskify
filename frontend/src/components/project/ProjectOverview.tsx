import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
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

  return (
    <div className="space-y-6">
      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
       

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
            <Clock className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">Active tasks</p>
          </CardContent>
        </Card>

         <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckCircle2 className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(progress)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue
            </CardTitle>
            <AlertCircle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Project Completion
              </span>
              <span className="text-sm font-medium">
                {stats.completed} / {stats.totalTasks} tasks
              </span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div 
                className={`h-full bg-gradient-to-r ${themeColors.progressFrom} ${themeColors.progressTo} transition-all`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Great progress! Keep up the momentum to reach your project goals.
          </p>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            {project.members.map((member: any) => (
              <div
                key={member.id}
                className={`flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/5 ${themeColors.hover} transition-all cursor-pointer group`}
                onClick={() => handleMemberClick(member.id)}
              >
                <Avatar className={`${themeColors.ring} transition-all`}>
                  <AvatarFallback className={`bg-gradient-to-br ${themeColors.gradientFrom} ${themeColors.gradientTo} text-white font-semibold`}>
                    {member.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className={`text-sm font-medium ${themeColors.hoverText} transition-colors`}>{member.name}</p>
                  <p className="text-xs text-muted-foreground">Member</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Member Detail Modal */}
      <MemberDetailModal
        member={selectedMember}
        isOpen={isMemberModalOpen}
        onOpenChange={setIsMemberModalOpen}
      />

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-success mt-2" />
              <div>
                <p className="text-sm">
                  <span className="font-medium">John Doe</span> completed task
                  "Design landing page mockup"
                </p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full ${themeColors.bg} mt-2`} />
              <div>
                <p className="text-sm">
                  <span className="font-medium">Jane Smith</span> updated task
                  "Implement authentication"
                </p>
                <p className="text-xs text-muted-foreground">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full ${themeColors.bg} mt-2`} />
              <div>
                <p className="text-sm">
                  <span className="font-medium">Mike Johnson</span> added a
                  comment on "Write API documentation"
                </p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectOverview;
