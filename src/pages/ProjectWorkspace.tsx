import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, BarChart3, Calendar, Settings, Layers } from "lucide-react";
import KanbanBoard from "@/components/project/KanbanBoard";
import TimelineView from "@/components/project/TimelineView";
import ProjectOverview from "@/components/project/ProjectOverview";
import ProjectSettings from "@/components/project/ProjectSettings";

const ProjectWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("kanban");

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

  const sidebarItems = [
    {
      id: "overview",
      label: "Overview",
      icon: BarChart3,
      description: "Project summary"
    },
    {
      id: "kanban",
      label: "Kanban",
      icon: Layers,
      description: "Task board"
    },
    {
      id: "timeline",
      label: "Timeline",
      icon: Calendar,
      description: "Project timeline"
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      description: "Project settings"
    }
  ];

  const renderContent = () => {
    switch (activeView) {
      case "overview":
        return <ProjectOverview project={project} />;
      case "kanban":
        return <KanbanBoard projectMembers={project.members} />;
      case "timeline":
        return <TimelineView projectMembers={project.members} />;
      case "settings":
        return <ProjectSettings project={project} />;
      default:
        return <KanbanBoard projectMembers={project.members} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-amber-50/50 to-amber-100/30">
      {/* Executive Project Header */}
      <header className="glass-effect border-b border-border/30 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="w-10 h-10 rounded-lg hover:bg-muted/50 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="space-y-1">
                <h1 className="heading-premium">{project.name}</h1>
                <p className="text-executive">{project.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {project.members.slice(0, 4).map((member, idx) => (
                  <div
                    key={member.id}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-semibold border-2 border-background shadow-md"
                  >
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                ))}
                {project.members.length > 4 && (
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-semibold shadow-md">
                    +{project.members.length - 4}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Executive Main Content with Sidebar */}
      <div className="flex min-h-[calc(100vh-120px)]">
        {/* Executive Sidebar */}
        <aside className="w-64 glass-effect border-r border-border/30 p-6">
          <div className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full justify-start gap-3 h-12 transition-all duration-300 ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold text-sm">{item.label}</div>
                    <div className="text-xs opacity-80">{item.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="mt-8 pt-6 border-t border-border/30">
            <Card className="premium-card border-0 bg-gradient-to-br from-primary/10 to-accent/10 p-4">
              <div className="text-center">
                <div className="text-sm font-semibold text-foreground mb-1">Project Progress</div>
                <div className="text-2xl font-bold text-primary">65%</div>
                <div className="text-xs text-muted-foreground">Overall completion</div>
              </div>
            </Card>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          <div className="max-w-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProjectWorkspace;
