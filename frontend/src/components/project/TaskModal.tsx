import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Plus, Trash2, Send, X, Edit3, Save, Calendar, Clock } from "lucide-react";

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
  projectMembers: Array<{
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
  }>;
}

const TaskModal = ({ task, open, onClose, projectMembers }: TaskModalProps) => {
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(
    task.assignee ? [task.assignee.name] : []
  );
  const [subtasks, setSubtasks] = useState(task.subtasks || []);

  const [newSubtask, setNewSubtask] = useState("");
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Editable field states
  const [editableTitle, setEditableTitle] = useState(task.title || "");
  const [editableStatus, setEditableStatus] = useState(task.status || "TODO");
  const [editableStartDate, setEditableStartDate] = useState(task.startDate || "");
  const [editableEndDate, setEditableEndDate] = useState(task.endDate || "");
  const [editableDescription, setEditableDescription] = useState(task.description || "");
  const [editableTags, setEditableTags] = useState<string[]>(task.tags || []);
  const [newTag, setNewTag] = useState("");

  const completedSubtasks = subtasks.filter((st) => st.completed).length;
  const progress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([
        ...subtasks,
        { id: Date.now(), title: newSubtask, completed: false },
      ]);
      setNewSubtask("");
    }
  };

  const toggleSubtask = (id: number) => {
    setSubtasks(
      subtasks.map((st) =>
        st.id === id ? { ...st, completed: !st.completed } : st
      )
    );
  };

  const deleteSubtask = (id: number) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const addAssignee = (memberName: string) => {
    if (!selectedAssignees.includes(memberName)) {
      setSelectedAssignees([...selectedAssignees, memberName]);
    }
  };

  const removeAssignee = (memberName: string) => {
    setSelectedAssignees(selectedAssignees.filter((name) => name !== memberName));
  };

  const addTag = () => {
    if (newTag.trim() && !editableTags.includes(newTag.trim())) {
      setEditableTags([...editableTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditableTags(editableTags.filter((tag) => tag !== tagToRemove));
  };

  const handleSaveEdit = () => {
    // TODO: Save the edited values to backend
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    // Reset to original values
    setEditableTitle(task.title || "");
    setEditableStatus(task.status || "TODO");
    setEditableStartDate(task.startDate || "");
    setEditableEndDate(task.endDate || "");
    setEditableDescription(task.description || "");
    setEditableTags(task.tags || []);
    setNewTag("");
    setIsEditing(false);
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
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={editableTitle}
                    onChange={(e) => setEditableTitle(e.target.value)}
                    className="text-lg font-semibold border-slate-200 focus:border-blue-500"
                  />
                ) : (
                  <DialogTitle className="text-lg font-semibold text-slate-900">{editableTitle}</DialogTitle>
                )}
                {/* Tags next to title */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {editableTags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="gap-1.5 px-2 py-0.5 bg-purple-100 text-purple-700 border border-purple-200 text-[10px]"
                    >
                      {tag}
                      {isEditing && (
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-500 transition-colors"
                        >
                          <X className="w-2 h-2" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {/* Add tag input in edit mode */}
                {isEditing && (
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
                )}
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
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteSubtask(subtask.id)}
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
                  onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                  className="h-9 text-xs border-slate-200 focus:border-blue-500"
                />
                <Button onClick={addSubtask} className="bg-blue-500 hover:bg-blue-600 text-white h-9 px-3">
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
              {isEditing ? (
                <Select value={editableStatus} onValueChange={(value) => setEditableStatus(value as typeof editableStatus)}>
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
              ) : (
                <div className="p-2.5 border border-slate-200 rounded-md bg-slate-50">
                  <Badge className={`${getStatusColor(editableStatus)} text-[10px] font-semibold uppercase tracking-wide`}>
                    {editableStatus.replace('_', ' ')}
                  </Badge>
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Start Date</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editableStartDate}
                    onChange={(e) => setEditableStartDate(e.target.value)}
                    className="h-9 text-xs border-slate-200 focus:border-blue-500"
                  />
                ) : (
                  <div className="p-2.5 border border-slate-200 rounded-md bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-slate-700">
                        {editableStartDate ? new Date(editableStartDate).toLocaleDateString() : "Not set"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">End Date</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editableEndDate}
                    onChange={(e) => setEditableEndDate(e.target.value)}
                    className="h-9 text-xs border-slate-200 focus:border-blue-500"
                  />
                ) : (
                  <div className="p-2.5 border border-slate-200 rounded-md bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-slate-700">
                        {editableEndDate ? new Date(editableEndDate).toLocaleDateString() : "Not set"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Description</Label>
              {isEditing ? (
                <Textarea
                  value={editableDescription}
                  onChange={(e) => setEditableDescription(e.target.value)}
                  placeholder="Add task description..."
                  rows={4}
                  className="text-xs border-slate-200 focus:border-blue-500 resize-none"
                />
              ) : (
                <div className="p-2.5 border border-slate-200 rounded-md bg-slate-50 min-h-[80px]">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {editableDescription || "No description provided"}
                  </p>
                </div>
              )}
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
              <Button variant="destructive" onClick={onClose} className="text-xs font-semibold h-9 px-4">
                Delete Task
              </Button>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={handleCancelEdit} className="text-xs font-semibold border-slate-200 hover:bg-slate-50 h-9 px-4">
                      Cancel
                    </Button>
                    <Button onClick={handleSaveEdit} className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold h-9 px-4">
                      <Save className="w-3 h-3 mr-1.5" />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={onClose} className="text-xs font-semibold border-slate-200 hover:bg-slate-50 h-9 px-4">
                      Close
                    </Button>
                    <Button onClick={() => setIsEditing(true)} className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold h-9 px-4">
                      <Edit3 className="w-3 h-3 mr-1.5" />
                      Edit Task
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
