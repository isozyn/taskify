import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import TaskModal from "./TaskModal";

interface TimelineViewProps {
  projectMembers: any[];
}

const TimelineView = ({ projectMembers }: TimelineViewProps) => {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'detailed' | 'fit-to-screen'>('detailed');

  // Mock timeline data with multiple assignees and detailed information
  const tasks = [
    {
      id: 1,
      title: "UX Research",
      description: "Conduct user interviews and analyze user behavior patterns to inform design decisions.",
      assignees: ["John Doe", "Jane Smith"],
      startDate: "2024-01-04",
      endDate: "2024-01-12",
      status: "in-progress",
      progress: 48,
      color: "from-blue-500 to-blue-600",
      priority: "high",
      tags: ["research", "ux"],
      subtasks: [
        { id: 1, title: "User interviews", completed: true },
        { id: 2, title: "Survey analysis", completed: true },
        { id: 3, title: "Persona creation", completed: false },
        { id: 4, title: "Journey mapping", completed: false },
      ],
    },
    {
      id: 2,
      title: "Information Architecture",
      description: "Design the site structure and navigation flow for optimal user experience.",
      assignees: ["Jane Smith", "Mike Johnson", "Sarah Wilson"],
      startDate: "2024-01-06",
      endDate: "2024-01-14",
      status: "complete",
      progress: 100,
      color: "from-emerald-500 to-emerald-600",
      priority: "medium",
      tags: ["architecture", "navigation"],
      subtasks: [
        { id: 1, title: "Site map creation", completed: true },
        { id: 2, title: "Navigation design", completed: true },
        { id: 3, title: "Content hierarchy", completed: true },
        { id: 4, title: "User flow diagrams", completed: true },
      ],
    },
    {
      id: 3,
      title: "Design Phase",
      description: "Create visual designs and mockups for all key pages and components.",
      assignees: ["Mike Johnson", "Sarah Wilson"],
      startDate: "2024-01-08",
      endDate: "2024-01-20",
      status: "in-progress",
      progress: 54,
      color: "from-teal-500 to-teal-600",
      priority: "high",
      tags: ["design", "mockups"],
      subtasks: [
        { id: 1, title: "Wireframes", completed: true },
        { id: 2, title: "Visual design", completed: true },
        { id: 3, title: "Component library", completed: false },
        { id: 4, title: "Responsive layouts", completed: false },
      ],
    },
    {
      id: 4,
      title: "Prototyping",
      description: "Build interactive prototypes for user testing and stakeholder review.",
      assignees: ["Sarah Wilson", "John Doe"],
      startDate: "2024-01-18",
      endDate: "2024-01-28",
      status: "upcoming",
      progress: 39,
      color: "from-sky-500 to-sky-600",
      priority: "medium",
      tags: ["prototype", "testing"],
      subtasks: [
        { id: 1, title: "Low-fi prototype", completed: true },
        { id: 2, title: "High-fi prototype", completed: false },
        { id: 3, title: "User testing", completed: false },
        { id: 4, title: "Iteration", completed: false },
      ],
    },
    {
      id: 5,
      title: "Development",
      description: "Implement the frontend and backend functionality according to specifications.",
      assignees: ["Mike Johnson", "Jane Smith"],
      startDate: "2024-01-14",
      endDate: "2024-01-22",
      status: "in-progress",
      progress: 54,
      color: "from-orange-500 to-orange-600",
      priority: "high",
      tags: ["development", "coding"],
      subtasks: [
        { id: 1, title: "Setup development environment", completed: true },
        { id: 2, title: "Core functionality", completed: true },
        { id: 3, title: "API integration", completed: false },
        { id: 4, title: "Testing", completed: false },
      ],
    },
    {
      id: 6,
      title: "Backend Development",
      description: "Build robust server-side architecture and database design.",
      assignees: ["John Doe"],
      startDate: "2024-01-10",
      endDate: "2024-01-16",
      status: "in-progress",
      progress: 69,
      color: "from-purple-500 to-purple-600",
      priority: "high",
      tags: ["backend", "api"],
      subtasks: [
        { id: 1, title: "Database schema", completed: true },
        { id: 2, title: "API endpoints", completed: true },
        { id: 3, title: "Authentication", completed: true },
        { id: 4, title: "Data validation", completed: false },
      ],
    },
    {
      id: 7,
      title: "Frontend Development",
      description: "Implement responsive user interface with modern web technologies.",
      assignees: ["Jane Smith", "Mike Johnson"],
      startDate: "2024-01-16",
      endDate: "2024-01-20",
      status: "in-progress",
      progress: 61,
      color: "from-amber-500 to-amber-600",
      priority: "medium",
      tags: ["frontend", "ui"],
      subtasks: [
        { id: 1, title: "Component setup", completed: true },
        { id: 2, title: "Styling system", completed: true },
        { id: 3, title: "State management", completed: true },
        { id: 4, title: "Performance optimization", completed: false },
      ],
    },
  ];

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
  };

  // Generate week columns
  const weeks = Array.from({ length: 18 }, (_, i) => `S ${String(i + 4).padStart(2, "0")}`);

  return (
    <div className="space-y-6">
      <Card className="premium-card border-0 bg-gradient-to-br from-card via-card to-card/90 shadow-premium">
        <CardContent className="p-8">
          {/* Executive Timeline Header */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/30">
            <div className="space-y-2">
              <h2 className="heading-premium">Project Timeline</h2>
              <p className="text-executive">Strategic milestone tracking and resource allocation</p>
            </div>
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-1">
                <Button
                  variant={viewMode === 'detailed' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('detailed')}
                  className="h-8 px-3 text-xs font-semibold transition-all duration-300"
                >
                  <Maximize2 className="w-3 h-3 mr-1" />
                  Detailed
                </Button>
                <Button
                  variant={viewMode === 'fit-to-screen' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('fit-to-screen')}
                  className="h-8 px-3 text-xs font-semibold transition-all duration-300"
                >
                  <Minimize2 className="w-3 h-3 mr-1" />
                  Fit to Screen
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                className="font-semibold border-border/50 hover:bg-muted/50 transition-all duration-300"
              >
                Today
              </Button>
              <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
                <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-muted/50">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-bold px-4 text-foreground">Q1 2024</span>
                <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-muted/50">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Executive Timeline Grid */}
          {viewMode === 'detailed' ? (
            <div className="relative bg-gradient-to-r from-muted/20 to-transparent rounded-xl p-6">
              {/* Premium Week Headers */}
              <div className="flex mb-6 pl-[280px]">
                {weeks.map((week, idx) => (
                  <div
                    key={week}
                    className={`flex-1 text-center text-xs font-bold tracking-wider ${
                      idx % 2 === 0 ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {week}
                  </div>
                ))}
              </div>

              {/* Executive Task Rows */}
              <div className="space-y-3">
                {tasks.map((task, taskIdx) => (
                  <div key={task.id} className="flex items-center gap-6 group">
                    {/* Executive Task Info Panel */}
                    <div className="w-64 premium-card border-0 bg-gradient-to-r from-card to-card/80 overflow-hidden">
                      {/* Progress Bar at Top */}
                      <div className="relative h-1 bg-muted/30">
                        <div
                          className="absolute top-0 left-0 h-1 bg-gradient-to-r from-primary to-accent transition-all duration-700"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      
                      <div className="p-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-foreground truncate">{task.title}</h4>
                            <p className="text-[9px] text-muted-foreground font-medium tracking-wide mt-0.5">
                              {task.priority.toUpperCase()} PRIORITY
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-foreground">{task.progress}%</div>
                            <div className={`w-2.5 h-2.5 rounded-full mt-0.5 mx-auto ${
                              task.status === 'complete' ? 'bg-success' : 
                              task.status === 'in-progress' ? 'bg-accent' : 
                              task.status === 'review' ? 'bg-warning' : 'bg-primary'
                            } shadow-md`}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Executive Timeline Bar */}
                    <div className="flex-1 relative h-12 flex items-center">
                      {/* Grid Lines */}
                      <div className="absolute inset-0 grid grid-cols-18">
                        {weeks.map((week, idx) => (
                          <div
                            key={week}
                            className={`border-r ${
                              idx === 0 ? "border-l" : ""
                            } ${idx % 4 === 0 ? 'border-slate-300' : 'border-slate-200'}`}
                          />
                        ))}
                      </div>

                      {/* Premium Progress Bar */}
                      <div
                        className="absolute h-10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer group-hover:scale-105 group-hover:-translate-y-1"
                        style={{
                          left: `${((taskIdx) * 8) + 5}%`,
                          width: `${20 + (taskIdx * 3)}%`,
                        }}
                        onClick={() => handleTaskClick(task)}
                      >
                        <div className={`h-full rounded-xl bg-gradient-to-r ${task.color} flex items-center justify-between px-4 shadow-lg border border-white/20`}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-white/80"></div>
                            <span className="text-white text-xs font-bold tracking-wide">
                              {task.progress}%
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/80" />
                        </div>
                        {/* Progress Fill */}
                        <div 
                          className="absolute top-0 left-0 h-full rounded-xl bg-gradient-to-r from-white/20 to-transparent transition-all duration-700"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Fit to Screen View */
            <div className="relative bg-gradient-to-r from-muted/20 to-transparent rounded-xl p-6 overflow-hidden">
              {/* Compact Week Headers */}
              <div className="flex mb-4 pl-[176px]">
                {weeks.map((week, idx) => (
                  <div
                    key={week}
                    className={`flex-1 text-center text-xs font-bold tracking-wider ${
                      idx % 3 === 0 ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {week}
                  </div>
                ))}
              </div>

              {/* Compact Task Rows */}
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {tasks.map((task, taskIdx) => (
                  <div key={task.id} className="flex items-center gap-4 group">
                    {/* Compact Task Info Panel */}
                    <div className="w-40 premium-card border-0 bg-gradient-to-r from-card to-card/80 overflow-hidden">
                      {/* Progress Bar at Top */}
                      <div className="relative h-1 bg-muted/30">
                        <div
                          className="absolute top-0 left-0 h-1 bg-gradient-to-r from-primary to-accent transition-all duration-700"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      
                      <div className="p-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-foreground truncate">{task.title}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge 
                                variant="outline" 
                                className={`text-[9px] px-1 py-0 h-3.5 font-medium ${
                                  task.priority === 'high' ? 'border-red-300 text-red-600' :
                                  task.priority === 'medium' ? 'border-yellow-300 text-yellow-600' :
                                  'border-green-300 text-green-600'
                                }`}
                              >
                                {task.priority.charAt(0).toUpperCase()}
                              </Badge>
                              <span className="text-xs font-semibold text-foreground">{task.progress}%</span>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                task.status === 'complete' ? 'bg-success' : 
                                task.status === 'in-progress' ? 'bg-accent' : 
                                task.status === 'review' ? 'bg-warning' : 'bg-primary'
                              } shadow-sm`}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Compact Timeline Bar */}
                    <div className="flex-1 relative h-8 flex items-center">
                      {/* Grid Lines */}
                      <div className="absolute inset-0 grid grid-cols-18">
                        {weeks.map((week, idx) => (
                          <div
                            key={week}
                            className={`border-r ${
                              idx === 0 ? "border-l" : ""
                            } ${idx % 6 === 0 ? 'border-slate-300' : 'border-slate-200'}`}
                          />
                        ))}
                      </div>

                      {/* Compact Progress Bar */}
                      <div
                        className="absolute h-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group-hover:scale-105"
                        style={{
                          left: `${((taskIdx) * 6) + 2}%`,
                          width: `${Math.max(12, 15 + (taskIdx * 2))}%`,
                        }}
                        onClick={() => handleTaskClick(task)}
                      >
                        <div className={`h-full rounded-lg bg-gradient-to-r ${task.color} flex items-center justify-center px-2 shadow-md border border-white/20`}>
                          <span className="text-white text-xs font-bold tracking-wide">
                            {task.progress}%
                          </span>
                        </div>
                        {/* Progress Fill */}
                        <div 
                          className="absolute top-0 left-0 h-full rounded-lg bg-gradient-to-r from-white/20 to-transparent transition-all duration-500"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          projectMembers={projectMembers}
        />
      )}
    </div>
  );
};

export default TimelineView;
