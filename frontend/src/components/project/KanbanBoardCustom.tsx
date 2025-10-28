import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  GripVertical, 
  Plus, 
  X, 
  Calendar, 
  Clock, 
  MoreVertical,
  Pencil,
  Trash2
} from "lucide-react";
import TaskModal from "./TaskModal";
import TaskFormModal from "./TaskFormModal";

interface Task {
  id: number;
  title: string;
  assignees: string[];
  startDate: string;
  endDate: string;
  columnId: string; // Which custom column it belongs to
  progress: number;
}

interface CustomColumn {
  id: string;
  title: string;
  color: string;
}

interface KanbanBoardCustomProps {
  projectMembers: any[];
}

const KanbanBoardCustom = ({ projectMembers }: KanbanBoardCustomProps) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [addingCardInColumn, setAddingCardInColumn] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnTitle, setEditingColumnTitle] = useState("");

  // Custom columns - user can create/edit/delete these
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>([
    { id: "todo", title: "To Do", color: "slate" },
    { id: "in-progress", title: "In Progress", color: "blue" },
    { id: "done", title: "Done", color: "green" },
  ]);

  // Mock tasks - will be replaced with real data
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "Design landing page mockup",
      assignees: ["John Doe", "Jane Smith"],
      startDate: "2024-01-15",
      endDate: "2024-01-20",
      columnId: "done",
      progress: 100,
    },
    {
      id: 2,
      title: "Implement authentication",
      assignees: ["Jane Smith", "Mike Johnson"],
      startDate: "2024-01-10",
      endDate: "2024-01-18",
      columnId: "in-progress",
      progress: 60,
    },
    {
      id: 3,
      title: "Write API documentation",
      assignees: ["Mike Johnson"],
      startDate: "2024-01-20",
      endDate: "2024-01-25",
      columnId: "todo",
      progress: 0,
    },
  ]);

  const handleCreateTask = (taskData: any) => {
    // TODO: Implement create task logic with backend
    console.log("Creating custom task:", taskData);
  };

  const handleQuickAddCard = (columnId: string) => {
    if (newCardTitle.trim()) {
      // TODO: Implement quick add task logic with backend
      const newTask: Task = {
        id: Date.now(),
        title: newCardTitle,
        assignees: [],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        columnId: columnId,
        progress: 0,
      };
      setTasks([...tasks, newTask]);
      console.log("Quick adding task:", newTask);
      
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
        color: "slate",
      };
      setCustomColumns([...customColumns, newColumn]);
      setNewColumnTitle("");
      setIsAddingColumn(false);
      // TODO: Save to backend
      console.log("Column added:", newColumn);
    }
  };

  const handleStartEditColumn = (column: CustomColumn) => {
    setEditingColumnId(column.id);
    setEditingColumnTitle(column.title);
  };

  const handleSaveColumnEdit = (columnId: string) => {
    if (editingColumnTitle.trim()) {
      setCustomColumns(customColumns.map(col => 
        col.id === columnId ? { ...col, title: editingColumnTitle } : col
      ));
      setEditingColumnId(null);
      setEditingColumnTitle("");
      // TODO: Save to backend
      console.log("Column edited:", columnId);
    }
  };

  const handleDeleteColumn = (columnId: string) => {
    // Move tasks from deleted column to first column
    const firstColumnId = customColumns[0]?.id;
    if (firstColumnId) {
      setTasks(tasks.map(task => 
        task.columnId === columnId ? { ...task, columnId: firstColumnId } : task
      ));
    }
    setCustomColumns(customColumns.filter(col => col.id !== columnId));
    // TODO: Remove from backend
    console.log("Column deleted:", columnId);
  };

  // Drag and drop handlers (simplified - you'll want to add a library like @dnd-kit/core)
  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("taskId", taskId.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData("taskId"));
    
    // Move task to new column
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, columnId } : task
    ));
    
    // TODO: Save to backend
    console.log(`Moved task ${taskId} to column ${columnId}`);
  };

  const getTasksByColumn = (columnId: string) => {
    return tasks.filter((task) => task.columnId === columnId);
  };

  const getColumnColor = (color: string) => {
    const colors: Record<string, string> = {
      slate: "bg-slate-100 border-slate-300",
      blue: "bg-blue-50 border-blue-300",
      green: "bg-green-50 border-green-300",
      yellow: "bg-yellow-50 border-yellow-300",
      red: "bg-red-50 border-red-300",
      purple: "bg-purple-50 border-purple-300",
    };
    return colors[color] || colors.slate;
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-900">Custom Workflow Board</h2>
            <Badge variant="outline" className="text-xs font-normal border-purple-300 text-purple-700 bg-purple-50">
              <GripVertical className="w-3 h-3 mr-1" />
              Drag & Drop
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">Create custom columns and move tasks manually</p>
        </div>
        <Button
          onClick={() => setIsCreateTaskModalOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Kanban Board with Drag & Drop */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {customColumns.map((column) => {
          const columnTasks = getTasksByColumn(column.id);

          return (
            <div 
              key={column.id} 
              className="flex-shrink-0 w-80 bg-slate-50 rounded-lg border border-slate-200"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-slate-200">
                {editingColumnId === column.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      autoFocus
                      value={editingColumnTitle}
                      onChange={(e) => setEditingColumnTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveColumnEdit(column.id);
                        } else if (e.key === 'Escape') {
                          setEditingColumnId(null);
                          setEditingColumnTitle("");
                        }
                      }}
                      className="h-8 text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSaveColumnEdit(column.id)}
                      className="h-8 px-2"
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-slate-700">
                        {column.title}
                      </h3>
                      <span className="text-xs text-slate-500 font-medium bg-slate-200 px-2 py-0.5 rounded-full">
                        {columnTasks.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartEditColumn(column)}
                        className="h-6 w-6 p-0 hover:bg-slate-200 transition-colors"
                        title="Edit column"
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      {customColumns.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteColumn(column.id)}
                          className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
                          title="Delete column"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Column Content */}
              <div className="p-2">
                <div className="space-y-2 min-h-[500px]">
                  {columnTasks.length === 0 ? (
                    <div className="flex items-center justify-center h-24 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                      <p className="text-xs">Drop tasks here</p>
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <Card
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="cursor-move group bg-white border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200"
                      >
                        <CardContent className="p-3 space-y-3">
                          {/* Drag Handle & Title */}
                          <div className="flex items-start gap-2">
                            <GripVertical className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                            <h4 
                              className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 flex-1"
                              onClick={() => setSelectedTask(task)}
                            >
                              {task.title}
                            </h4>
                          </div>

                          {/* Progress Bar */}
                          {task.progress > 0 && (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-medium">Progress</span>
                                <span className="text-xs font-semibold text-slate-700">{task.progress}%</span>
                              </div>
                              <Progress value={task.progress} className="h-1.5" />
                            </div>
                          )}

                          {/* Footer: Dates & Assignees */}
                          <div className="flex items-center justify-between">
                            {/* Dates */}
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(task.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>

                            {/* Assignees */}
                            {task.assignees.length > 0 && (
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
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                  
                  {/* Add Card Section */}
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
                          className="bg-blue-600 hover:bg-blue-700 text-white h-8 flex-1"
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
                      className="w-full justify-start text-slate-600 hover:bg-slate-200 h-9 text-sm font-normal"
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
          <div className="flex-shrink-0 w-80">
            <Button
              variant="ghost"
              onClick={() => setIsAddingColumn(true)}
              className="w-full h-full min-h-[200px] flex flex-col items-center justify-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm font-medium">Add another list</span>
            </Button>
          </div>
        ) : (
          <div className="flex-shrink-0 w-80 bg-slate-50 rounded-lg border border-slate-200 p-4 flex flex-col gap-2">
            <Input
              autoFocus
              placeholder="Enter list title..."
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
                Add list
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

export default KanbanBoardCustom;
