import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, X, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface Task {
  id: number;
  title: string;
  description: string;
  status: "backlog" | "upcoming" | "in-progress" | "review" | "complete";
  startDate: string;
  endDate: string;
  assignees: string[];
  priority: string;
  labelText?: string | null;
  labelColor?: string | null;
}

interface TaskFormData {
  title: string;
  description: string;
  status: Task["status"];
  startDate: string;
  endDate: string;
  assignees: string[];
  priority: string;
  labelText?: string;
  labelColor?: string;
  subtasks?: Array<{ title: string; completed: boolean }>;
}

interface TaskFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: TaskFormData) => void;
  projectMembers: any[];
  editTask?: Task | null;
  mode?: "create" | "edit";
  workflowType?: "AUTOMATED" | "CUSTOM";
}

const TaskFormModal = ({
  isOpen,
  onOpenChange,
  onSubmit,
  projectMembers,
  editTask = null,
  mode = "create",
  workflowType = "CUSTOM",
}: TaskFormModalProps) => {
  const [taskData, setTaskData] = useState<TaskFormData>({
    title: "",
    description: "",
    status: "upcoming",
    startDate: "",
    endDate: "",
    assignees: [],
    priority: "medium",
    labelText: "",
    labelColor: "#64748b",
    subtasks: [],
  });

  const [newSubtask, setNewSubtask] = useState("");

  // Reset or populate form when modal opens or editTask changes
  useEffect(() => {
    if (editTask && mode === "edit") {
      setTaskData({
        title: editTask.title,
        description: editTask.description,
        status: editTask.status,
        startDate: editTask.startDate,
        endDate: editTask.endDate,
        assignees: editTask.assignees,
        priority: editTask.priority,
        labelText: editTask.labelText || "",
        labelColor: editTask.labelColor || "#64748b",
        subtasks: [],
      });
    } else {
      setTaskData({
        title: "",
        description: "",
        status: "upcoming",
        startDate: "",
        endDate: "",
        assignees: [],
        priority: "medium",
        labelText: "",
        labelColor: "#64748b",
        subtasks: [],
      });
    }
  }, [editTask, mode, isOpen]);

  const handleSubmit = () => {
    onSubmit(taskData);
    onOpenChange(false);
  };

  const handleAssigneeToggle = (memberName: string) => {
    const isSelected = taskData.assignees.includes(memberName);
    if (isSelected) {
      setTaskData({
        ...taskData,
        assignees: taskData.assignees.filter(name => name !== memberName)
      });
    } else {
      setTaskData({
        ...taskData,
        assignees: [...taskData.assignees, memberName]
      });
    }
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setTaskData({
        ...taskData,
        subtasks: [...(taskData.subtasks || []), { title: newSubtask.trim(), completed: false }]
      });
      setNewSubtask("");
    }
  };

  const removeSubtask = (index: number) => {
    setTaskData({
      ...taskData,
      subtasks: taskData.subtasks?.filter((_, i) => i !== index) || []
    });
  };

  const toggleSubtask = (index: number) => {
    const updatedSubtasks = [...(taskData.subtasks || [])];
    updatedSubtasks[index].completed = !updatedSubtasks[index].completed;
    setTaskData({
      ...taskData,
      subtasks: updatedSubtasks
    });
  };

  const isFormValid = taskData.title.trim() && taskData.endDate;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white border-0 shadow-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="border-b border-slate-200 pb-4 space-y-2">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-slate-900">
            {mode === "create" ? (
              <>
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-blue-600" />
                </div>
                Create New Task
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Edit className="w-4 h-4 text-blue-600" />
                </div>
                Edit Task
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            {mode === "create" 
              ? "Add a new task to your project board" 
              : "Update task details and settings"}
          </DialogDescription>
        </DialogHeader>

  <div className="overflow-y-auto max-h-[calc(90vh-220px)] px-1 pb-24">
          <div className="space-y-5 py-6">
            {/* Task Title */}
            <div className="space-y-2">
              <Label htmlFor="task-title" className="text-sm font-semibold text-slate-900">
                Task Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="task-title"
                value={taskData.title}
                onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                placeholder="Enter task title"
                className="h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="task-description" className="text-sm font-semibold text-slate-900">
                Description
              </Label>
              <Textarea
                id="task-description"
                value={taskData.description}
                onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                placeholder="Enter task description"
                rows={4}
                className="border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all resize-none"
              />
            </div>

            {/* Status and Priority */}
            <div className={`grid ${workflowType === "AUTOMATED" ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
              {workflowType !== "AUTOMATED" && (
                <div className="space-y-2">
                  <Label htmlFor="task-status" className="text-sm font-semibold text-slate-900">
                    Status
                  </Label>
                  <Select 
                    value={taskData.status} 
                    onValueChange={(value: Task["status"]) => setTaskData({ ...taskData, status: value })}
                  >
                    <SelectTrigger className="h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="backlog">Backlog</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="complete">Complete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="task-priority" className="text-sm font-semibold text-slate-900">
                  Priority
                </Label>
                <Select 
                  value={taskData.priority} 
                  onValueChange={(value) => setTaskData({ ...taskData, priority: value })}
                >
                  <SelectTrigger className="h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date" className="text-sm font-semibold text-slate-900">
                  Start Date
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={taskData.startDate}
                  onChange={(e) => setTaskData({ ...taskData, startDate: e.target.value })}
                  className="h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date" className="text-sm font-semibold text-slate-900">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={taskData.endDate}
                  onChange={(e) => setTaskData({ ...taskData, endDate: e.target.value })}
                  className="h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all"
                />
              </div>
            </div>

            {/* Label */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="label-text" className="text-sm font-semibold text-slate-900">
                  Label Text
                </Label>
                <Input
                  id="label-text"
                  type="text"
                  placeholder="Enter label text"
                  value={taskData.labelText || ""}
                  onChange={(e) => setTaskData({ ...taskData, labelText: e.target.value })}
                  className="h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="label-color" className="text-sm font-semibold text-slate-900">
                  Label Color
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="label-color"
                    type="color"
                    value={taskData.labelColor || "#64748b"}
                    onChange={(e) => setTaskData({ ...taskData, labelColor: e.target.value })}
                    className="h-10 w-16 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all p-1"
                  />
                  <Input
                    type="text"
                    value={taskData.labelColor || "#64748b"}
                    onChange={(e) => setTaskData({ ...taskData, labelColor: e.target.value })}
                    className="h-10 flex-1 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all"
                    placeholder="#64748b"
                  />
                </div>
              </div>
            </div>

            {/* Subtasks */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-900">
                Subtasks
              </Label>
              <div className="space-y-2">
                {taskData.subtasks && taskData.subtasks.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto p-3 border border-slate-200 rounded-lg bg-slate-50/50">
                    {taskData.subtasks.map((subtask, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-md hover:border-blue-300 transition-colors"
                      >
                        <Checkbox
                          checked={subtask.completed}
                          onCheckedChange={() => toggleSubtask(index)}
                          className="border-slate-300"
                        />
                        <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                          {subtask.title}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSubtask(index)}
                          className="h-7 w-7 hover:bg-red-50 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a subtask..."
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSubtask();
                      }
                    }}
                    className="h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg"
                  />
                  <Button
                    type="button"
                    onClick={addSubtask}
                    className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {taskData.subtasks && taskData.subtasks.length > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    {taskData.subtasks.filter(st => st.completed).length} of {taskData.subtasks.length} completed
                  </p>
                )}
              </div>
            </div>

            {/* Assignees */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-900">
                Assign To
              </Label>
              <div className="flex flex-wrap gap-2 p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                {projectMembers.map((member: any) => {
                  const isSelected = taskData.assignees.includes(member.name);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => handleAssigneeToggle(member.name)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm hover:bg-blue-700' 
                          : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                        isSelected 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                      }`}>
                        {member.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium">{member.name}</span>
                    </button>
                  );
                })}
              </div>
              {taskData.assignees.length === 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  Select team members to assign to this task
                </p>
              )}
              {taskData.assignees.length > 0 && (
                <p className="text-xs text-blue-600 mt-1 font-medium">
                  {taskData.assignees.length} member{taskData.assignees.length > 1 ? 's' : ''} assigned
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 z-20 bg-white border-t border-slate-200 p-4 flex justify-end gap-3">
          <div className="flex-1" />
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 font-medium border-slate-300 hover:bg-slate-50 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="h-10 font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mode === "create" ? "Create Task" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskFormModal;
