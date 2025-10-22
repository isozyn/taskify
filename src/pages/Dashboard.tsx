import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Layers, Calendar, Users, BarChart3, UserPlus, ExternalLink, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [joinProjectCode, setJoinProjectCode] = useState("");
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isActiveTasksModalOpen, setIsActiveTasksModalOpen] = useState(false);

  // Mock data - will be replaced with real data from backend
  const projects = [
    {
      id: 1,
      name: "Website Redesign",
      description: "Complete overhaul of company website",
      progress: 65,
      members: 5,
      tasks: { total: 24, completed: 16 },
    },
    {
      id: 2,
      name: "Mobile App Launch",
      description: "iOS and Android app development",
      progress: 40,
      members: 8,
      tasks: { total: 32, completed: 13 },
    },
    {
      id: 3,
      name: "Marketing Campaign",
      description: "Q1 2024 marketing initiatives",
      progress: 80,
      members: 4,
      tasks: { total: 15, completed: 12 },
    },
  ];

  // Mock active tasks data
  const activeTasks = [
    {
      id: 1,
      title: "Design landing page mockup",
      project: "Website Redesign",
      projectId: 1,
      priority: "high",
      dueDate: "2024-01-20",
      assignees: ["John Doe", "Jane Smith"],
      status: "in-progress",
    },
    {
      id: 2,
      title: "Implement authentication system",
      project: "Mobile App Launch",
      projectId: 2,
      priority: "high",
      dueDate: "2024-01-18",
      assignees: ["Mike Johnson"],
      status: "in-progress",
    },
    {
      id: 3,
      title: "Create social media content",
      project: "Marketing Campaign",
      projectId: 3,
      priority: "medium",
      dueDate: "2024-01-22",
      assignees: ["Sarah Wilson", "Emily Davis"],
      status: "review",
    },
    {
      id: 4,
      title: "Database optimization",
      project: "Website Redesign",
      projectId: 1,
      priority: "medium",
      dueDate: "2024-01-25",
      assignees: ["John Doe"],
      status: "upcoming",
    },
    {
      id: 5,
      title: "User testing preparation",
      project: "Mobile App Launch",
      projectId: 2,
      priority: "low",
      dueDate: "2024-01-28",
      assignees: ["Jane Smith", "Mike Johnson"],
      status: "upcoming",
    },
    {
      id: 6,
      title: "Campaign analytics setup",
      project: "Marketing Campaign",
      projectId: 3,
      priority: "high",
      dueDate: "2024-01-19",
      assignees: ["Sarah Wilson"],
      status: "in-progress",
    },
    {
      id: 7,
      title: "API documentation update",
      project: "Website Redesign",
      projectId: 1,
      priority: "low",
      dueDate: "2024-01-30",
      assignees: ["Emily Davis"],
      status: "upcoming",
    },
    {
      id: 8,
      title: "Performance testing",
      project: "Mobile App Launch",
      projectId: 2,
      priority: "medium",
      dueDate: "2024-01-24",
      assignees: ["John Doe", "Mike Johnson"],
      status: "review",
    },
  ];

  const handleJoinProject = () => {
    // TODO: Implement join project logic with backend
    console.log("Joining project with code:", joinProjectCode);
    setIsJoinDialogOpen(false);
    setJoinProjectCode("");
    // For now, just show a success message or navigate
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "review":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "upcoming":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Group tasks by project and sort by priority
  const getTasksByProject = () => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    
    const tasksByProject = activeTasks.reduce((acc, task) => {
      if (!acc[task.project]) {
        const project = projects.find(p => p.id === task.projectId);
        acc[task.project] = {
          projectId: task.projectId,
          projectName: task.project,
          progress: project?.progress || 0,
          totalTasks: project?.tasks.total || 0,
          completedTasks: project?.tasks.completed || 0,
          tasks: []
        };
      }
      acc[task.project].tasks.push(task);
      return acc;
    }, {} as Record<string, { 
      projectId: number; 
      projectName: string; 
      progress: number;
      totalTasks: number;
      completedTasks: number;
      tasks: typeof activeTasks 
    }>);

    // Sort tasks within each project by priority (high to low)
    Object.values(tasksByProject).forEach(project => {
      project.tasks.sort((a, b) => priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]);
    });

    return Object.values(tasksByProject);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-amber-50/50 to-amber-100/30">
      {/* Premium Header */}
      <header className="glass-effect border-b border-border/30 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center shadow-lg">
                <Layers className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">CollabTrack</h1>
                <p className="text-sm text-muted-foreground font-medium">Executive Project Management</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate("/auth")}
              className="font-semibold border-border/50 hover:bg-muted/50 transition-all duration-300"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Executive Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-10">
            <div className="space-y-2">
              <h2 className="heading-executive">Portfolio Overview</h2>
              <p className="text-executive">Strategic project management and performance insights</p>
            </div>
            <div className="flex gap-3">
              <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="gap-2 font-semibold border-border/50 hover:bg-muted/50 transition-all duration-300"
                  >
                    <UserPlus className="w-4 h-4" />
                    Join Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[450px] glass-effect">
                  <DialogHeader className="space-y-3">
                    <DialogTitle className="heading-premium">Join Project</DialogTitle>
                    <DialogDescription className="text-executive">
                      Enter the project invitation code to join an existing project.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-6">
                    <div className="space-y-2">
                      <Label htmlFor="projectCode" className="text-sm font-semibold text-foreground">
                        Project Code
                      </Label>
                      <Input
                        id="projectCode"
                        value={joinProjectCode}
                        onChange={(e) => setJoinProjectCode(e.target.value)}
                        placeholder="Enter invitation code"
                        className="h-11 border-border/50 focus:border-primary/50 transition-all duration-300"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleJoinProject}
                      disabled={!joinProjectCode.trim()}
                      className="btn-executive w-full"
                    >
                      Join Project
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button className="btn-executive gap-2">
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            </div>
          </div>

          {/* Executive KPI Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="premium-card border-0 bg-gradient-to-br from-card via-card to-card/80">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Active Projects
                </CardTitle>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-1">{projects.length}</div>
                <p className="text-sm text-success font-medium">+12% from last month</p>
              </CardContent>
            </Card>
            
            <Card 
              className="premium-card border-0 bg-gradient-to-br from-card via-card to-card/80 cursor-pointer hover:shadow-premium transition-all duration-300 group"
              onClick={() => setIsActiveTasksModalOpen(true)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Active Tasks
                </CardTitle>
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-300">
                  <BarChart3 className="w-5 h-5 text-accent" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-foreground mb-1">
                      {activeTasks.length}
                    </div>
                    <p className="text-sm text-warning font-medium">3 due this week</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors duration-300" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Executive Project Portfolio */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="heading-premium">Strategic Initiatives</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <span>On Track</span>
                <div className="w-2 h-2 rounded-full bg-warning ml-4"></div>
                <span>At Risk</span>
                <div className="w-2 h-2 rounded-full bg-destructive ml-4"></div>
                <span>Behind</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="premium-card cursor-pointer group border-0 bg-gradient-to-br from-card via-card to-card/90 hover:shadow-premium transition-all duration-500"
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                          {project.name}
                        </CardTitle>
                        <div className={`w-3 h-3 rounded-full ${
                          project.progress >= 80 ? 'bg-success' : 
                          project.progress >= 50 ? 'bg-warning' : 'bg-destructive'
                        }`}></div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">{project.progress}%</div>
                        <div className="text-xs text-muted-foreground font-medium">COMPLETE</div>
                      </div>
                    </div>
                    <CardDescription className="text-executive line-clamp-2 mt-3">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-muted-foreground">Progress</span>
                        <span className="font-bold text-foreground">{project.progress}%</span>
                      </div>
                      <div className="relative">
                        <Progress 
                          value={project.progress} 
                          className="h-2 bg-muted/50"
                        />
                        <div 
                          className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/30">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">
                          {project.tasks.completed}/{project.tasks.total} tasks
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">{project.members} members</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Active Tasks Kanban Modal */}
      <Dialog open={isActiveTasksModalOpen} onOpenChange={setIsActiveTasksModalOpen}>
        <DialogContent className="sm:max-w-[1200px] max-h-[85vh] overflow-hidden glass-effect">
          <DialogHeader className="space-y-3 pb-4">
            <DialogTitle className="heading-premium flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-accent" />
              Active Tasks Portfolio
            </DialogTitle>
            <DialogDescription className="text-executive">
              Kanban view of all active tasks organized by project and priority
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[60vh] py-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {getTasksByProject().map((projectGroup) => (
                <Card key={projectGroup.projectId} className="premium-card border-0 bg-gradient-to-br from-card via-card to-card/90 shadow-lg">
                  <CardHeader 
                    className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border/20 pb-4 cursor-pointer hover:from-primary/20 hover:to-accent/20 transition-all duration-300"
                    onClick={() => navigate(`/project/${projectGroup.projectId}`)}
                  >
                    <div className="space-y-4">
                      {/* Project Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                            <Layers className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="font-bold text-sm text-foreground hover:text-primary transition-colors duration-300">
                              {projectGroup.projectName}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground font-medium">
                              {projectGroup.tasks.length} active task{projectGroup.tasks.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-lg font-bold text-foreground">{projectGroup.progress}%</div>
                            <div className="text-xs text-muted-foreground font-medium">COMPLETE</div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors duration-300" />
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-muted-foreground">Project Progress</span>
                          <span className="font-bold text-foreground">
                            {projectGroup.completedTasks}/{projectGroup.totalTasks} tasks
                          </span>
                        </div>
                        <div className="relative">
                          <Progress 
                            value={projectGroup.progress} 
                            className="h-2 bg-muted/50"
                          />
                          <div 
                            className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
                            style={{ width: `${projectGroup.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4">
                    <div className="space-y-3 min-h-[300px] max-h-[400px] overflow-y-auto">
                      {projectGroup.tasks.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-muted-foreground">
                          <div className="text-center">
                            <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium">No active tasks</p>
                          </div>
                        </div>
                      ) : (
                        projectGroup.tasks.map((task) => (
                          <Card
                            key={task.id}
                            className="premium-card cursor-pointer group border border-border/30 bg-gradient-to-br from-background via-background to-muted/10 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                            onClick={() => navigate(`/project/${task.projectId}`)}
                          >
                            <CardContent className="p-3">
                              <div className="space-y-3">
                                {/* Task Title and Priority */}
                                <div className="flex items-start justify-between">
                                  <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 flex-1">
                                    {task.title}
                                  </h4>
                                  <Badge className={`text-xs px-2 py-1 ml-2 ${getPriorityColor(task.priority)}`}>
                                    {task.priority.charAt(0).toUpperCase()}
                                  </Badge>
                                </div>

                                {/* Status and Due Date */}
                                <div className="flex items-center justify-between">
                                  <Badge className={`text-xs px-2 py-1 ${getStatusColor(task.status)}`}>
                                    {task.status.replace('-', ' ').toUpperCase()}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    <span className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</span>
                                  </div>
                                </div>

                                {/* Assignees */}
                                <div className="flex items-center justify-between pt-2 border-t border-border/20">
                                  <div className="flex -space-x-1">
                                    {task.assignees.slice(0, 3).map((assignee, idx) => (
                                      <div
                                        key={idx}
                                        className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold border border-background shadow-sm"
                                      >
                                        {assignee.split(" ").map((n: string) => n[0]).join("")[0]}
                                      </div>
                                    ))}
                                    {task.assignees.length > 3 && (
                                      <div className="w-5 h-5 rounded-full bg-muted border border-background flex items-center justify-center shadow-sm">
                                        <span className="text-xs font-bold text-muted-foreground">
                                          +{task.assignees.length - 3}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground font-medium">
                                    {task.assignees.length} member{task.assignees.length !== 1 ? 's' : ''}
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
              ))}
            </div>
          </div>
          
          <DialogFooter className="border-t border-border/30 pt-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Showing {activeTasks.length} active tasks across {projects.length} projects</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-xs">High Priority</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="text-xs">Medium Priority</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs">Low Priority</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsActiveTasksModalOpen(false)}
                className="font-semibold"
              >
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
