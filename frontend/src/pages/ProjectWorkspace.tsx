import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  BarChart3, 
  Calendar, 
  Settings, 
  Layers, 
  ArrowLeft, 
  Users, 
  Plus,
  MoreHorizontal,
  Search,
  Filter
} from "lucide-react";
import KanbanBoard from "@/components/project/KanbanBoard";
import TimelineView from "@/components/project/TimelineView";
import ProjectOverview from "@/components/project/ProjectOverview";
import ProjectSettings from "@/components/project/ProjectSettings";

const ProjectWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("kanban");
  const [workflowType, setWorkflowType] = useState<"auto-sync" | "custom">("auto-sync");

  // Determine theme colors based on workflow type
  const themeColors = {
    primary: workflowType === "custom" ? "purple" : "blue",
    gradientFrom: workflowType === "custom" ? "from-purple-500" : "from-blue-500",
    gradientTo: workflowType === "custom" ? "to-purple-600" : "to-blue-600",
    text: workflowType === "custom" ? "text-purple-600" : "text-blue-600",
    hover: workflowType === "custom" ? "hover:bg-purple-50" : "hover:bg-blue-50",
    bg: workflowType === "custom" ? "bg-purple-600" : "bg-blue-600",
  };

  // Mock project data
  const project = {
    id: id,
    name: "Website Redesign",
    description: "Complete overhaul of company website",
    members: [
      { id: 1, name: "John Doe", avatar: "" },
      { id: 2, name: "Jane Smith", avatar: "" },
      { id: 3, name: "Mike Johnson", avatar: "" },
      { id: 4, name: "Sarah Wilson", avatar: "" },
    ],
  };

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
      id: "settings",
      label: "Settings",
      icon: Settings,
    }
  ];

  const renderContent = () => {
    switch (activeView) {
      case "overview":
        return <ProjectOverview project={project} workflowType={workflowType} />;
      case "kanban":
        return <KanbanBoard projectMembers={project.members} onWorkflowChange={setWorkflowType} />;
      case "timeline":
        return <TimelineView projectMembers={project.members} />;
      case "settings":
        return <ProjectSettings project={project} />;
      default:
        return <KanbanBoard projectMembers={project.members} onWorkflowChange={setWorkflowType} />;
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
                  <h1 className="text-base font-semibold text-slate-900">{project.name}</h1>
                  <p className="text-xs text-slate-500">{project.description}</p>
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
                  {project.members.slice(0, 3).map((member) => (
                    <Avatar
                      key={member.id}
                      className="w-7 h-7 border-2 border-white hover:z-10 transition-all cursor-pointer"
                    >
                      <AvatarFallback className={`bg-gradient-to-br ${themeColors.gradientFrom} ${themeColors.gradientTo} text-white text-xs font-medium`}>
                        {member.name?.split(' ').map(n => n[0]).join('') || '??'}                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {project.members.length > 3 && (
                    <Avatar className="w-7 h-7 border-2 border-white">
                      <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-medium">
                        +{project.members.length - 3}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${themeColors.hover} ${themeColors.text} h-8 px-3`}
                >
                  <Users className="w-4 h-4 mr-1" />
                  Invite
                </Button>
              </div>
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
    </div>
  );
};

export default ProjectWorkspace;
