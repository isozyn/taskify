import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Clock, AlertCircle, FileText, Archive, Plus } from "lucide-react";
import TaskModal from "./TaskModal";
import TaskFormModal from "./TaskFormModal";

interface Task {
  id: number;
  title: string;
  assignees: string[];
  startDate: string;
  endDate: string;
  status: "upcoming" | "in-progress" | "review" | "complete" | "backlog";
  progress: number;
}

interface KanbanBoardAutoSyncProps {
  projectMembers: any[];
}

const KanbanBoardAutoSync = ({ projectMembers }: KanbanBoardAutoSyncProps) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  const handleCreateTask = (taskData: any) => {
    // TODO: Implement create task logic with backend
    // Tasks will automatically move based on their dates
    console.log("Creating auto-sync task:", taskData);
  };

  // Mock tasks - will be replaced with real data
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

  // Fixed columns for auto-sync mode
  const columns = [
    {
      id: "upcoming",
      title: "Upcoming",
      icon: Clock,
      description: "Tasks scheduled for the future",
    },
    {
      id: "in-progress",
      title: "In Progress",
      icon: FileText,
      description: "Currently active tasks",
    },
    {
      id: "review",
      title: "Review",
      icon: AlertCircle,
      description: "Awaiting review or approval",
    },
    {
      id: "complete",
      title: "Complete",
      icon: CheckCircle2,
      description: "Finished tasks",
    },
    {
      id: "backlog",
      title: "Backlog",
      icon: Archive,
      description: "Postponed or archived tasks",
    },
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-900">Automated Workflow Board</h2>
            <Badge variant="outline" className="text-xs font-normal border-blue-300 text-blue-700 bg-blue-50">
              <Calendar className="w-3 h-3 mr-1" />
              Auto-Sync
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">Tasks move automatically based on dates and progress</p>
        </div>
        <Button
          onClick={() => setIsCreateTaskModalOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {columns.map((column) => {
          const Icon = column.icon;
          const columnTasks = getTasksByStatus(column.id);

          return (
            <div key={column.id} className="bg-slate-50 rounded-lg border border-slate-200">
              {/* Column Header */}
              <div className="p-3 border-b border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-slate-600" />
                  <h3 className="font-semibold text-xs text-slate-700 uppercase tracking-wide">
                    {column.title}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium bg-slate-200 px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{column.description}</p>
              </div>

              {/* Column Content */}
              <div className="p-2">
                <div className="space-y-2 min-h-[500px]">
                  {columnTasks.length === 0 ? (
                    <div className="flex items-center justify-center h-24 text-slate-400">
                      <div className="text-center">
                        <Icon className="w-5 h-5 mx-auto mb-1.5 opacity-40" />
                        <p className="text-xs">No tasks yet</p>
                      </div>
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <Card
                        key={task.id}
                        className="cursor-pointer group bg-white border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200"
                        onClick={() => setSelectedTask(task)}
                      >
                        <CardContent className="p-3 space-y-3">
                          {/* Task Title */}
                          <h4 className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {task.title}
                          </h4>

                          {/* Progress Bar */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500 font-medium">Progress</span>
                              <span className="text-xs font-semibold text-slate-700">{task.progress}%</span>
                            </div>
                            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Dates */}
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(task.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                            <span>→</span>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(task.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                          </div>

                          {/* Assignees */}
                          <div className="flex items-center justify-between">
                            <div className="flex -space-x-2">
                              {task.assignees.slice(0, 3).map((assignee, idx) => (
                                <div
                                  key={idx}
                                  className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
                                  title={assignee}
                                >
                                  {assignee.split(" ").map((n: string) => n[0]).join("")}
                                </div>
                              ))}
                              {task.assignees.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-slate-600 text-[10px] font-bold shadow-sm">
                                  +{task.assignees.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
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
          projectMembers={projectMembers}
        />
      )}

      {/* Create Task Modal */}
      <TaskFormModal
        isOpen={isCreateTaskModalOpen}
        onOpenChange={setIsCreateTaskModalOpen}
        onSubmit={handleCreateTask}
        projectMembers={projectMembers}
        mode="create"
      />
    </>
  );
};

export default KanbanBoardAutoSync;
