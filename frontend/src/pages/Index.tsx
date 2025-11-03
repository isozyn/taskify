import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useUser } from "@/contexts/UserContext";
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
  X
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
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0052CC]/5 via-background to-background pointer-events-none"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0052CC]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto relative">
          <div className="text-center max-w-4xl mx-auto mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#0052CC]/10 border border-[#0052CC]/20 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-[#0052CC]" />
              <span className="text-sm font-medium text-[#0052CC]">The #1 software development tool used by agile teams</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
              Move fast, stay aligned, and <span className="bg-gradient-to-r from-[#0052CC] to-[#0065FF] bg-clip-text text-transparent">build better</span> — together
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              The only project management tool you need to plan, track, and release world-class software. Trusted by over 250,000 teams worldwide.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")} 
                className="bg-[#0052CC] hover:bg-[#0065FF] text-white h-12 px-8 text-base font-semibold rounded-md shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              >
                Get started free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate("/dashboard")}
                className="h-12 px-8 text-base font-semibold border-2 hover:bg-accent/50 transition-all w-full sm:w-auto group"
              >
                <PlayCircle className="mr-2 w-5 h-5 group-hover:text-[#0052CC] transition-colors" />
                Watch demo
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              Free for up to 10 users • No credit card required
            </p>
          </div>

          {/* Product Showcase */}
          <div className="relative mt-16">
            {/* Main Dashboard Preview */}
            <div className="relative rounded-lg border border-border/50 bg-card shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-8 aspect-video flex items-center justify-center">
                <div className="w-full h-full bg-gradient-to-br from-[#0052CC]/5 to-accent/5 rounded-md border-2 border-dashed border-border/30 flex flex-col items-center justify-center gap-4">
                  <div className="flex gap-2">
                    <div className="w-16 h-16 bg-[#0052CC]/10 rounded-lg flex items-center justify-center">
                      <Layers className="w-8 h-8 text-[#0052CC]" />
                    </div>
                    <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center">
                      <GitBranch className="w-8 h-8 text-accent" />
                    </div>
                    <div className="w-16 h-16 bg-[#0052CC]/10 rounded-lg flex items-center justify-center">
                      <Workflow className="w-8 h-8 text-[#0052CC]" />
                    </div>
                  </div>
                  <p className="text-muted-foreground font-medium">Interactive Workspace Demo</p>
                </div>
              </div>
            </div>

            {/* Floating Feature Cards */}
            <div className="hidden lg:block absolute -left-8 top-1/4 w-64 bg-card border border-border/50 rounded-lg shadow-xl p-4 transform -rotate-2">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-[#0052CC]" />
                <span className="text-xs font-semibold text-muted-foreground">LIVE ACTIVITY</span>
              </div>
              <p className="text-sm font-medium mb-1">Sprint velocity increased</p>
              <p className="text-xs text-muted-foreground">+24% this week</p>
            </div>

            <div className="hidden lg:block absolute -right-8 top-1/3 w-64 bg-card border border-border/50 rounded-lg shadow-xl p-4 transform rotate-2">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span className="text-xs font-semibold text-muted-foreground">TASK COMPLETED</span>
              </div>
              <p className="text-sm font-medium mb-1">Deploy to production</p>
              <p className="text-xs text-muted-foreground">Completed by Sarah J.</p>
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful features for modern teams
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to plan, track, and deliver projects — all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-card border border-border/50 rounded-lg p-6 hover:shadow-lg hover:border-[#0052CC]/30 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-[#0052CC]/10 flex items-center justify-center mb-4 group-hover:bg-[#0052CC]/20 transition-colors">
                <Layers className="w-6 h-6 text-[#0052CC]" />
              </div>
              <h3 className="text-lg font-bold mb-2">Scrum boards</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Visualize and advance your project using a powerful Scrum board with drag-and-drop functionality.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border border-border/50 rounded-lg p-6 hover:shadow-lg hover:border-[#0052CC]/30 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2">Timeline planning</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Map out project timelines, track dependencies, and never miss a deadline with Gantt-style views.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border border-border/50 rounded-lg p-6 hover:shadow-lg hover:border-[#0052CC]/30 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-[#0052CC]/10 flex items-center justify-center mb-4 group-hover:bg-[#0052CC]/20 transition-colors">
                <GitBranch className="w-6 h-6 text-[#0052CC]" />
              </div>
              <h3 className="text-lg font-bold mb-2">Agile workflows</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Built-in agile workflows and customizable templates to match your team's methodology.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card border border-border/50 rounded-lg p-6 hover:shadow-lg hover:border-[#0052CC]/30 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2">Reports & insights</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Real-time reports on sprint velocity, burndown charts, and team performance metrics.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-card border border-border/50 rounded-lg p-6 hover:shadow-lg hover:border-[#0052CC]/30 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-[#0052CC]/10 flex items-center justify-center mb-4 group-hover:bg-[#0052CC]/20 transition-colors">
                <Zap className="w-6 h-6 text-[#0052CC]" />
              </div>
              <h3 className="text-lg font-bold mb-2">Automation</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Automate repetitive tasks with powerful no-code rules and triggers to boost productivity.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-card border border-border/50 rounded-lg p-6 hover:shadow-lg hover:border-[#0052CC]/30 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Code className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2">Developer tools</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Git integration, code reviews, and deployment tracking built right into your workflow.
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
              Built for every team
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Whether you're building software, managing projects, or running operations, Taskify adapts to your workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Software Teams */}
            <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-[#0052CC]/10 flex items-center justify-center flex-shrink-0">
                  <Code className="w-7 h-7 text-[#0052CC]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Software teams</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Ship faster with agile boards, sprint planning, and CI/CD integrations. Perfect for engineering teams of all sizes.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#0052CC] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Sprint planning</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#0052CC] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Bug tracking</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#0052CC] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Git integration</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#0052CC] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Release tracking</span>
                </div>
              </div>
            </div>

            {/* Product Teams */}
            <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Target className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Product teams</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Build better products with roadmap planning, user story mapping, and customer feedback loops.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Roadmapping</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">User stories</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Prioritization</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Analytics</span>
                </div>
              </div>
            </div>

            {/* Marketing Teams */}
            <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-[#0052CC]/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-7 h-7 text-[#0052CC]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Marketing teams</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Plan campaigns, manage content calendars, and track performance across all channels in one place.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#0052CC] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Campaign planning</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#0052CC] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Content calendar</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#0052CC] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Asset management</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#0052CC] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Performance tracking</span>
                </div>
              </div>
            </div>

            {/* Business Teams */}
            <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-8 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Business teams</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Streamline operations, manage processes, and keep everyone aligned with customizable workflows.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Process automation</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Task management</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Team collaboration</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Reporting</span>
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
              <div className="text-4xl md:text-5xl font-bold text-[#0052CC] mb-2">250k+</div>
              <p className="text-muted-foreground font-medium">Teams worldwide</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#0052CC] mb-2">99.9%</div>
              <p className="text-muted-foreground font-medium">Uptime SLA</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#0052CC] mb-2">10M+</div>
              <p className="text-muted-foreground font-medium">Issues tracked</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#0052CC] mb-2">180+</div>
              <p className="text-muted-foreground font-medium">Countries</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Trusted by teams at
            </h2>
          </div>

          {/* Company Logos */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center mb-20 opacity-50">
            <div className="text-2xl font-bold">Spotify</div>
            <div className="text-2xl font-bold">Tesla</div>
            <div className="text-2xl font-bold">Adobe</div>
            <div className="text-2xl font-bold">Airbnb</div>
            <div className="text-2xl font-bold">Slack</div>
          </div>

          {/* Testimonial Card */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-card border border-border/50 rounded-2xl p-8 md:p-12 shadow-lg">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#0052CC] fill-[#0052CC]" />
                ))}
              </div>
              <blockquote className="text-xl md:text-2xl font-medium mb-8 leading-relaxed">
                "Taskify has transformed the way our engineering team works. We ship 40% faster and collaboration has never been smoother. It's the only tool we need."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#0052CC]/10 flex items-center justify-center">
                  <span className="text-[#0052CC] font-bold text-lg">MK</span>
                </div>
                <div>
                  <p className="font-bold text-lg">Michael Kim</p>
                  <p className="text-muted-foreground">VP of Engineering, TechFlow</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Integration Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Connect the tools you already use
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Taskify integrates with thousands of apps to streamline your workflow. From version control to communication tools, everything works together seamlessly.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 bg-card border border-border/50 rounded-lg">
                  <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <span className="font-semibold">GitHub</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-card border border-border/50 rounded-lg">
                  <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span className="font-semibold">Slack</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-card border border-border/50 rounded-lg">
                  <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                    <Code className="w-5 h-5" />
                  </div>
                  <span className="font-semibold">GitLab</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-card border border-border/50 rounded-lg">
                  <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="font-semibold">Figma</span>
                </div>
              </div>
              <Button variant="outline" className="font-semibold">
                View all integrations
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-[#0052CC]/10 to-accent/10 rounded-2xl border-2 border-dashed border-border/30 flex items-center justify-center">
                <div className="text-center">
                  <Workflow className="w-20 h-20 text-[#0052CC] mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">Integration Network</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-2xl p-8 md:p-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-[#0052CC]/10 flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-[#0052CC]" />
                </div>
                <h2 className="text-4xl font-bold mb-4">
                  Enterprise-grade security
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Your data is protected with industry-leading security standards. From encryption to compliance, we've got you covered.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#0052CC] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">SOC 2 Type II certified</p>
                      <p className="text-sm text-muted-foreground">Audited security controls and practices</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#0052CC] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">GDPR compliant</p>
                      <p className="text-sm text-muted-foreground">Full data privacy and protection</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#0052CC] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">256-bit encryption</p>
                      <p className="text-sm text-muted-foreground">Data encrypted at rest and in transit</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#0052CC] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">99.9% uptime SLA</p>
                      <p className="text-sm text-muted-foreground">Always available when you need it</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-[#0052CC]/5 to-accent/5 rounded-xl border border-border/30 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-[#0052CC]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-12 h-12 text-[#0052CC]" />
                    </div>
                    <p className="text-muted-foreground font-medium">Protected Infrastructure</p>
                  </div>
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
            Ready to transform the way you work?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join 250,000+ teams already shipping faster with Taskify. Get started free — no credit card required.
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
