import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useUser } from "@/contexts/UserContext";
import InteractiveDemo from "@/components/InteractiveDemo";
import { 
  CheckCircle2,
  Users,
  BarChart3,
  Zap,
  Calendar,
  Shield,
  ArrowRight,
  Star,
  TrendingUp,
  Clock,
  Target,
  CheckSquare,
  GitBranch,
  Layers,
  Activity,
  Eye,
  Globe,
  PlayCircle,
  Code,
  Workflow,
  Sparkles,
  Menu,
  X,
  GripVertical
} from "lucide-react";
const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Smart project management with calendar automation</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight text-slate-900">
              Organize projects with <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">time-based workflows</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Choose between calendar-synced automation or custom drag-and-drop workflows. Taskify adapts to how your team works best.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")} 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-12 px-8 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              >
                Get started free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate("/dashboard")}
                className="h-12 px-8 text-base font-semibold border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all w-full sm:w-auto group"
              >
                <PlayCircle className="mr-2 w-5 h-5 group-hover:text-blue-600 transition-colors" />
                Watch demo
              </Button>
            </div>

            <p className="text-sm text-slate-500 mt-6">
              Free for up to 10 users • No credit card required
            </p>
          </div>

          {/* Product Showcase */}
          <div className="relative mt-16">
            {/* Main Dashboard Preview */}
            <div className="relative rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden aspect-video">
              <InteractiveDemo />
            </div>

            {/* Floating Feature Cards */}
            <div className="hidden lg:block absolute -left-8 top-1/4 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-4 transform -rotate-2 hover:scale-105 transition-transform">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-slate-600">LIVE ACTIVITY</span>
              </div>
              <p className="text-sm font-medium mb-1 text-slate-900">Sprint velocity increased</p>
              <p className="text-xs text-slate-500">+24% this week</p>
            </div>

            <div className="hidden lg:block absolute -right-8 top-1/3 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-4 transform rotate-2 hover:scale-105 transition-transform">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-xs font-semibold text-slate-600">TASK COMPLETED</span>
              </div>
              <p className="text-sm font-medium mb-1 text-slate-900">Deploy to production</p>
              <p className="text-xs text-slate-500">Completed by Sarah J.</p>
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Two powerful workflows, one platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the workflow that fits your project. Switch between them anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-card border border-border/50 rounded-lg p-6 hover:shadow-lg hover:border-[#0052CC]/30 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-[#0052CC]/10 flex items-center justify-center mb-4 group-hover:bg-[#0052CC]/20 transition-colors">
                <Calendar className="w-6 h-6 text-[#0052CC]" />
              </div>
              <h3 className="text-lg font-bold mb-2">Calendar-synced automation</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Tasks automatically move through stages based on dates. Perfect for time-sensitive projects and product launches.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border border-border/50 rounded-lg p-6 hover:shadow-lg hover:border-[#0052CC]/30 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <GripVertical className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2">Custom drag-and-drop</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Full manual control with unlimited columns and flexible stages. Ideal for creative and design workflows.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border border-border/50 rounded-lg p-6 hover:shadow-lg hover:border-[#0052CC]/30 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-[#0052CC]/10 flex items-center justify-center mb-4 group-hover:bg-[#0052CC]/20 transition-colors">
                <CheckSquare className="w-6 h-6 text-[#0052CC]" />
              </div>
              <h3 className="text-lg font-bold mb-2">Task management</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Create, assign, and track tasks with priorities, due dates, and status updates all in one place.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card border border-border/50 rounded-lg p-6 hover:shadow-lg hover:border-[#0052CC]/30 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2">Team collaboration</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Invite team members, assign roles, and collaborate seamlessly with real-time updates.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-card border border-border/50 rounded-lg p-6 hover:shadow-lg hover:border-[#0052CC]/30 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-[#0052CC]/10 flex items-center justify-center mb-4 group-hover:bg-[#0052CC]/20 transition-colors">
                <Eye className="w-6 h-6 text-[#0052CC]" />
              </div>
              <h3 className="text-lg font-bold mb-2">Multiple views</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Switch between board, timeline, and calendar views to visualize your work the way you prefer.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-card border border-border/50 rounded-lg p-6 hover:shadow-lg hover:border-[#0052CC]/30 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2">Sprint tracking</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Plan sprints, track progress, and hit deadlines with built-in timeline and milestone tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases / Solutions */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Perfect for any project type
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From product launches to creative campaigns, Taskify adapts to your workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Launches */}
            <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-[#0052CC]/10 flex items-center justify-center flex-shrink-0">
                  <Target className="w-7 h-7 text-[#0052CC]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Product launches</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Use calendar-synced workflows to automatically move tasks through stages as launch dates approach.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#0052CC] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Auto-progression</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#0052CC] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Timeline views</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#0052CC] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Sprint tracking</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#0052CC] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Milestone alerts</span>
                </div>
              </div>
            </div>

            {/* Creative Projects */}
            <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Creative projects</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Custom workflows give you full control with unlimited columns and flexible drag-and-drop stages.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Unlimited columns</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Manual control</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Flexible stages</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Visual boards</span>
                </div>
              </div>
            </div>

            {/* Marketing Campaigns */}
            <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-[#0052CC]/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-7 h-7 text-[#0052CC]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Marketing campaigns</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Plan campaigns with calendar automation to ensure content moves through approval stages on schedule.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#0052CC] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Content calendar</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#0052CC] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Date-based flow</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#0052CC] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Team collaboration</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#0052CC] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Progress tracking</span>
                </div>
              </div>
            </div>

            {/* Agile Development */}
            <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Workflow className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Agile development</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Manage sprints with either workflow type. Track tasks, assign team members, and hit your deadlines.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Sprint planning</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Task assignment</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Board views</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Status tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0052CC]/5">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#0052CC] mb-2">2</div>
              <p className="text-muted-foreground font-medium">Workflow types</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#0052CC] mb-2">100%</div>
              <p className="text-muted-foreground font-medium">Customizable</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#0052CC] mb-2">∞</div>
              <p className="text-muted-foreground font-medium">Projects & tasks</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#0052CC] mb-2">24/7</div>
              <p className="text-muted-foreground font-medium">Access anywhere</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Loved by project teams
            </h2>
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-lg">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-[#0052CC] fill-[#0052CC]" />
                ))}
              </div>
              <blockquote className="text-lg font-medium mb-6 leading-relaxed">
                "The calendar-synced workflow is perfect for our product launches. Tasks automatically move through stages as dates approach. Game changer!"
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#0052CC]/10 flex items-center justify-center">
                  <span className="text-[#0052CC] font-bold">SJ</span>
                </div>
                <div>
                  <p className="font-bold">Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">Product Manager</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-lg">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                ))}
              </div>
              <blockquote className="text-lg font-medium mb-6 leading-relaxed">
                "Custom workflows give us the flexibility we need for creative projects. Unlimited columns and full control over our process."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-accent font-bold">DM</span>
                </div>
                <div>
                  <p className="font-bold">David Martinez</p>
                  <p className="text-sm text-muted-foreground">Creative Director</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* How It Works Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How Taskify works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get started in minutes with our simple three-step process
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#0052CC]/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-[#0052CC]">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Create your project</h3>
              <p className="text-muted-foreground leading-relaxed">
                Set up a new project with a name, description, and team members. Choose your start and end dates.
              </p>
            </div>

            <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-accent">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Choose your workflow</h3>
              <p className="text-muted-foreground leading-relaxed">
                Select calendar-synced for time-based automation or custom workflow for full manual control.
              </p>
            </div>

            <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#0052CC]/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-[#0052CC]">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Start managing tasks</h3>
              <p className="text-muted-foreground leading-relaxed">
                Add tasks, assign team members, set priorities, and watch your project come to life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Comparison Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Which workflow is right for you?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Compare our two workflow types to find the perfect fit for your project
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Calendar-Synced */}
            <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Calendar-Synced</h3>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Perfect for time-sensitive projects where tasks need to progress automatically based on dates.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Auto-moves tasks by date</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Fixed workflow stages</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Timeline and calendar views</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Sprint tracking built-in</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-2">Best for:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Product Launches</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Marketing</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Agile Teams</span>
                </div>
              </div>
            </div>

            {/* Custom Workflow */}
            <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center">
                  <GripVertical className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Custom Workflow</h3>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Ideal for projects that need flexible, manual control with unlimited customization options.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Unlimited custom columns</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Drag and drop control</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Flexible stage management</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Manual task progression</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-purple-200">
                <p className="text-sm font-semibold text-purple-900 mb-2">Best for:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Design Projects</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Content Creation</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Creative Work</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Start organizing your projects today
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Choose your workflow, invite your team, and start managing tasks in minutes. Free to get started.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")} 
              className="bg-[#0052CC] hover:bg-[#0065FF] text-white h-14 px-10 text-lg font-semibold rounded-md shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
            >
              Start for free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-14 px-10 text-lg font-semibold border-2 hover:bg-accent/50 transition-all w-full sm:w-auto"
            >
              Contact sales
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <span>Free for 10 users</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#0052CC] to-[#0065FF] flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">Taskify</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The project management tool teams love. Plan, track, and ship with confidence.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Changelog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Roadmap</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Solutions</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Software teams</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Product teams</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Marketing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Operations</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Enterprise</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Templates</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Press Kit</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/40">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © 2025 Taskify, Inc. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                <a href="#" className="hover:text-foreground transition-colors">Security</a>
                <a href="#" className="hover:text-foreground transition-colors">Sitemap</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
