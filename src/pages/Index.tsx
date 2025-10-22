import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Layers, CheckSquare, BarChart3, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-primary mb-8 shadow-xl">
            <Layers className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            CollabTrack
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            Where teams plan smarter, track faster, and deliver together
          </p>
          
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Collaborative project management that combines Kanban workflows, 
            timeline visualization, and intelligent task tracking—all in one place.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate("/auth")} className="shadow-lg">
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/dashboard")}>
              View Demo
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
          <div className="text-center p-6 rounded-2xl bg-card border border-border/50 hover:shadow-lg transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Kanban Boards</h3>
            <p className="text-sm text-muted-foreground">
              Tasks automatically organize into 5 intelligent columns based on dates and status
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-card border border-border/50 hover:shadow-lg transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Timeline Visualization</h3>
            <p className="text-sm text-muted-foreground">
              Visualize project progress with interactive Gantt charts and timelines
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-card border border-border/50 hover:shadow-lg transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-success" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Team Collaboration</h3>
            <p className="text-sm text-muted-foreground">
              Manage teams, assign tasks, track progress, and communicate in real-time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
