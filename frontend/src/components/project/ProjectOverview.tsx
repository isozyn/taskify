import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle, TrendingUp, Mail, Calendar, Target, BarChart3 } from "lucide-react";

interface ProjectOverviewProps {
  project: any;
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

const ProjectOverview = ({ project }: ProjectOverviewProps) => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-success/20 text-success border-success/30";
      case "in-progress":
        return "bg-accent/20 text-accent border-accent/30";
      case "review":
        return "bg-warning/20 text-warning border-warning/30";
      case "upcoming":
        return "bg-primary/20 text-primary border-primary/30";
      default:
        return "bg-muted/50 text-muted-foreground border-muted/50";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
            <Progress value={progress} className="h-3" />
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
                className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/5 hover:border-primary/30 transition-all cursor-pointer group"
                onClick={() => handleMemberClick(member.id)}
              >
                <Avatar className="group-hover:ring-2 group-hover:ring-primary/30 transition-all">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                    {member.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">{member.name}</p>
                  <p className="text-xs text-muted-foreground">Member</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Member Detail Modal */}
      <Dialog open={isMemberModalOpen} onOpenChange={setIsMemberModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden glass-effect">
          {selectedMember && (
            <div className="overflow-y-auto max-h-[80vh] px-1">
              <DialogHeader className="mb-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16 ring-2 ring-primary/30">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold text-xl">
                      {selectedMember.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <DialogTitle className="heading-premium text-2xl mb-1">
                      {selectedMember.name}
                    </DialogTitle>
                    <p className="text-executive text-primary font-semibold">{selectedMember.role}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${selectedMember.email}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        {selectedMember.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Joined {new Date(selectedMember.joinDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* About Section */}
                <Card className="premium-card border-0 bg-gradient-to-br from-card via-card to-card/90">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      About
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground leading-relaxed">{selectedMember.description}</p>
                  </CardContent>
                </Card>

                {/* Task Statistics */}
                <div className="grid grid-cols-3 gap-3">
                  <Card className="premium-card border-0 bg-gradient-to-br from-primary/10 to-primary/5">
                    <CardContent className="pt-6 text-center">
                      <Target className="w-6 h-6 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold text-foreground">{selectedMember.assignedTasks.length}</div>
                      <p className="text-xs text-muted-foreground font-medium">Total Tasks</p>
                    </CardContent>
                  </Card>
                  <Card className="premium-card border-0 bg-gradient-to-br from-success/10 to-success/5">
                    <CardContent className="pt-6 text-center">
                      <CheckCircle2 className="w-6 h-6 text-success mx-auto mb-2" />
                      <div className="text-2xl font-bold text-foreground">
                        {selectedMember.assignedTasks.filter(t => t.status === 'complete').length}
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">Completed</p>
                    </CardContent>
                  </Card>
                  <Card className="premium-card border-0 bg-gradient-to-br from-accent/10 to-accent/5">
                    <CardContent className="pt-6 text-center">
                      <Clock className="w-6 h-6 text-accent mx-auto mb-2" />
                      <div className="text-2xl font-bold text-foreground">
                        {selectedMember.assignedTasks.filter(t => t.status === 'in-progress').length}
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">Active</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Assigned Tasks */}
                <Card className="premium-card border-0 bg-gradient-to-br from-card via-card to-card/90">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Assigned Tasks
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedMember.assignedTasks.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm font-medium">No tasks assigned</p>
                        </div>
                      ) : (
                        selectedMember.assignedTasks.map((task) => (
                          <Card
                            key={task.id}
                            className="premium-card border border-border/30 bg-gradient-to-br from-background via-background to-muted/10 hover:shadow-md hover:border-primary/30 transition-all duration-300"
                          >
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                {/* Task Title and Priority */}
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-bold text-sm text-foreground flex-1 line-clamp-2">
                                    {task.title}
                                  </h4>
                                  <Badge className={`text-xs px-2 py-1 ${getPriorityColor(task.priority)}`}>
                                    {task.priority.toUpperCase()}
                                  </Badge>
                                </div>

                                {/* Status and Due Date */}
                                <div className="flex items-center justify-between gap-2">
                                  <Badge className={`text-xs px-2 py-1 ${getStatusColor(task.status)}`}>
                                    {task.status.replace('-', ' ').toUpperCase()}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    <span className="font-medium">
                                      Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Task Completion Progress */}
                <Card className="premium-card border-0 bg-gradient-to-br from-card via-card to-card/90">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Task Completion Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
                        <span className="text-sm font-bold text-foreground">
                          {selectedMember.assignedTasks.filter(t => t.status === 'complete').length} / {selectedMember.assignedTasks.length} tasks
                        </span>
                      </div>
                      <div className="relative">
                        <Progress 
                          value={(selectedMember.assignedTasks.filter(t => t.status === 'complete').length / selectedMember.assignedTasks.length) * 100} 
                          className="h-3 bg-muted/50"
                        />
                        <div 
                          className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
                          style={{ width: `${(selectedMember.assignedTasks.filter(t => t.status === 'complete').length / selectedMember.assignedTasks.length) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((selectedMember.assignedTasks.filter(t => t.status === 'complete').length / selectedMember.assignedTasks.length) * 100)}% of assigned tasks completed
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="text-sm">
                  <span className="font-medium">Jane Smith</span> updated task
                  "Implement authentication"
                </p>
                <p className="text-xs text-muted-foreground">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-accent mt-2" />
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
