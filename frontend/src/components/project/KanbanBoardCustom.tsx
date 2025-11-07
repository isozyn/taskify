import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { api, Task as ApiTask, CustomColumn } from "@/lib/api";
import { useProjectTasks, useCustomColumns, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/useProjectData";
import { useQueryClient } from "@tanstack/react-query";
import { projectKeys } from "@/hooks/useProjectData";

interface KanbanBoardCustomProps {
  projectMembers: any[];
  projectId?: number;
  onTasksChange?: () => void;
  onColumnsChange?: () => void;
}

const KanbanBoardCustom = ({ projectMembers, projectId, onTasksChange, onColumnsChange }: KanbanBoardCustomProps) => {
  const [selectedTask, setSelectedTask] = useState<ApiTask | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [addingCardInColumn, setAddingCardInColumn] = useState<number | string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [editingColumnId, setEditingColumnId] = useState<number | string | null>(null);
  const [editingColumnTitle, setEditingColumnTitle] = useState("");

  // Use cached data
  const { data: tasks = [], isLoading: isLoadingTasks } = useProjectTasks(projectId);
  const { data: customColumns = [], isLoading: isLoadingColumns } = useCustomColumns(projectId, true);
  const createTaskMutation = useCreateTask(projectId);
  const updateTaskMutation = useUpdateTask(projectId);
  const deleteTaskMutation = useDeleteTask(projectId);
  const queryClient = useQueryClient();

  const isLoading = isLoadingTasks || isLoadingColumns;

  // Helper function to map column title to valid TaskStatus enum
  const mapColumnTitleToStatus = (columnTitle: string): string => {
    // Map common column titles to valid enum values
    const titleLower = columnTitle.toLowerCase().trim();
    
    if (titleLower.includes('to do') || titleLower === 'todo' || titleLower === 'backlog') {
      return 'TODO';
    }
    if (titleLower.includes('in progress') || titleLower === 'doing' || titleLower === 'in development') {
      return 'IN_PROGRESS';
    }
    if (titleLower.includes('review') || titleLower === 'in review') {
      return 'IN_REVIEW';
    }
    if (titleLower.includes('done') || titleLower === 'complete' || titleLower === 'completed' || titleLower === 'finished') {
      return 'COMPLETED';
    }
    if (titleLower.includes('block') || titleLower === 'blocked' || titleLower === 'on hold') {
      return 'BLOCKED';
    }
    
    // Default fallback to TODO for any other custom column
    return 'TODO';
  };

  const handleCreateTask = async (taskData: any) => {
    if (!projectId) return;
    
    try {
      const newTask: any = await api.createTask(projectId, taskData);

      // Create subtasks if any
      if (taskData.subtasks && taskData.subtasks.length > 0 && newTask.id) {
        const taskId = newTask.id;
        for (let i = 0; i < taskData.subtasks.length; i++) {
          const subtask = taskData.subtasks[i];
          await api.createSubtask(taskId, {
            title: subtask.title,
            order: i,
          });
        }
      }
      
      // Invalidate cache to refresh
      queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId) });
      
      // Notify parent to refresh
      onTasksChange?.();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleQuickAddCard = async (columnId: number | string) => {
    if (newCardTitle.trim() && projectId) {
      try {
        // Find the column to get its title
        const column = customColumns.find(col => col.id === columnId);
        const columnTitle = column ? column.title : 'To Do';
        const statusValue = mapColumnTitleToStatus(columnTitle);
        
        await api.createTask(projectId, {
          title: newCardTitle,
          status: statusValue,
          priority: 'MEDIUM',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
        
        // Invalidate cache to refresh
        queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId) });
        
        // Notify parent to refresh
        onTasksChange?.();
        
        // Reset
        setNewCardTitle("");
        setAddingCardInColumn(null);
      } catch (error) {
        console.error('Failed to quick add task:', error);
      }
    }
  };

  const handleCancelAddCard = () => {
    setNewCardTitle("");
    setAddingCardInColumn(null);
  };

  const handleAddColumn = async () => {
    if (newColumnTitle.trim() && projectId) {
      try {
        const newColumnData = {
          title: newColumnTitle,
          color: "slate",
          order: customColumns.length, // Add at the end
        };
        
        const newColumn = await api.createCustomColumn(projectId, newColumnData);
        
        // Invalidate cache to refresh
        queryClient.invalidateQueries({ queryKey: projectKeys.columns(projectId) });
        
        setNewColumnTitle("");
        setIsAddingColumn(false);
        
        // Notify parent that columns have changed
        onColumnsChange?.();
      } catch (error) {
        console.error('Failed to create column:', error);
      }
    }
  };

  const handleStartEditColumn = (column: CustomColumn) => {
    setEditingColumnId(column.id);
    setEditingColumnTitle(column.title);
  };

  const handleSaveColumnEdit = async (columnId: number | string) => {
    if (editingColumnTitle.trim() && projectId) {
      try {
        await api.updateCustomColumn(typeof columnId === 'number' ? columnId : parseInt(columnId), {
          title: editingColumnTitle,
        });
        
        // Invalidate cache to refresh
        queryClient.invalidateQueries({ queryKey: projectKeys.columns(projectId) });
        
        setEditingColumnId(null);
        setEditingColumnTitle("");
        
        // Notify parent that columns have changed
        onColumnsChange?.();
      } catch (error) {
        console.error('Failed to update column:', error);
      }
    }
  };

  const handleDeleteColumn = async (columnId: number | string) => {
    if (!projectId) return;
    
    try {
      // Find the column being deleted and the first column
      const deletedColumn = customColumns.find(col => col.id === columnId);
      const firstColumn = customColumns[0];
      
      // Move tasks from deleted column to first column (if not deleting the first column)
      if (firstColumn && firstColumn.id !== columnId && deletedColumn) {
        const deletedStatus = mapColumnTitleToStatus(deletedColumn.title);
        const firstColumnStatus = mapColumnTitleToStatus(firstColumn.title);
        const tasksToMove = tasks.filter(task => task.status === deletedStatus);
        
        for (const task of tasksToMove) {
          try {
            await api.updateTask(task.id, { status: firstColumnStatus });
          } catch (error) {
            console.error('Failed to move task:', error);
          }
        }
        
        // Invalidate tasks cache
        queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId) });
      }
      
      // Delete the column from backend
      await api.deleteCustomColumn(typeof columnId === 'number' ? columnId : parseInt(columnId));
      
      // Invalidate columns cache
      queryClient.invalidateQueries({ queryKey: projectKeys.columns(projectId) });
      
      // Notify parent that columns have changed
      onColumnsChange?.();
    } catch (error) {
      console.error('Failed to delete column:', error);
    }
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

  const handleDrop = async (e: React.DragEvent, columnId: number | string) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData("taskId"));
    
    if (!projectId) return;
    
    try {
      // Find the column to get its title
      const column = customColumns.find(col => col.id === columnId);
      const columnTitle = column ? column.title : 'To Do';
      const statusValue = mapColumnTitleToStatus(columnTitle);
      
      // Update task status via API
      await api.updateTask(taskId, { status: statusValue });
      
      // Invalidate cache to refresh
      queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId) });
      
      // Notify parent to refresh
      onTasksChange?.();
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };

  const getTasksByColumn = (columnId: number | string) => {
    // Find the column to get its title
    const column = customColumns.find(col => col.id === columnId);
    const columnTitle = column ? column.title : '';
    const statusValue = mapColumnTitleToStatus(columnTitle);
    return tasks.filter((task) => task.status === statusValue);
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

  const handleTaskUpdated = async () => {
    if (!projectId) return;
    
    try {
      queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId) });
      onTasksChange?.();
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to refresh tasks:', error);
    }
  };

  const handleTaskDeleted = async () => {
    if (!projectId) return;
    
    try {
      queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId) });
      onTasksChange?.();
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to refresh tasks:', error);
    }
  };

  return (
    <>
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-slate-900">Custom Workflow Board</h2>
          <Badge variant="outline" className="text-xs font-normal border-purple-300 text-purple-700 bg-purple-50">
            <GripVertical className="w-3 h-3 mr-1" />
            Drag & Drop
          </Badge>
        </div>
        <p className="text-sm text-slate-500 mt-1">Create custom columns and move tasks manually</p>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-sm text-slate-500">Loading tasks...</p>
        </div>
      ) : (
        <>
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
                        onClick={() => setSelectedTask(task)}
                        className="cursor-pointer group bg-white border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200"
                      >
                        <CardContent className="p-3 space-y-3">
                          {/* Drag Handle & Title */}
                          <div className="flex items-start gap-2">
                            <GripVertical className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                            <h4 
                              className="text-sm font-medium text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-2 flex-1"
                            >
                              {task.title}
                            </h4>
                          </div>

                          {/* Progress Bar */}
                          {task.status === 'COMPLETED' && (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-medium">Progress</span>
                                <span className="text-xs font-semibold text-slate-700">100%</span>
                              </div>
                              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
                                  style={{ width: '100%' }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Footer: Dates & Assignee */}
                          <div className="flex items-center justify-between">
                            {/* Dates */}
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Calendar className="w-3 h-3" />
                              <span>{task.endDate ? new Date(task.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}</span>
                            </div>

                            {/* Assignee */}
                            {task.assignee && (
                              <div className="flex">
                                <div
                                  className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
                                  title={task.assignee.name}
                                >
                                  {task.assignee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </div>
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
                          className="bg-purple-600 hover:bg-purple-700 text-white h-8 flex-1"
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
                className="bg-purple-600 hover:bg-purple-700 text-white h-8 flex-1"
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
          onClose={() => {
            setSelectedTask(null);
            // Refresh tasks when modal closes
            if (projectId) {
              queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId) });
              onTasksChange?.();
            }
          }}
          onDelete={async (taskId) => {
            await deleteTaskMutation.mutateAsync(taskId);
            setSelectedTask(null);
            onTasksChange?.();
          }}
          onTaskUpdate={async () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId) });
            onTasksChange?.();
          }}
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
      )}
    </>
  );
};

export default KanbanBoardCustom;
