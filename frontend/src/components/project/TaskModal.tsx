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
  task: any;
  open: boolean;
  onClose: () => void;
  projectMembers: any[];
}

const TaskModal = ({ task, open, onClose, projectMembers }: TaskModalProps) => {
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(
    task.assignees || []
  );
  const [subtasks, setSubtasks] = useState([
    { id: 1, title: "Research design patterns", completed: true },
    { id: 2, title: "Create wireframes", completed: true },
    { id: 3, title: "Design mockups", completed: false },
  ]);

  const [newSubtask, setNewSubtask] = useState("");
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Editable field states
  const [editableStatus, setEditableStatus] = useState(task.status || "upcoming");
  const [editableStartDate, setEditableStartDate] = useState(task.startDate || "");
  const [editableEndDate, setEditableEndDate] = useState(task.endDate || "");
  const [editableDescription, setEditableDescription] = useState("");

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

  const handleSaveEdit = () => {
    // TODO: Save the edited values to backend
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    // Reset to original values
    setEditableStatus(task.status || "upcoming");
    setEditableStartDate(task.startDate || "");
    setEditableEndDate(task.endDate || "");
    setEditableDescription("");
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-success/20 text-success border-success/30";
      case "in-progress":
        return "bg-accent/20 text-accent border-accent/30";
      case "review":
        return "bg-warning/20 text-warning border-warning/30";
      case "upcoming":
        return "bg-primary/20 text-primary border-primary/30";
      case "backlog":
        return "bg-muted/50 text-muted-foreground border-muted/50";
      default:
        return "bg-muted/50 text-muted-foreground border-muted/50";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden bg-white border-2 border-blue-200 shadow-xl">
        {/* Progress Bar at Top */}
        <div className="relative h-2 bg-blue-100 -mx-6 -mt-6 mb-6">
          <div
            className="absolute top-0 left-0 h-2 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700"
            style={{ width: `${task.progress || progress}%` }}
          />
        </div>

        <div className="overflow-y-auto max-h-[80vh] px-1">
          <DialogHeader className="mb-6">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-blue-900">{task.title}</DialogTitle>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-900">{task.progress || progress}%</div>
                <div className="text-xs text-gray-600 font-medium">COMPLETE</div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Task Title */}
            <div className="space-y-2">
              <Label htmlFor="task-title" className="text-sm font-semibold text-blue-900">Title</Label>
              <Input
                id="task-title"
                defaultValue={task.title}
                className="h-11 border-2 border-blue-200 focus:border-blue-500 transition-all duration-300"
              />
            </div>


            {/* Subtasks */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-blue-900">Subtasks</Label>
              </div>


              <div className="space-y-3">
                {subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center gap-3 p-4 border-2 border-blue-200 rounded-lg bg-white hover:border-blue-300 transition-colors"
                  >
                    <Checkbox
                      checked={subtask.completed}
                      onCheckedChange={() => toggleSubtask(subtask.id)}
                      className="border-2 border-blue-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <span
                      className={`flex-1 text-sm font-medium ${subtask.completed
                        ? "line-through text-gray-400"
                        : "text-blue-900"
                        }`}
                    >
                      {subtask.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteSubtask(subtask.id)}
                      className="hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Input
                  placeholder="Add new subtask..."
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                  className="h-11 border-2 border-blue-200 focus:border-blue-500"
                />
                <Button onClick={addSubtask} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>


            {/* Assignees */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-blue-900">Assigned To</Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedAssignees.map((assignee) => (
                  <Badge key={assignee} variant="secondary" className="gap-2 px-3 py-1 bg-blue-100 text-blue-700 border-2 border-blue-300">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {assignee.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    {assignee}
                    <button
                      onClick={() => removeAssignee(assignee)}
                      className="ml-1 hover:text-red-500 transition-colors duration-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Select onValueChange={addAssignee}>
                <SelectTrigger className="h-11 border-2 border-blue-200 focus:border-blue-500">
                  <SelectValue placeholder="Add team member..." />
                </SelectTrigger>
                <SelectContent>
                  {projectMembers
                    .filter((member) => !selectedAssignees.includes(member.name))
                    .map((member) => (
                      <SelectItem key={member.id} value={member.name}>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                            {member.name.split(" ").map((n: string) => n[0]).join("")}
                          </div>
                          {member.name}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-blue-900">Status</Label>
              {isEditing ? (
                <Select value={editableStatus} onValueChange={setEditableStatus}>
                  <SelectTrigger className="h-11 border-2 border-blue-200 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                    <SelectItem value="backlog">Backlog</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50/50">
                  <Badge className={`${getStatusColor(editableStatus)} font-semibold uppercase tracking-wide`}>
                    {editableStatus.replace('-', ' ')}
                  </Badge>
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-blue-900">Start Date</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editableStartDate}
                    onChange={(e) => setEditableStartDate(e.target.value)}
                    className="h-11 border-2 border-blue-200 focus:border-blue-500"
                  />
                ) : (
                  <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50/50">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-blue-900">
                        {editableStartDate ? new Date(editableStartDate).toLocaleDateString() : "Not set"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-blue-900">End Date</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editableEndDate}
                    onChange={(e) => setEditableEndDate(e.target.value)}
                    className="h-11 border-2 border-blue-200 focus:border-blue-500"
                  />
                ) : (
                  <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50/50">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-blue-900">
                        {editableEndDate ? new Date(editableEndDate).toLocaleDateString() : "Not set"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-blue-900">Description</Label>
              {isEditing ? (
                <Textarea
                  value={editableDescription}
                  onChange={(e) => setEditableDescription(e.target.value)}
                  placeholder="Add task description..."
                  rows={4}
                  className="border-2 border-blue-200 focus:border-blue-500 resize-none"
                />
              ) : (
                <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50/50 min-h-[100px]">
                  <p className="text-sm text-blue-900 leading-relaxed">
                    {editableDescription || "No description provided"}
                  </p>
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-blue-900">Comments</Label>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50/50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        JD
                      </div>
                      <span className="font-semibold text-sm text-blue-900">John Doe</span>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">2h ago</span>
                  </div>
                  <p className="text-sm text-blue-900 leading-relaxed">
                    Looking good! Just a few minor tweaks needed on the layout.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Input
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="h-11 border-2 border-blue-200 focus:border-blue-500"
                />
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-6 border-t-2 border-blue-200">
              <Button variant="destructive" onClick={onClose} className="font-semibold">
                Delete Task
              </Button>
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={handleCancelEdit} className="font-semibold border-2 border-blue-200 hover:bg-blue-50">
                      Cancel Edit
                    </Button>
                    <Button onClick={handleSaveEdit} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={onClose} className="font-semibold border-2 border-blue-200 hover:bg-blue-50">
                      Close
                    </Button>
                    <Button onClick={() => setIsEditing(true)} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                      <Edit3 className="w-4 h-4 mr-2" />
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
