import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Send, X } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface TaskModalProps {
  task: {
    id: number;
    title: string;
    description?: string | null;
    status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED" | "BLOCKED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    startDate?: string | null;
    endDate?: string | null;
    projectId: number;
    assigneeId?: number | null;
    tags: string[];
    columnId?: string | null;
    order: number;
    createdAt: string;
    updatedAt: string;
    assignee?: {
      id: number;
      name: string;
      email: string;
      avatar?: string | null;
    } | null;
    subtasks?: Array<{
      id: number;
      title: string;
      completed: boolean;
    }>;
    comments?: Array<{
      id: number;
      content: string;
      createdAt: string;
      author: {
        id: number;
        name: string;
        email: string;
      };
    }>;
    progress?: number;
  };
  open: boolean;
  onClose: () => void;
  onDelete?: (taskId: number) => void;
  projectMembers: Array<{
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
  }>;
}

const TaskModal = ({ task, open, onClose, onDelete, projectMembers }: TaskModalProps) => {
  const { toast } = useToast();
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(
    task.assignee ? [task.assignee.name] : []
  );
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [isLoadingSubtasks, setIsLoadingSubtasks] = useState(false);

  const [newSubtask, setNewSubtask] = useState("");
  const [comment, setComment] = useState("");

  // Editable field states - always editable, no edit mode
  const [editableTitle, setEditableTitle] = useState(task.title || "");
  const [editableStatus, setEditableStatus] = useState(task.status || "TODO");
  const [editableStartDate, setEditableStartDate] = useState(task.startDate || "");
  const [editableEndDate, setEditableEndDate] = useState(task.endDate || "");
  const [editableDescription, setEditableDescription] = useState(task.description || "");
  const [editableTags, setEditableTags] = useState<string[]>(task.tags || []);
  const [newTag, setNewTag] = useState("");

  // Fetch subtasks when task changes
  useEffect(() => {
    const fetchSubtasks = async () => {
      if (task.id && open) {
        try {
          setIsLoadingSubtasks(true);
          const response: any = await api.getSubtasks(task.id);
          if (response.subtasks) {
            setSubtasks(response.subtasks);
          }
        } catch (error) {
          console.error('Failed to fetch subtasks:', error);
        } finally {
          setIsLoadingSubtasks(false);
        }
      }
    };

    fetchSubtasks();
  }, [task.id, open]);

  const completedSubtasks = subtasks.filter((st) => st.completed).length;
  const progress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  // Auto-save functions
  const handleSaveTitle = async () => {
    if (editableTitle !== task.title) {
      try {
        await api.updateTask(task.id, { title: editableTitle });
      } catch (error) {
        console.error('Failed to update title:', error);
      }
    }
  };

  const handleSaveStatus = async (newStatus: string) => {
    try {
      await api.updateTask(task.id, { status: newStatus as any });
      setEditableStatus(newStatus as any);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleSaveDate = async (field: 'startDate' | 'endDate', value: string) => {
    try {
      await api.updateTask(task.id, { [field]: value || null });
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
    }
  };

  const handleSaveDescription = async () => {
    if (editableDescription !== task.description) {
      try {
        await api.updateTask(task.id, { description: editableDescription });
      } catch (error) {
        console.error('Failed to update description:', error);
      }
    }
  };

  const handleSaveTags = async (newTags: string[]) => {
    try {
      await api.updateTask(task.id, { tags: newTags });
    } catch (error) {
      console.error('Failed to update tags:', error);
    }
  };

  const addSubtask = async () => {
    if (newSubtask.trim()) {
      try {
        const response: any = await api.createSubtask(task.id, {
          title: newSubtask,
          order: subtasks.length,
        });
        if (response.subtask) {
          setSubtasks([...subtasks, response.subtask]);
          setNewSubtask("");
        }
      } catch (error) {
        console.error('Failed to create subtask:', error);
      }
    }
  };

  const toggleSubtask = async (id: number) => {
    const subtask = subtasks.find((st) => st.id === id);
    if (!subtask) return;

    try {
      await api.updateSubtask(id, {
        completed: !subtask.completed,
      });
      setSubtasks(
        subtasks.map((st) =>
          st.id === id ? { ...st, completed: !st.completed } : st
        )
      );
    } catch (error) {
      console.error('Failed to update subtask:', error);
    }
  };

  const deleteSubtask = async (id: number) => {
    try {
      console.log('Attempting to delete subtask with ID:', id);
      const result = await api.deleteSubtask(id);
      console.log('Delete subtask result:', result);
      setSubtasks(subtasks.filter((st) => st.id !== id));
      console.log('Subtasks after delete:', subtasks.filter((st) => st.id !== id));
      toast({
        title: "Subtask deleted",
        description: "The subtask has been successfully deleted.",
      });
    } catch (error) {
      console.error('Failed to delete subtask:', error);
      toast({
        title: "Error",
        description: "Failed to delete subtask. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addAssignee = (memberName: string) => {
    if (!selectedAssignees.includes(memberName)) {
      setSelectedAssignees([...selectedAssignees, memberName]);
    }
  };

  const removeAssignee = (memberName: string) => {
    setSelectedAssignees(selectedAssignees.filter((name) => name !== memberName));
  };

  const handleDeleteTask = async () => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await api.deleteTask(task.id);
        toast({
          title: "Task deleted",
          description: "The task has been successfully deleted.",
        });
        if (onDelete) {
          onDelete(task.id);
        }
        onClose();
      } catch (error) {
        console.error('Failed to delete task:', error);
        toast({
          title: "Error",
          description: "Failed to delete task. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const addTag = () => {
    if (newTag.trim() && !editableTags.includes(newTag.trim())) {
      const newTags = [...editableTags, newTag.trim()];
      setEditableTags(newTags);
      handleSaveTags(newTags);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = editableTags.filter((tag) => tag !== tagToRemove);
    setEditableTags(newTags);
    handleSaveTags(newTags);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700 border-green-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "IN_REVIEW":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "TODO":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "BLOCKED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden bg-white border border-slate-200 shadow-2xl">
        {/* Progress Bar at Top */}
        <div className="relative h-1 bg-slate-100 -mx-6 -mt-6 mb-4">
          <div
            className="absolute top-0 left-0 h-1 bg-blue-500 transition-all duration-500"
            style={{ width: `${Math.round(task.progress || progress)}%` }}
          />
        </div>

        <div className="overflow-y-auto max-h-[80vh] px-1">
          <DialogHeader className="mb-5">
            <DialogTitle className="sr-only">Task Details</DialogTitle>
            <DialogDescription className="sr-only">
              Edit task information, add subtasks, and manage assignees
            </DialogDescription>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Input
                  value={editableTitle}
                  onChange={(e) => setEditableTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  className="text-lg font-semibold border-slate-200 focus:border-blue-500"
                  placeholder="Task title..."
                />
                {/* Tags next to title */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {editableTags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="gap-1.5 px-2 py-0.5 bg-purple-100 text-purple-700 border border-purple-200 text-[10px]"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500 transition-colors"
                      >
                        <X className="w-2 h-2" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {/* Add tag input */}
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="h-8 text-xs border-slate-200 focus:border-blue-500"
                  />
                  <Button onClick={addTag} className="bg-purple-500 hover:bg-purple-600 text-white h-8 px-3">
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-base font-semibold text-blue-600">{Math.round(task.progress || progress)}%</div>
                <div className="text-[10px] text-slate-500 font-medium tracking-wide">COMPLETE</div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5">
            {/* Subtasks */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Subtasks</Label>
                <span className="text-xs text-slate-500 font-medium">{completedSubtasks}/{subtasks.length}</span>
              </div>

              <div className="space-y-2">
                {subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 transition-colors"
                  >
                    <Checkbox
                      checked={subtask.completed}
                      onCheckedChange={() => toggleSubtask(subtask.id)}
                      className="border-slate-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <span
                      className={`flex-1 text-xs ${subtask.completed
                        ? "line-through text-slate-400"
                        : "text-slate-700"
                        }`}
                    >
                      {subtask.title}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Delete button clicked for subtask:', subtask.id);
                        deleteSubtask(subtask.id);
                      }}
                      className="h-7 w-7 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add new subtask..."
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSubtask();
                    }
                  }}
                  className="h-9 text-xs border-slate-200 focus:border-blue-500"
                />
                <Button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addSubtask();
                  }} 
                  className="bg-blue-500 hover:bg-blue-600 text-white h-9 px-3"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>


            {/* Assignees */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Assigned To</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedAssignees.map((assignee) => (
                  <Badge key={assignee} variant="secondary" className="gap-1.5 px-2 py-1 bg-slate-100 text-slate-700 border border-slate-200 text-xs">
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[9px] font-bold">
                      {assignee.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    {assignee}
                    <button
                      onClick={() => removeAssignee(assignee)}
                      className="ml-1 hover:text-red-500 transition-colors"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Select onValueChange={addAssignee}>
                <SelectTrigger className="h-9 text-xs border-slate-200 focus:border-blue-500">
                  <SelectValue placeholder="Add team member..." />
                </SelectTrigger>
                <SelectContent>
                  {projectMembers
                    .filter((member) => !selectedAssignees.includes(member.name))
                    .map((member) => (
                      <SelectItem key={member.id} value={member.name}>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[9px] font-bold">
                            {member.name.split(" ").map((n: string) => n[0]).join("")}
                          </div>
                          <span className="text-xs">{member.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Status</Label>
              <Select 
                value={editableStatus} 
                onValueChange={(value) => handleSaveStatus(value)}
              >
                <SelectTrigger className="h-9 text-xs border-slate-200 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="IN_REVIEW">In Review</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="BLOCKED">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Start Date</Label>
                <Input
                  type="date"
                  value={editableStartDate}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setEditableStartDate(newValue);
                    handleSaveDate('startDate', newValue);
                  }}
                  className="h-9 text-xs border-slate-200 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">End Date</Label>
                <Input
                  type="date"
                  value={editableEndDate}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setEditableEndDate(newValue);
                    handleSaveDate('endDate', newValue);
                  }}
                  className="h-9 text-xs border-slate-200 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Description</Label>
              <Textarea
                value={editableDescription}
                onChange={(e) => setEditableDescription(e.target.value)}
                onBlur={handleSaveDescription}
                placeholder="Add task description..."
                rows={4}
                className="text-xs border-slate-200 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Comments */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Comments</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {task.comments && task.comments.length > 0 ? (
                  task.comments.map((comment: any) => (
                    <div key={comment.id} className="p-2.5 border border-slate-200 rounded-md bg-slate-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[9px] font-bold">
                            {comment.author?.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                          </div>
                          <span className="font-semibold text-xs text-slate-700">{comment.author?.name || "Unknown"}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-2.5 border border-slate-200 rounded-md bg-slate-50 text-center">
                    <p className="text-xs text-slate-400">No comments yet</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="h-9 text-xs border-slate-200 focus:border-blue-500"
                />
                <Button className="bg-blue-500 hover:bg-blue-600 text-white h-9 px-3">
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t border-slate-200">
              <Button 
                type="button"
                variant="destructive" 
                onClick={handleDeleteTask} 
                className="text-xs font-semibold h-9 px-4"
              >
                Delete Task
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={onClose} 
                className="text-xs font-semibold border-slate-200 hover:bg-slate-50 h-9 px-4"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
