import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Layers, 
  CheckSquare, 
  BarChart3, 
  Users, 
  Zap, 
  Shield, 
  Calendar,
  TrendingUp,
  Clock,
  Target,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-amber-50/50 to-amber-100/30">
      {/* Navigation Bar */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                <Layers className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Taskify
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#about" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
                About
              </a>

              <a href="#features" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
                Features
              </a>
              <a href="#solutions" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
                Solutions
              </a>
         
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/auth")}
                className="font-semibold"
              >
                Log in
              </Button>
              <Button 
                onClick={() => navigate("/auth")} 
                className="btn-executive"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Trusted by 2M+ teams worldwide</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Taskify brings all your{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                tasks, teammates, and tools
              </span>{" "}
              together
            </h1>
            
            <p className="text-xl md:text-2xl text-foreground/70 mb-10 max-w-3xl mx-auto leading-relaxed">
              Keep everything in the same place—even if your team isn't.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")} 
                className="btn-executive h-14 px-8 text-lg w-full sm:w-auto"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate("/dashboard")}
                className="h-14 px-8 text-lg font-semibold border-border/50 hover:bg-muted/50 transition-all duration-300 w-full sm:w-auto"
              >
                View demo
              </Button>
            </div>

            {/* <p className="text-sm text-foreground/60">
              Free forever. No credit card needed.
            </p> */}
          </div>

          {/* Hero Image/Mockup Placeholder */}
          <div className="relative mt-20">
            <div className="premium-card p-8 bg-gradient-to-br from-card via-card to-card/90 rounded-2xl shadow-premium">
              <div className="aspect-video bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg flex items-center justify-center border-2 border-dashed border-border/30">
                <div className="text-center">
                  <Layers className="w-20 h-20 text-primary/40 mx-auto mb-4" />
                  <p className="text-foreground/60 font-medium">Your project workspace preview</p>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-accent/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              A productivity powerhouse
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              Simple, flexible, and powerful. All it takes are boards, lists, and cards to get a clear view of who's doing what and what needs to get done.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="premium-card p-8 text-center border-0 bg-gradient-to-br from-card to-card/90 hover:shadow-premium transition-all duration-500 group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <CheckSquare className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Boards</h3>
              <p className="text-foreground/70">
                Taskify boards keep tasks organized and work moving forward. In a glance, see everything from "things to do" to "aww yeah, we did it!"
              </p>
            </div>

            <div className="premium-card p-8 text-center border-0 bg-gradient-to-br from-card to-card/90 hover:shadow-premium transition-all duration-500 group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Teams</h3>
              <p className="text-foreground/70">
                Create powerful collaboration experiences with unlimited team members, easy onboarding, and role-based permissions.
              </p>
            </div>

            <div className="premium-card p-8 text-center border-0 bg-gradient-to-br from-card to-card/90 hover:shadow-premium transition-all duration-500 group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-3">Automation</h3>
              <p className="text-foreground/70">
                No-code automation is built into every board. Focus on the work that matters most and let the robots do the rest.
              </p>
            </div>

            <div className="premium-card p-8 text-center border-0 bg-gradient-to-br from-card to-card/90 hover:shadow-premium transition-all duration-500 group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Timeline View</h3>
              <p className="text-foreground/70">
                See your project from every angle with Timeline, Calendar, Gantt charts, and more to plan sprints and track progress.
              </p>
            </div>

            <div className="premium-card p-8 text-center border-0 bg-gradient-to-br from-card to-card/90 hover:shadow-premium transition-all duration-500 group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Enterprise Security</h3>
              <p className="text-foreground/70">
                Keep your data secure with enterprise-grade security features, compliance certifications, and administrative controls.
              </p>
            </div>

            <div className="premium-card p-8 text-center border-0 bg-gradient-to-br from-card to-card/90 hover:shadow-premium transition-all duration-500 group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-3">Analytics & Insights</h3>
              <p className="text-foreground/70">
                Get real-time insights into team productivity, project progress, and performance metrics to make data-driven decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="solutions" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Taskify for every team
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              Whether launching a new product, planning a marketing campaign, or organizing a company event, Taskify adapts to your team's needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="premium-card p-8 bg-gradient-to-br from-card to-card/90">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Marketing Teams</h3>
                  <p className="text-foreground/70">
                    Plan campaigns, create editorial calendars, and manage content production in one collaborative workspace.
                  </p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-foreground/70">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  Campaign management
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground/70">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  Content calendar
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground/70">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  Asset management
                </li>
              </ul>
            </div>

            <div className="premium-card p-8 bg-gradient-to-br from-card to-card/90">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Product Teams</h3>
                  <p className="text-foreground/70">
                    Build better products with agile workflows, sprint planning, and seamless collaboration across engineering and design.
                  </p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-foreground/70">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  Sprint planning
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground/70">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  Roadmap visualization
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground/70">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  Bug tracking
                </li>
              </ul>
            </div>

            <div className="premium-card p-8 bg-gradient-to-br from-card to-card/90">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Project Management</h3>
                  <p className="text-foreground/70">
                    Keep projects on track with timeline views, dependencies, and resource management tools.
                  </p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-foreground/70">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  Gantt charts
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground/70">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  Resource allocation
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground/70">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  Milestone tracking
                </li>
              </ul>
            </div>

            <div className="premium-card p-8 bg-gradient-to-br from-card to-card/90">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">HR & Operations</h3>
                  <p className="text-foreground/70">
                    Streamline hiring, onboarding, and internal processes with customizable workflows and templates.
                  </p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-foreground/70">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  Recruitment pipeline
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground/70">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  Employee onboarding
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground/70">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  Process automation
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Get started with Taskify today
            </h2>
            <p className="text-xl text-foreground/70 mb-10 max-w-2xl mx-auto">
              Join millions of people who organize work and life with Taskify.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")} 
              className="btn-executive h-14 px-10 text-lg"
            >
              Sign up - it's free!
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/80 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Layers className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Taskify
              </span>
            </div>
            
            <div className="flex gap-8 text-sm text-foreground/60">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>

            <p className="text-sm text-foreground/60">
              © 2024 Taskify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
