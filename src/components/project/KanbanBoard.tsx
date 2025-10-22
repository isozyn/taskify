import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, CheckCircle2, Clock, AlertCircle, FileText, Archive } from "lucide-react";
import TaskModal from "./TaskModal";

interface Task {
  id: number;
  title: string;
  assignees: string[];
  startDate: string;
  endDate: string;
  status: "upcoming" | "in-progress" | "review" | "complete" | "backlog";
  progress: number;
}

interface KanbanBoardProps {
  projectMembers: any[];
}

const KanbanBoard = ({ projectMembers }: KanbanBoardProps) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Mock tasks - will be replaced with real data (matching TimelineView structure)
  const tasks: Task[] = [
    {
      id: 1,
      title: "Design landing page mockup",
      assignees: ["John Doe", "Jane Smith"],
      startDate: "2024-01-15",
      endDate: "2024-01-20",
      status: "complete",
      progress: 100,
    },
    {
      id: 2,
      title: "Implement authentication",
      assignees: ["Jane Smith", "Mike Johnson"],
      startDate: "2024-01-10",
      endDate: "2024-01-18",
      status: "in-progress",
      progress: 60,
    },
    {
      id: 3,
      title: "Write API documentation",
      assignees: ["Mike Johnson"],
      startDate: "2024-01-20",
      endDate: "2024-01-25",
      status: "upcoming",
      progress: 0,
    },
    {
      id: 4,
      title: "Database migration",
      assignees: ["Sarah Wilson", "John Doe"],
      startDate: "2024-01-12",
      endDate: "2024-01-17",
      status: "review",
      progress: 100,
    },
    {
      id: 5,
      title: "Fix payment gateway bug",
      assignees: ["Jane Smith", "Sarah Wilson", "Mike Johnson"],
      startDate: "2023-12-28",
      endDate: "2024-01-05",
      status: "backlog",
      progress: 30,
    },
  ];

  const columns = [
    {
      id: "upcoming",
      title: "Upcoming",
      icon: Clock,
      color: "text-primary",
      bgColor: "bg-gradient-to-br from-primary/10 to-primary/5",
      borderColor: "border-primary/20",
    },
    {
      id: "in-progress",
      title: "In Progress",
      icon: FileText,
      color: "text-accent",
      bgColor: "bg-gradient-to-br from-accent/10 to-accent/5",
      borderColor: "border-accent/20",
    },
    {
      id: "review",
      title: "Review",
      icon: AlertCircle,
      color: "text-warning",
      bgColor: "bg-gradient-to-br from-warning/10 to-warning/5",
      borderColor: "border-warning/20",
    },
    {
      id: "complete",
      title: "Complete",
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-gradient-to-br from-success/10 to-success/5",
      borderColor: "border-success/20",
    },
    {
      id: "backlog",
      title: "Backlog",
      icon: Archive,
      color: "text-muted-foreground",
      bgColor: "bg-gradient-to-br from-muted/20 to-muted/10",
      borderColor: "border-muted/30",
    },
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {columns.map((column) => {
          const Icon = column.icon;
          const columnTasks = getTasksByStatus(column.id);

          return (
            <Card key={column.id} className="premium-card border-0 bg-gradient-to-br from-card via-card to-card/90 shadow-lg">
              <CardHeader className={`${column.bgColor} ${column.borderColor} rounded-t-lg border-b border-border/20 pb-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${column.bgColor} border ${column.borderColor} flex items-center justify-center shadow-md`}>
                      <Icon className={`w-5 h-5 ${column.color}`} />
                    </div>
                    <div>
                      <CardTitle className="font-bold text-sm text-foreground uppercase tracking-wider">
                        {column.title}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground font-medium">{columnTasks.length} tasks</p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${column.bgColor} ${column.color} border-0 font-bold shadow-sm`}
                  >
                    {columnTasks.length}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                {/* Executive Task Cards */}
                <div className="space-y-4 min-h-[400px]">
                  {columnTasks.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      <div className="text-center">
                        <Icon className={`w-8 h-8 ${column.color} mx-auto mb-2 opacity-50`} />
                        <p className="text-sm font-medium">No tasks</p>
                      </div>
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <Card
                        key={task.id}
                        className="premium-card cursor-pointer group border border-border/30 bg-gradient-to-br from-background via-background to-muted/10 hover:shadow-lg hover:border-primary/30 transition-all duration-300 overflow-hidden"
                        onClick={() => setSelectedTask(task)}
                      >
                        {/* Progress Bar at Top */}
                        <div className="relative h-1 bg-muted/30">
                          <div
                            className="absolute top-0 left-0 h-1 bg-gradient-to-r from-primary to-accent transition-all duration-700"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-sm font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 flex-1">
                              {task.title}
                            </CardTitle>
                            <div className="text-right ml-2">
                              <div className="text-xs font-bold text-foreground">{task.progress}%</div>
                              <div className="text-xs text-muted-foreground font-medium">DONE</div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Team Avatars */}
                          <div className="flex items-center justify-between">
                            <div className="flex -space-x-2">
                              {task.assignees.slice(0, 3).map((assignee, idx) => (
                                <div
                                  key={idx}
                                  className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold border-2 border-background shadow-sm"
                                >
                                  {assignee.split(" ").map((n: string) => n[0]).join("")}
                                </div>
                              ))}
                              {task.assignees.length > 3 && (
                                <div className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center shadow-sm">
                                  <span className="text-xs font-bold text-muted-foreground">
                                    +{task.assignees.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${task.status === 'complete' ? 'bg-success/20 text-success' :
                              task.status === 'in-progress' ? 'bg-accent/20 text-accent' :
                                task.status === 'review' ? 'bg-warning/20 text-warning' :
                                  task.status === 'upcoming' ? 'bg-primary/20 text-primary' :
                                    'bg-muted/50 text-muted-foreground'
                              }`}>
                              {task.status.replace('-', ' ')}
                            </div>
                          </div>

                          {/* Due Date */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span className="font-medium">{new Date(task.endDate).toLocaleDateString()}</span>
                          </div>

                          {/* Priority Indicator */}
                          <div className="flex items-center justify-between pt-2 border-t border-border/20">
                            <div className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${task.status === 'complete' ? 'bg-success/20 text-success' :
                              task.status === 'in-progress' ? 'bg-accent/20 text-accent' :
                                task.status === 'review' ? 'bg-warning/20 text-warning' :
                                  task.status === 'upcoming' ? 'bg-primary/20 text-primary' :
                                    'bg-muted/50 text-muted-foreground'
                              }`}>
                              {task.status.replace('-', ' ')}
                            </div>
                            <div className={`w-2 h-2 rounded-full ${task.status === 'complete' ? 'bg-success' :
                              task.status === 'in-progress' ? 'bg-accent' :
                                task.status === 'review' ? 'bg-warning' :
                                  task.status === 'upcoming' ? 'bg-primary' :
                                    'bg-muted-foreground'
                              } shadow-sm`}></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          projectMembers={projectMembers}
        />
      )}
    </>
  );
};

export default KanbanBoard;
