import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TimelineViewProps {
  projectMembers: any[];
}

const TimelineView = ({ projectMembers }: TimelineViewProps) => {
  // Mock timeline data with multiple assignees
  const tasks = [
    {
      id: 1,
      title: "UX Research",
      assignees: ["John Doe", "Jane Smith"],
      startDate: "2024-01-04",
      endDate: "2024-01-12",
      status: "in-progress",
      progress: 48,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: 2,
      title: "Information Architecture",
      assignees: ["Jane Smith", "Mike Johnson", "Sarah Wilson"],
      startDate: "2024-01-06",
      endDate: "2024-01-14",
      status: "complete",
      progress: 100,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      id: 3,
      title: "Design Phase",
      assignees: ["Mike Johnson", "Sarah Wilson"],
      startDate: "2024-01-08",
      endDate: "2024-01-20",
      status: "in-progress",
      progress: 54,
      color: "from-teal-500 to-teal-600",
    },
    {
      id: 4,
      title: "Prototyping",
      assignees: ["Sarah Wilson", "John Doe"],
      startDate: "2024-01-18",
      endDate: "2024-01-28",
      status: "upcoming",
      progress: 39,
      color: "from-sky-500 to-sky-600",
    },
    {
      id: 5,
      title: "Development",
      assignees: ["Mike Johnson", "Jane Smith"],
      startDate: "2024-01-14",
      endDate: "2024-01-22",
      status: "in-progress",
      progress: 54,
      color: "from-orange-500 to-orange-600",
    },
    {
      id: 6,
      title: "Backend Development",
      assignees: ["John Doe"],
      startDate: "2024-01-10",
      endDate: "2024-01-16",
      status: "in-progress",
      progress: 69,
      color: "from-purple-500 to-purple-600",
    },
    {
      id: 7,
      title: "Frontend Development",
      assignees: ["Jane Smith", "Mike Johnson"],
      startDate: "2024-01-16",
      endDate: "2024-01-20",
      status: "in-progress",
      progress: 61,
      color: "from-amber-500 to-amber-600",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-success";
      case "in-progress":
        return "bg-primary";
      case "review":
        return "bg-warning";
      case "backlog":
        return "bg-destructive";
      default:
        return "bg-muted";
    }
  };

  // Generate week columns
  const weeks = Array.from({ length: 18 }, (_, i) => `S ${String(i + 4).padStart(2, "0")}`);

  return (
    <div className="space-y-4">
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Header with date navigation */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
            <h2 className="text-xl font-bold">Timeline</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Today
              </Button>
              <Button variant="ghost" size="icon">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium px-3">June, 2022</span>
              <Button variant="ghost" size="icon">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Timeline Grid */}
          <div className="relative">
            {/* Week Headers */}
            <div className="flex mb-4 pl-64">
              {weeks.map((week) => (
                <div
                  key={week}
                  className="flex-1 text-center text-xs text-muted-foreground font-medium"
                >
                  {week}
                </div>
              ))}
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4 group">
                  {/* Task Info */}
                  <div className="w-60 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{task.title}</p>
                    </div>
                    <div className="flex -space-x-1.5">
                      {task.assignees.slice(0, 3).map((assignee, idx) => (
                        <Avatar
                          key={idx}
                          className="w-6 h-6 border-2 border-card ring-1 ring-border/50"
                        >
                          <AvatarFallback className="text-xs">
                            {assignee
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {task.assignees.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center ring-1 ring-border/50">
                          <span className="text-xs font-medium">
                            +{task.assignees.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timeline Bar */}
                  <div className="flex-1 relative h-10 flex items-center">
                    <div className="absolute inset-0 grid grid-cols-18">
                      {weeks.map((week, idx) => (
                        <div
                          key={week}
                          className={`border-r border-border/20 ${
                            idx === 0 ? "border-l" : ""
                          }`}
                        />
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div
                      className="absolute h-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group-hover:scale-105"
                      style={{
                        left: `${((task.id - 1) * 5)}%`,
                        width: `${15 + (task.id * 2)}%`,
                      }}
                    >
                      <div className={`h-full rounded-lg bg-gradient-to-r ${task.color} flex items-center justify-between px-3`}>
                        <span className="text-white text-xs font-medium">
                          {task.progress}%
                        </span>
                        <ChevronRight className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimelineView;
