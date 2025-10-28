import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Calendar, CheckCircle2, Clock, AlertCircle, FileText, Archive, Plus, X } from "lucide-react";
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

interface KanbanBoardProps {
  projectMembers: any[];
}

interface CustomColumn {
  id: string;
  title: string;
  isCustom: boolean;
}

const KanbanBoard = ({ projectMembers }: KanbanBoardProps) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [addingCardInColumn, setAddingCardInColumn] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>([]);

  const handleCreateTask = (taskData: any) => {
    // TODO: Implement create task logic with backend
    console.log("Creating task:", taskData);
  };

  const handleQuickAddCard = (columnId: string) => {
    if (newCardTitle.trim()) {
      // TODO: Implement quick add task logic with backend
      console.log("Quick adding task:", {
        title: newCardTitle,
        status: columnId,
      });
      // Reset
      setNewCardTitle("");
      setAddingCardInColumn(null);
    }
  };

  const handleCancelAddCard = () => {
    setNewCardTitle("");
    setAddingCardInColumn(null);
  };

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      const newColumn: CustomColumn = {
        id: `custom-${Date.now()}`,
        title: newColumnTitle,
        isCustom: true,
      };
      setCustomColumns([...customColumns, newColumn]);
      setNewColumnTitle("");
      setIsAddingColumn(false);
      // TODO: Save to backend
      console.log("Column added:", newColumn);
    }
  };

  const handleDeleteColumn = (columnId: string) => {
    setCustomColumns(customColumns.filter(col => col.id !== columnId));
    // TODO: Remove from backend
    console.log("Column deleted:", columnId);
  };

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
      isCustom: false,
    },
    {
      id: "in-progress",
      title: "In Progress",
      icon: FileText,
      color: "text-accent",
      bgColor: "bg-gradient-to-br from-accent/10 to-accent/5",
      borderColor: "border-accent/20",
      isCustom: false,
    },
    {
      id: "review",
      title: "Review",
      icon: AlertCircle,
      color: "text-warning",
      bgColor: "bg-gradient-to-br from-warning/10 to-warning/5",
      borderColor: "border-warning/20",
      isCustom: false,
    },
    {
      id: "complete",
      title: "Complete",
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-gradient-to-br from-success/10 to-success/5",
      borderColor: "border-success/20",
      isCustom: false,
    },
    {
      id: "backlog",
      title: "Backlog",
      icon: Archive,
      color: "text-muted-foreground",
      bgColor: "bg-gradient-to-br from-muted/20 to-muted/10",
      borderColor: "border-muted/30",
      isCustom: false,
    },
    ...customColumns.map(col => ({
      id: col.id,
      title: col.title,
      icon: FileText,
      color: "text-slate-600",
      bgColor: "bg-gradient-to-br from-slate-100/50 to-slate-50/50",
      borderColor: "border-slate-300",
      isCustom: true,
    })),
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <>
      {/* Kanban Board - Clean Jira-Inspired Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {columns.map((column) => {
          const Icon = column.icon;
          const columnTasks = getTasksByStatus(column.id);

          return (
            <div key={column.id} className="bg-slate-50 rounded-lg border border-slate-200">
              {/* Column Header */}
              <div className="p-3 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-xs text-slate-700 uppercase tracking-wide">
                      {column.title}
                    </h3>
                    <span className="text-xs text-slate-500 font-medium bg-slate-200 px-2 py-0.5 rounded-full">
                      {columnTasks.length}
                    </span>
                  </div>
                  {column.isCustom && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteColumn(column.id)}
                      className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
                      title="Delete column"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
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
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500">Progress</span>
                              <span className="font-semibold text-slate-700">{task.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  task.status === 'complete' ? 'bg-green-500' :
                                  task.status === 'in-progress' ? 'bg-blue-500' :
                                  task.status === 'review' ? 'bg-amber-500' :
                                  'bg-slate-400'
                                }`}
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Team Avatars */}
                          <div className="flex items-center justify-between">
                            <div className="flex -space-x-1.5">
                              {task.assignees.slice(0, 3).map((assignee, idx) => (
                                <div
                                  key={idx}
                                  className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-[10px] font-semibold border-2 border-white shadow-sm"
                                  title={assignee}
                                >
                                  {assignee.split(" ").map((n: string) => n[0]).join("")}
                                </div>
                              ))}
                              {task.assignees.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center shadow-sm">
                                  <span className="text-[10px] font-semibold text-slate-600">
                                    +{task.assignees.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Status Badge */}
                            <div className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              task.status === 'complete' ? 'bg-green-100 text-green-700' :
                              task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                              task.status === 'review' ? 'bg-amber-100 text-amber-700' :
                              task.status === 'upcoming' ? 'bg-slate-100 text-slate-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {task.status === 'in-progress' ? 'IN PROGRESS' : task.status.replace('-', ' ')}
                            </div>
                          </div>

                          {/* Due Date */}
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1 border-t border-slate-100">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(task.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                  
                  {/* Add Card Section - Trello Style */}
                  {addingCardInColumn === column.id ? (
                    <div className="space-y-2">
                      <Textarea
                        autoFocus
                        placeholder="Enter a title for this card..."
                        value={newCardTitle}
                        onChange={(e) => setNewCardTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleQuickAddCard(column.id);
                          } else if (e.key === 'Escape') {
                            handleCancelAddCard();
                          }
                        }}
                        className="min-h-[60px] resize-none bg-white border-slate-300 text-sm"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleQuickAddCard(column.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white h-8"
                        >
                          Add card
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelAddCard}
                          className="h-8 hover:bg-slate-100 text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={() => setAddingCardInColumn(column.id)}
                      className="w-full justify-start text-slate-600 hover:bg-slate-100 hover:text-slate-900 h-9 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add a card
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Column Button */}
        {!isAddingColumn ? (
          <div className="bg-slate-50 rounded-lg border border-dashed border-slate-300 p-4 flex items-center justify-center min-h-[200px]">
            <Button
              variant="ghost"
              onClick={() => setIsAddingColumn(true)}
              className="w-full flex flex-col items-center justify-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 h-auto py-6 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm font-medium">Add list</span>
            </Button>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 flex flex-col gap-2">
            <Input
              autoFocus
              placeholder="Enter list name..."
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddColumn();
                } else if (e.key === 'Escape') {
                  setNewColumnTitle("");
                  setIsAddingColumn(false);
                }
              }}
              className="h-10 border-slate-300 text-sm"
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleAddColumn}
                className="bg-blue-600 hover:bg-blue-700 text-white h-8 flex-1"
              >
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setNewColumnTitle("");
                  setIsAddingColumn(false);
                }}
                className="h-8 hover:bg-slate-100 text-slate-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
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

export default KanbanBoard;
