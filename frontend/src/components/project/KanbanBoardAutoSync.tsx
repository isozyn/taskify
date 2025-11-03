import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Clock, AlertCircle, FileText, Archive, Plus } from "lucide-react";
import TaskModal from "./TaskModal";
import TaskFormModal from "./TaskFormModal";
import { api, Task } from "@/lib/api";

interface KanbanBoardAutoSyncProps {
  projectMembers: any[];
  projectId?: number;
  onTasksChange?: () => void;
}

const KanbanBoardAutoSync = ({ projectMembers, projectId: propProjectId, onTasksChange }: KanbanBoardAutoSyncProps) => {
  const { id: urlProjectId } = useParams();
  const projectId = propProjectId || (urlProjectId ? parseInt(urlProjectId) : undefined);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      if (!projectId) return;
      
      try {
        setIsLoading(true);
        const response: any = await api.getTasksByProject(projectId);
        console.log("KanbanBoard - Fetched tasks:", response);
        setTasks(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  const handleCreateTask = async (taskData: any) => {
    if (!projectId) return;
    
    try {
      // Find the first assigned member and get their ID
      let assigneeId = null;
      if (taskData.assignees && taskData.assignees.length > 0) {
        const assigneeName = taskData.assignees[0]; // Take first assignee for now
        const assignee = projectMembers.find(member => member.name === assigneeName);
        assigneeId = assignee ? assignee.id : null;
      }

      const newTask = await api.createTask(projectId, {
        title: taskData.title,
        description: taskData.description,
        startDate: taskData.startDate,
        endDate: taskData.endDate,
        priority: taskData.priority || 'MEDIUM',
        assigneeId: assigneeId,
        tags: taskData.tags || [],
      });
      
      console.log("Task created successfully:", newTask);
      
      // Refresh tasks list
      const response: any = await api.getTasksByProject(projectId);
      setTasks(Array.isArray(response) ? response : []);
      
      // Notify parent component to refresh
      console.log("Calling onTasksChange to refresh Overview");
      onTasksChange?.();
      
      setIsCreateTaskModalOpen(false);
    } catch (error: any) {
      console.error('Failed to create task:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      alert(`Failed to create task: ${errorMessage}`);
    }
  };



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

  const getTasksByStatus = (columnId: string) => {
    // Map column IDs to Task status values
    const statusMap: { [key: string]: string } = {
      "upcoming": "TODO",
      "in-progress": "IN_PROGRESS", 
      "review": "IN_REVIEW",
      "complete": "COMPLETED",
      "backlog": "BLOCKED"
    };
    
    const taskStatus = statusMap[columnId];
    return tasks.filter((task) => task.status === taskStatus);
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

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading tasks...</p>
          </div>
        </div>
      ) : (
        /* Kanban Board */
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

                          {/* Priority Badge */}
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                task.priority === 'URGENT' ? 'border-red-300 text-red-700 bg-red-50' :
                                task.priority === 'HIGH' ? 'border-orange-300 text-orange-700 bg-orange-50' :
                                task.priority === 'MEDIUM' ? 'border-blue-300 text-blue-700 bg-blue-50' :
                                'border-gray-300 text-gray-700 bg-gray-50'
                              }`}
                            >
                              {task.priority}
                            </Badge>
                            {task.tags.length > 0 && (
                              <div className="flex gap-1">
                                {task.tags.slice(0, 2).map((tag, idx) => (
                                  <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Dates */}
                          {(task.startDate || task.endDate) && (
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              {task.startDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(task.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                </div>
                              )}
                              {task.startDate && task.endDate && <span>→</span>}
                              {task.endDate && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{new Date(task.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Assignee */}
                          {task.assignee && (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
                                title={task.assignee.name}
                              >
                                {task.assignee.name.split(" ").map((n: string) => n[0]).join("")}
                              </div>
                              <span className="text-xs text-slate-600">{task.assignee.name}</span>
                            </div>
                          )}
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
      )}

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
