import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import KanbanBoard from "@/components/project/KanbanBoard";
import TimelineView from "@/components/project/TimelineView";
import ProjectOverview from "@/components/project/ProjectOverview";
import ProjectSettings from "@/components/project/ProjectSettings";

const ProjectWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">{project.name}</h1>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="kanban" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ProjectOverview project={project} />
          </TabsContent>

          <TabsContent value="kanban">
            <KanbanBoard projectMembers={project.members} />
          </TabsContent>

          <TabsContent value="timeline">
            <TimelineView projectMembers={project.members} />
          </TabsContent>

          <TabsContent value="settings">
            <ProjectSettings project={project} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProjectWorkspace;
