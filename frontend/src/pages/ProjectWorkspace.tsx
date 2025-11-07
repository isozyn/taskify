import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  BarChart3, 
  Calendar, 
  CalendarDays,
  Settings, 
  Layers, 
  ArrowLeft, 
  Users, 
  Plus,
  MoreHorizontal,
  Search,
  Filter,
  MessageSquare
} from "lucide-react";
import KanbanBoard from "@/components/project/KanbanBoard";
import TimelineView from "@/components/project/TimelineView";
import CalendarView from "@/components/project/CalendarView";
import ProjectOverview from "@/components/project/ProjectOverview";
import ProjectSettings from "@/components/project/ProjectSettings";
import MessagesView from "@/components/project/MessagesView";
import StickyNotes from "@/components/ui/StickyNotes";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { InviteMembersDialog } from "@/components/project/InviteMembersDialog";
import { useUser } from "@/contexts/UserContext";
import { api, Project } from "@/lib/api";

const ProjectWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("kanban");
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [workflowType, setWorkflowType] = useState<"auto-sync" | "custom">("auto-sync");
  const [refreshKey, setRefreshKey] = useState(0);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Function to trigger refresh
  const refreshProject = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Fetch project data from database
  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        console.log('Fetching project with ID:', id);
        const response: any = await api.getProjectById(parseInt(id));
        console.log('Project data received:', response);
        console.log('Project members:', response.members);
        console.log('Project owner:', response.owner);
        setProject(response);
        
        // Set workflow type based on project data
        if (response.workflowType === 'AUTOMATED') {
          setWorkflowType('auto-sync');
        } else if (response.workflowType === 'CUSTOM') {
          setWorkflowType('custom');
        }
      } catch (error) {
        console.error('Failed to fetch project:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // Determine theme colors based on workflow type
  const themeColors = {
    primary: workflowType === "custom" ? "purple" : "blue",
    gradientFrom: workflowType === "custom" ? "from-purple-500" : "from-blue-500",
    gradientTo: workflowType === "custom" ? "to-purple-600" : "to-blue-600",
    text: workflowType === "custom" ? "text-purple-600" : "text-blue-600",
    hover: workflowType === "custom" ? "hover:bg-purple-50" : "hover:bg-blue-50",
    bg: workflowType === "custom" ? "bg-purple-600" : "bg-blue-600",
  };

  // Get real project members from the project data - OPTIMIZED with useMemo
  const projectMembers = useMemo(() => {
    if (!project?.members) return [];
    
    return project.members.map((member: any) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      avatar: member.user.avatar,
      username: member.user.username,
      role: member.role
    }));
  }, [project?.members]);

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: BarChart3,
    },
    {
      id: "kanban",
      label: "Board",
      icon: Layers,
    },
    {
      id: "timeline",
      label: "Timeline",
      icon: Calendar,
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: CalendarDays,
    },
    {
      id: "messages",
      label: "Messages",
      icon: MessageSquare,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    }
  ];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!project) {
      return (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-500">Project not found</p>
        </div>
      );
    }

    switch (activeView) {
      case "overview":
        return <ProjectOverview key={refreshKey} project={project} workflowType={workflowType} onNavigateToBoard={() => setActiveView("kanban")} />;
      case "kanban":
        return <KanbanBoard projectMembers={projectMembers} onWorkflowChange={setWorkflowType} workflowType={workflowType} projectId={project.id} onTasksChange={refreshProject} onColumnsChange={refreshProject} />;
      case "timeline":
        return <TimelineView projectMembers={projectMembers} />;
      case "calendar":
        return <CalendarView projectMembers={projectMembers} />;
      case "messages":
        return <MessagesView projectMembers={projectMembers} project={project ? { id: project.id, title: project.title, description: project.description } : undefined} />;
      case "settings":
        return <ProjectSettings project={project} />;
      default:
        return <KanbanBoard projectMembers={projectMembers} onWorkflowChange={setWorkflowType} workflowType={workflowType} projectId={project.id} onTasksChange={refreshProject} onColumnsChange={refreshProject} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Jira-Inspired Single Header with Integrated Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        {/* Top Header Bar */}
        <div className="border-b border-slate-100">
          <div className="flex items-center justify-between px-6 py-3">
            {/* Left: Back Button + Project Info */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="hover:bg-slate-100 text-slate-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <div className="h-6 w-px bg-slate-200" />
              
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded bg-gradient-to-br ${themeColors.gradientFrom} ${themeColors.gradientTo} flex items-center justify-center shadow-sm`}>
                  <Layers className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-semibold text-slate-900">{project?.title || 'Loading...'}</h1>
                  <p className="text-xs text-slate-500">{project?.description || ''}</p>
                </div>
              </div>
            </div>

            {/* Right: Actions + Members */}
            <div className="flex items-center gap-3">
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-slate-100 text-slate-600 h-8"
                >
                  <Search className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-slate-100 text-slate-600 h-8"
                >
                  <Filter className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-slate-100 text-slate-600 h-8"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              <div className="h-6 w-px bg-slate-200" />

              {/* Team Members */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {projectMembers.slice(0, 3).map((member) => (
                    <Avatar
                      key={member.id}
                      className="w-7 h-7 border-2 border-white hover:z-10 transition-all cursor-pointer"
                    >
                      <AvatarFallback className={`bg-gradient-to-br ${themeColors.gradientFrom} ${themeColors.gradientTo} text-white text-xs font-medium`}>
                        {member.name?.split(' ').map(n => n[0]).join('') || '??'}                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {projectMembers.length > 3 && (
                    <Avatar className="w-7 h-7 border-2 border-white">
                      <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-medium">
                        +{projectMembers.length - 3}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInviteDialogOpen(true)}
                  className="text-slate-600 hover:text-black hover:bg-slate-100 h-8 px-3"
                >
                  <Users className="w-4 h-4 mr-1" />
                  Invite
                </Button>
              </div>

              <div className="h-6 w-px bg-slate-200" />

              {/* User Profile */}
              <ProfileDropdown />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive 
                    ? themeColors.text
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {isActive && (
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${themeColors.bg} rounded-t-full`} />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area - Full Width */}
      <main className="container mx-auto px-6 py-6">
        <div className="max-w-full">
          {renderContent()}
        </div>
      </main>

      {/* Sticky Notes - Floating */}
      <StickyNotes projectId={id} workflowType={workflowType} />

      {/* Invite Members Dialog */}
      {project && (
        <InviteMembersDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          projectId={project.id}
          projectName={project.title}
        />
      )}
    </div>
  );
};

export default ProjectWorkspace;
