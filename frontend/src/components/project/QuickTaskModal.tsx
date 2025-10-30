import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CalendarIcon, Plus, X } from "lucide-react";
import moment from 'moment';

interface QuickTaskModalProps {
  open: boolean;
  onClose: () => void;
  selectedDate?: Date;
  projectMembers: any[];
  onTaskCreate?: (task: any) => void;
}

const QuickTaskModal = ({ open, onClose, selectedDate, projectMembers, onTaskCreate }: QuickTaskModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee: '',
    startDate: selectedDate ? moment(selectedDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
    endDate: selectedDate ? moment(selectedDate).add(1, 'day').format('YYYY-MM-DD') : moment().add(1, 'day').format('YYYY-MM-DD'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTask = {
      id: Date.now(), // Simple ID generation for demo
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      assignees: formData.assignee ? [formData.assignee] : [],
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: 'upcoming',
      progress: 0,
      color: 'from-blue-500 to-blue-600',
      tags: [],
      subtasks: [],
    };

    onTaskCreate?.(newTask);
    onClose();
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      assignee: '',
      startDate: selectedDate ? moment(selectedDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
      endDate: selectedDate ? moment(selectedDate).add(1, 'day').format('YYYY-MM-DD') : moment().add(1, 'day').format('YYYY-MM-DD'),
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] premium-card border-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Plus className="w-5 h-5 text-primary" />
            Create New Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">
              Task Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter task title..."
              className="h-10"
              required
            />
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter task description..."
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Priority and Assignee Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-semibold">
                Priority
              </Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee" className="text-sm font-semibold">
                Assignee
              </Label>
              <Select value={formData.assignee} onValueChange={(value) => handleInputChange('assignee', value)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {projectMembers.map((member) => (
                    <SelectItem key={member.id} value={member.name}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-semibold">
                Start Date
              </Label>
              <div className="relative">
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="h-10 pl-10"
                />
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-semibold">
                End Date
              </Label>
              <div className="relative">
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="h-10 pl-10"
                />
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Selected Date Info */}
          {selectedDate && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-medium text-primary">
                  Creating task for {moment(selectedDate).format('MMMM DD, YYYY')}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/30">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-6 bg-primary hover:bg-primary/90"
            >
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickTaskModal;