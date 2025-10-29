import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { 
  Plus, 
  Layers, 
  Calendar, 
  Users, 
  CheckSquare2, 
  TrendingUp, 
  Filter, 
  Search, 
  ChevronRight, 
  Clock, 
  Eye, 
  UserPlus, 
  BarChart3,
  Star,
  Grid3x3,
  List,
  FolderOpen,
  Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [joinProjectCode, setJoinProjectCode] = useState("");
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("recent");
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    visibility: "private",
  });

  // Mock data - will be replaced with real data from backend
  const projects = [
    {
      id: 1,
      name: "Website Redesign",
      description: "Complete overhaul of company website",
      progress: 65,
      members: 5,
      tasks: { total: 24, completed: 16 },
      starred: true,
      lastUpdated: "2024-01-15",
    },
    {
      id: 2,
      name: "Mobile App Launch",
      description: "iOS and Android app development",
      progress: 40,
      members: 8,
      tasks: { total: 32, completed: 13 },
      starred: false,
      lastUpdated: "2024-01-14",
    },
    {
      id: 3,
      name: "Marketing Campaign",
      description: "Q1 2024 marketing initiatives",
      progress: 80,
      members: 4,
      tasks: { total: 15, completed: 12 },
      starred: true,
      lastUpdated: "2024-01-13",
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

  const handleCreateProject = () => {
    // TODO: Implement create project logic with backend
    console.log("Creating project:", newProject);
    setIsNewProjectModalOpen(false);
    // Reset form
    setNewProject({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      visibility: "private",
    });
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

  // Filter projects based on search query and tab
  const getFilteredProjects = () => {
    let filtered = projects.filter(project =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (activeTab === "starred") {
      filtered = filtered.filter(p => p.starred);
    }

    return filtered;
  };

  const filteredProjects = getFilteredProjects();

  // Calculate stats
  const totalTasks = projects.reduce((sum, p) => sum + p.tasks.total, 0);
  const completedTasks = projects.reduce((sum, p) => sum + p.tasks.completed, 0);
  const avgProgress = Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length);
  const starredProjects = projects.filter(p => p.starred);

  const renderProjectsView = () => {
    if (filteredProjects.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <FolderOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No projects found</h3>
          <p className="text-sm text-slate-500 mb-4">Get started by creating your first project</p>
          <Button 
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setIsNewProjectModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Create Project
          </Button>
        </div>
      );
    }

    if (viewMode === "grid") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id}
              className="group cursor-pointer border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all bg-white"
              onClick={() => navigate(`/project/${project.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 rounded bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-white" />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Toggle star
                    }}
                  >
                    <Star className={`w-4 h-4 ${project.starred ? "fill-yellow-400 text-yellow-400" : "text-slate-400"}`} />
                  </Button>
                </div>
                <CardTitle className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {project.name}
                </CardTitle>
                <CardDescription className="text-sm text-slate-500 line-clamp-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{project.tasks.completed}/{project.tasks.total} tasks</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-1.5" />
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Users className="w-3.5 h-3.5" />
                    <span>{project.members} members</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(project.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    // List view
    return (
      <div className="space-y-2">
        {filteredProjects.map((project) => (
          <Card 
            key={project.id}
            className="group cursor-pointer border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all bg-white"
            onClick={() => navigate(`/project/${project.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Layers className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {project.name}
                      </h3>
                      {project.starred && (
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500 truncate">{project.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 ml-4">
                  <div className="flex items-center gap-2">
                    <div className="w-32">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>{project.tasks.completed}/{project.tasks.total}</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-1.5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 w-24">
                    <Users className="w-3.5 h-3.5" />
                    <span>{project.members} members</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 w-20">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(project.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6 max-w-7xl">
        {/* Header Section with Jira-inspired design */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 mb-6">Your work</h1>
          
          {/* Action Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80 h-9 bg-white border-slate-200 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`h-7 px-2 ${viewMode === "grid" ? "bg-slate-100" : ""}`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`h-7 px-2 ${viewMode === "list" ? "bg-slate-100" : ""}`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Create Project Button */}
              <Button 
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white h-9 shadow-sm"
                onClick={() => setIsNewProjectModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Create
              </Button>
            </div>
          </div>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent border-b border-slate-200 w-full justify-start h-auto p-0 rounded-none">
              <TabsTrigger 
                value="recent" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-4 py-2 data-[state=active]:text-blue-600 text-slate-600 font-medium"
              >
                Recent
              </TabsTrigger>
              <TabsTrigger 
                value="starred" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-4 py-2 data-[state=active]:text-blue-600 text-slate-600 font-medium"
              >
                <Star className="w-4 h-4 mr-1.5" />
                Starred
              </TabsTrigger>
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-4 py-2 data-[state=active]:text-blue-600 text-slate-600 font-medium"
              >
                All projects
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="mt-6">
              {renderProjectsView()}
            </TabsContent>

            <TabsContent value="starred" className="mt-6">
              {starredProjects.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <h3 className="text-lg font-medium text-slate-900 mb-1">No starred projects</h3>
                  <p className="text-sm text-slate-500">Star projects to quickly access them here</p>
                </div>
              ) : (
                renderProjectsView()
              )}
            </TabsContent>

            <TabsContent value="all" className="mt-6">
              {renderProjectsView()}
            </TabsContent>
          </Tabs>
        </div>
      </main>              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Your Projects</h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64 h-9 border-slate-200 focus:border-blue-500"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 border-slate-200  hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                    <Filter className="w-4 h-4" />
                    Filter
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {filteredProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="border-0 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                            <Layers className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {project.name}
                            </CardTitle>
                            <p className="text-sm text-slate-600 mt-1">{project.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-600">Progress</span>
                          <span className="text-xs font-bold text-slate-900">{project.progress}%</span>
                        </div>
                        <Progress 
                          value={project.progress} 
                          className="h-2 bg-slate-100"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">
                            {project.tasks.completed}/{project.tasks.total} tasks
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Users className="w-4 h-4" />
                          <span className="font-medium">{project.members} members</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* High Priority Tasks */}
              <Card className="border-0 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">High Priority</CardTitle>
                  <CardDescription>Tasks requiring immediate attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {highPriorityTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="p-3 rounded-lg bg-red-50 border border-red-100 hover:bg-red-100 transition-colors cursor-pointer">
                      <h4 className="text-sm font-semibold text-slate-900 mb-1">{task.title}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">{task.project}</span>
                        <div className="flex items-center gap-1 text-xs text-red-600">
                          <Clock className="w-3 h-3" />
                          {task.dueDate}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="ghost"
                    className="w-full gap-2 border border-slate-200 text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                    onClick={() => setIsActiveTasksModalOpen(true)}
                  >
                    <Eye className="w-4 h-4" />
                    View All Tasks
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions
              <Card className="border-0 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 border-slate-200 hover:bg-slate-50"
                    onClick={() => setIsNewProjectModalOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    New Project
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 border-slate-200 hover:bg-slate-50"
                    onClick={() => setIsActiveTasksModalOpen(true)}
                  >
                    <CheckSquare2 className="w-4 h-4" />
                    View All Tasks
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 border-slate-200 hover:bg-slate-50"
                    onClick={() => setIsJoinDialogOpen(true)}
                  >
                    <UserPlus className="w-4 h-4" />
                    Invite Team Member
                  </Button>
                </CardContent>
              </Card> */}

              {/* Team Members
              <Card className="border-0 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">Team Members</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {["John Doe", "Jane Smith", "Mike Johnson"].map((member, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                        {member.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{member}</span>
                    </div>
                  ))}
                </CardContent>
              </Card> */}
            </div>
          </div>
      </main>

      {/* Active Tasks Modal */}
      <Dialog open={isActiveTasksModalOpen} onOpenChange={setIsActiveTasksModalOpen}>
        <DialogContent className="sm:max-w-[1200px] max-h-[85vh] overflow-hidden">
          <DialogHeader className="space-y-2 pb-4">
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              All Active Tasks
            </DialogTitle>
            <DialogDescription>
              View and manage all active tasks organized by project
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[60vh] py-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {getTasksByProject().map((projectGroup) => (
                <Card key={projectGroup.projectId} className="border-0 bg-white shadow-sm">
                  <CardHeader 
                    className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-100 pb-4 cursor-pointer hover:from-blue-100 hover:to-blue-200 transition-all"
                    onClick={() => navigate(`/project/${projectGroup.projectId}`)}
                  >
                    <div className="space-y-4">
                      {/* Project Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <Layers className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="font-semibold text-sm text-slate-900 hover:text-blue-600 transition-colors">
                              {projectGroup.projectName}
                            </CardTitle>
                            <p className="text-xs text-slate-600 font-medium">
                              {projectGroup.tasks.length} active task{projectGroup.tasks.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-lg font-bold text-slate-900">{projectGroup.progress}%</div>
                            <div className="text-xs text-slate-600 font-medium">Complete</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 hover:text-blue-600 transition-colors" />
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-600">Project Progress</span>
                          <span className="font-bold text-slate-900">
                            {projectGroup.completedTasks}/{projectGroup.totalTasks} tasks
                          </span>
                        </div>
                        <Progress 
                          value={projectGroup.progress} 
                          className="h-2 bg-slate-100"
                        />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4">
                    <div className="space-y-3 min-h-[300px] max-h-[400px] overflow-y-auto">
                      {projectGroup.tasks.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-slate-400">
                          <div className="text-center">
                            <CheckSquare2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium">No active tasks</p>
                          </div>
                        </div>
                      ) : (
                        projectGroup.tasks.map((task) => (
                          <Card
                            key={task.id}
                            className="cursor-pointer group border border-slate-200 bg-white hover:shadow-md hover:border-blue-300 transition-all"
                            onClick={() => navigate(`/project/${task.projectId}`)}
                          >
                            <CardContent className="p-3">
                              <div className="space-y-3">
                                {/* Task Title and Priority */}
                                <div className="flex items-start justify-between">
                                  <h4 className="font-semibold text-xs text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 flex-1">
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

      {/* New Project Modal */}
      <Dialog open={isNewProjectModalOpen} onOpenChange={setIsNewProjectModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <Plus className="w-5 h-5 text-blue-600" />
              Create New Project
            </DialogTitle>
            <DialogDescription>
              Set up a new project and start collaborating with your team
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="project-name" className="text-sm font-medium">
                Project Name *
              </Label>
              <Input
                id="project-name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="Enter project name"
                className="h-11"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="project-description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="project-description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Describe your project goals and objectives"
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project-start-date" className="text-sm font-medium">
                  Start Date
                </Label>
                <Input
                  id="project-start-date"
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-end-date" className="text-sm font-medium">
                  Target End Date
                </Label>
                <Input
                  id="project-end-date"
                  type="date"
                  value={newProject.endDate}
                  onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <Label htmlFor="project-visibility" className="text-sm font-medium">
                Project Visibility
              </Label>
              <select
                id="project-visibility"
                value={newProject.visibility}
                onChange={(e) => setNewProject({ ...newProject, visibility: e.target.value })}
                className="flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
              >
                <option value="private">Private - Only invited members</option>
                <option value="team">Team - All team members can view</option>
                <option value="public">Public - Anyone can view</option>
              </select>
              <p className="text-xs text-slate-500">
                Control who can view and access this project
              </p>
            </div>
          </div>

          <DialogFooter className="border-t border-slate-100 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsNewProjectModalOpen(false)}
              className="border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={!newProject.name.trim()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
