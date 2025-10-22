import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, CheckCircle2, Clock, AlertCircle, FileText, Archive } from "lucide-react";
import TaskModal from "./TaskModal";

interface Task {
  id: number;
  title: string;
  assignee: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "in-progress" | "review" | "complete" | "backlog";
  progress: number;
}

const KanbanBoard = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Mock tasks - will be replaced with real data
  const tasks: Task[] = [
    {
      id: 1,
      title: "Design landing page mockup",
      assignee: "John Doe",
      startDate: "2024-01-15",
      endDate: "2024-01-20",
      status: "complete",
      progress: 100,
    },
    {
      id: 2,
      title: "Implement authentication",
      assignee: "Jane Smith",
      startDate: "2024-01-10",
      endDate: "2024-01-18",
      status: "in-progress",
      progress: 60,
    },
    {
      id: 3,
      title: "Write API documentation",
      assignee: "Mike Johnson",
      startDate: "2024-01-20",
      endDate: "2024-01-25",
      status: "upcoming",
      progress: 0,
    },
    {
      id: 4,
      title: "Database migration",
      assignee: "Sarah Wilson",
      startDate: "2024-01-12",
      endDate: "2024-01-17",
      status: "review",
      progress: 100,
    },
    {
      id: 5,
      title: "Fix payment gateway bug",
      assignee: "Tom Brown",
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
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      id: "in-progress",
      title: "In Progress",
      icon: FileText,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      id: "review",
      title: "Review",
      icon: AlertCircle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      id: "complete",
      title: "Complete",
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      id: "backlog",
      title: "Backlog",
      icon: Archive,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {columns.map((column) => {
          const Icon = column.icon;
          const columnTasks = getTasksByStatus(column.id);

          return (
            <div key={column.id} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded-lg ${column.bgColor}`}>
                  <Icon className={`w-4 h-4 ${column.color}`} />
                </div>
                <h3 className="font-semibold text-sm">{column.title}</h3>
                <Badge variant="secondary" className="ml-auto">
                  {columnTasks.length}
                </Badge>
              </div>

              <div className="space-y-3 min-h-[200px]">
                {columnTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-border/50"
                    onClick={() => setSelectedTask(task)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium line-clamp-2">
                        {task.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span className="truncate">{task.assignee}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{task.endDate}</span>
                      </div>
                      {task.progress > 0 && (
                        <div className="pt-2">
                          <div className="h-1 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </>
  );
};

export default KanbanBoard;
