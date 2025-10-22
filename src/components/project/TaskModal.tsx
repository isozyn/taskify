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
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Send, X } from "lucide-react";

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input id="task-title" defaultValue={task.title} />
          </div>

          {/* Assignees */}
          <div className="space-y-2">
            <Label>Assigned To</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedAssignees.map((assignee) => (
                <Badge key={assignee} variant="secondary" className="gap-1">
                  <Avatar className="w-4 h-4">
                    <AvatarFallback className="text-xs">
                      {assignee
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {assignee}
                  <button
                    onClick={() => removeAssignee(assignee)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Select onValueChange={addAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Add team member..." />
              </SelectTrigger>
              <SelectContent>
                {projectMembers
                  .filter((member) => !selectedAssignees.includes(member.name))
                  .map((member) => (
                    <SelectItem key={member.id} value={member.name}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="text-xs">
                            {member.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {member.name}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select defaultValue={task.status}>
              <SelectTrigger id="status">
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
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input id="start-date" type="date" defaultValue={task.startDate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input id="end-date" type="date" defaultValue={task.endDate} />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add task description..."
              rows={4}
            />
          </div>

          {/* Subtasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Subtasks</Label>
              <span className="text-sm text-muted-foreground">
                {completedSubtasks} of {subtasks.length} completed
              </span>
            </div>
            <Progress value={progress} className="h-2" />

            <div className="space-y-2">
              {subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card"
                >
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={() => toggleSubtask(subtask.id)}
                  />
                  <span
                    className={`flex-1 text-sm ${
                      subtask.completed
                        ? "line-through text-muted-foreground"
                        : ""
                    }`}
                  >
                    {subtask.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteSubtask(subtask.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add new subtask..."
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addSubtask()}
              />
              <Button onClick={addSubtask} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-3">
            <Label>Comments</Label>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-medium text-sm">John Doe</span>
                  <span className="text-xs text-muted-foreground">2h ago</span>
                </div>
                <p className="text-sm">
                  Looking good! Just a few minor tweaks needed on the layout.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-border">
            <Button variant="destructive" onClick={onClose}>
              Delete Task
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={onClose}>Save Changes</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
