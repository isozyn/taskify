import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit } from "lucide-react";

interface Task {
  id: number;
  title: string;
  description: string;
  status: "backlog" | "upcoming" | "in-progress" | "review" | "complete";
  startDate: string;
  endDate: string;
  assignees: string[];
  priority: string;
}

interface TaskFormData {
  title: string;
  description: string;
  status: Task["status"];
  startDate: string;
  endDate: string;
  assignees: string[];
  priority: string;
}

interface TaskFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: TaskFormData) => void;
  projectMembers: any[];
  editTask?: Task | null;
  mode?: "create" | "edit";
}

const TaskFormModal = ({
  isOpen,
  onOpenChange,
  onSubmit,
  projectMembers,
  editTask = null,
  mode = "create",
}: TaskFormModalProps) => {
  const [taskData, setTaskData] = useState<TaskFormData>({
    title: "",
    description: "",
    status: "upcoming",
    startDate: "",
    endDate: "",
    assignees: [],
    priority: "medium",
  });

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

  const isFormValid = taskData.title.trim() && taskData.endDate;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white border-2 border-blue-200 shadow-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-blue-900">
            {mode === "create" ? (
              <>
                <Plus className="w-5 h-5 text-blue-600" />
                Create New Task
              </>
            ) : (
              <>
                <Edit className="w-5 h-5 text-blue-600" />
                Edit Task
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {mode === "create" 
              ? "Add a new task to your project board" 
              : "Update task details and settings"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="task-title" className="text-sm font-semibold text-blue-900">
              Task Title *
            </Label>
            <Input
              id="task-title"
              value={taskData.title}
              onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
              placeholder="Enter task title"
              className="h-11 border-2 border-blue-200 focus:border-blue-500 transition-all duration-300"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="task-description" className="text-sm font-semibold text-blue-900">
              Description
            </Label>
            <Textarea
              id="task-description"
              value={taskData.description}
              onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
              placeholder="Enter task description"
              className="min-h-[80px] border-2 border-blue-200 focus:border-blue-500 transition-all duration-300 resize-none"
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-status" className="text-sm font-semibold text-blue-900">
                Status
              </Label>
              <Select 
                value={taskData.status} 
                onValueChange={(value: Task["status"]) => setTaskData({ ...taskData, status: value })}
              >
                <SelectTrigger className="h-11 border-2 border-blue-200">
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

            <div className="space-y-2">
              <Label htmlFor="task-priority" className="text-sm font-semibold text-blue-900">
                Priority
              </Label>
              <Select 
                value={taskData.priority} 
                onValueChange={(value) => setTaskData({ ...taskData, priority: value })}
              >
                <SelectTrigger className="h-11 border-2 border-blue-200">
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
              <Label htmlFor="start-date" className="text-sm font-semibold text-blue-900">
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={taskData.startDate}
                onChange={(e) => setTaskData({ ...taskData, startDate: e.target.value })}
                className="h-11 border-2 border-blue-200 focus:border-blue-500 transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-sm font-semibold text-blue-900">
                End Date *
              </Label>
              <Input
                id="end-date"
                type="date"
                value={taskData.endDate}
                onChange={(e) => setTaskData({ ...taskData, endDate: e.target.value })}
                className="h-11 border-2 border-blue-200 focus:border-blue-500 transition-all duration-300"
              />
            </div>
          </div>

          {/* Assignees */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-blue-900">
              Assign To
            </Label>
            <div className="flex flex-wrap gap-2 p-3 border-2 border-blue-200 rounded-lg bg-blue-50/30">
              {projectMembers.map((member: any) => {
                const isSelected = taskData.assignees.includes(member.name);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleAssigneeToggle(member.name)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-300 ${
                      isSelected 
                        ? 'bg-blue-500 text-white border-blue-600 shadow-md' 
                        : 'bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
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
            <p className="text-xs text-gray-600">
              Select team members to assign to this task
            </p>
          </div>
        </div>

        <DialogFooter className="border-t-2 border-blue-200 pt-4 bg-blue-50/30">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="font-semibold border-2 border-blue-200 hover:bg-blue-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
          >
            {mode === "create" ? "Create Task" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskFormModal;
