import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Layers, CheckSquare, BarChart3, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-amber-50/50 to-amber-100/30">
      {/* Executive Hero Section */}
      <div className="container mx-auto px-6 py-24">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/80 mb-10 shadow-premium">
            <Layers className="w-12 h-12 text-primary-foreground" />
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
            CollabTrack
          </h1>
          
          <p className="text-2xl md:text-3xl text-foreground mb-6 font-semibold">
            Executive Project Management Suite
          </p>
          
          <p className="text-lg text-executive mb-16 max-w-3xl mx-auto leading-relaxed">
            Strategic project orchestration for executive teams. Combining sophisticated Kanban workflows, 
            executive timeline visualization, and intelligent performance tracking—engineered for leadership excellence.
          </p>

          <div className="flex items-center justify-center gap-6">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")} 
              className="btn-executive h-14 px-8 text-lg"
            >
              Access Executive Suite
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate("/dashboard")}
              className="h-14 px-8 text-lg font-semibold border-border/50 hover:bg-muted/50 transition-all duration-300"
            >
              View Portfolio Demo
            </Button>
          </div>
        </div>

        {/* Executive Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-32 max-w-6xl mx-auto">
          <div className="premium-card text-center p-8 border-0 bg-gradient-to-br from-card via-card to-card/90 hover:shadow-premium transition-all duration-500 group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <CheckSquare className="w-8 h-8 text-primary" />
            </div>
            <h3 className="heading-premium mb-4">Strategic Kanban</h3>
            <p className="text-executive">
              Executive-grade task orchestration with intelligent workflow automation 
              and strategic priority management across five operational columns
            </p>
          </div>

          <div className="premium-card text-center p-8 border-0 bg-gradient-to-br from-card via-card to-card/90 hover:shadow-premium transition-all duration-500 group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <BarChart3 className="w-8 h-8 text-accent" />
            </div>
            <h3 className="heading-premium mb-4">Executive Timeline</h3>
            <p className="text-executive">
              Sophisticated Gantt visualization with milestone tracking, 
              resource allocation insights, and strategic timeline management
            </p>
          </div>

          <div className="premium-card text-center p-8 border-0 bg-gradient-to-br from-card via-card to-card/90 hover:shadow-premium transition-all duration-500 group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-8 h-8 text-success" />
            </div>
            <h3 className="heading-premium mb-4">Leadership Collaboration</h3>
            <p className="text-executive">
              Executive team coordination with role-based access, 
              performance analytics, and strategic communication channels
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
