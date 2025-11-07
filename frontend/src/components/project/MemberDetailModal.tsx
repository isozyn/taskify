import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Mail, Calendar, Target, CheckCircle2, Clock, BarChart3 } from "lucide-react";

interface TeamMember {
  id: number;
  name: string;
  avatar?: string;
  email: string;
  role: string;
  joinDate: string;
  description: string;
  assignedTasks: Array<{
    id: number;
    title: string;
    status: string;
    priority: string;
    dueDate: string;
  }>;
}

interface MemberDetailModalProps {
  member: TeamMember | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToTask?: (taskId: number) => void;
}

const MemberDetailModal = ({ member, isOpen, onOpenChange, onNavigateToTask }: MemberDetailModalProps) => {
  const [taskFilter, setTaskFilter] = useState<"all" | "completed" | "active">("all");

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
      default:
        return "bg-muted/50 text-muted-foreground border-muted/50";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (!member) return null;

  const completedTasks = member.assignedTasks.filter(t => t.status === 'complete').length;
  const activeTasks = member.assignedTasks.filter(t => t.status === 'in-progress').length;
  const totalTasks = member.assignedTasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Get filtered tasks based on selected filter
  const getFilteredTasks = () => {
    if (taskFilter === "completed") {
      return member.assignedTasks.filter(t => t.status === 'complete');
    }
    if (taskFilter === "active") {
      return member.assignedTasks.filter(t => t.status === 'in-progress');
    }
    return member.assignedTasks;
  };

  const displayedTasks = getFilteredTasks();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden bg-white border-2 border-blue-200 shadow-xl">
        <div className="overflow-y-auto max-h-[80vh] px-1">
          <DialogHeader className="mb-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16 ring-4 ring-blue-500/30 shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-xl">
                  {member.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold mb-1 text-blue-900">
                  {member.name}
                </DialogTitle>
                <p className="text-sm font-semibold text-blue-600">{member.role}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <a 
                    href={`mailto:${member.email}`} 
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {member.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">
                    Joined {new Date(member.joinDate).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* About Section */}
            <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white shadow-md">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-blue-900 uppercase tracking-wider">
                  About
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 leading-relaxed">{member.description}</p>
              </CardContent>
            </Card>

            {/* Task Statistics */}
            <div className="grid grid-cols-3 gap-3">
              <Card 
                className={`border-2 cursor-pointer transition-all hover:shadow-lg ${
                  taskFilter === "all" 
                    ? "border-blue-400 bg-gradient-to-br from-blue-100 to-blue-50 shadow-md ring-2 ring-blue-200" 
                    : "border-blue-100 bg-gradient-to-br from-blue-50 to-white hover:border-blue-300"
                }`}
                onClick={() => setTaskFilter("all")}
              >
                <CardContent className="pt-6 text-center">
                  <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900">{totalTasks}</div>
                  <p className="text-xs text-gray-600 font-medium">Total Tasks</p>
                </CardContent>
              </Card>
              <Card 
                className={`border-2 cursor-pointer transition-all hover:shadow-lg ${
                  taskFilter === "completed" 
                    ? "border-green-400 bg-gradient-to-br from-green-100 to-green-50 shadow-md ring-2 ring-green-200" 
                    : "border-green-100 bg-gradient-to-br from-green-50 to-white hover:border-green-300"
                }`}
                onClick={() => setTaskFilter("completed")}
              >
                <CardContent className="pt-6 text-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-900">{completedTasks}</div>
                  <p className="text-xs text-gray-600 font-medium">Completed</p>
                </CardContent>
              </Card>
              <Card 
                className={`border-2 cursor-pointer transition-all hover:shadow-lg ${
                  taskFilter === "active" 
                    ? "border-blue-400 bg-gradient-to-br from-blue-100 to-blue-50 shadow-md ring-2 ring-blue-200" 
                    : "border-blue-100 bg-gradient-to-br from-blue-50 to-white hover:border-blue-300"
                }`}
                onClick={() => setTaskFilter("active")}
              >
                <CardContent className="pt-6 text-center">
                  <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900">{activeTasks}</div>
                  <p className="text-xs text-gray-600 font-medium">Active</p>
                </CardContent>
              </Card>
            </div>

            {/* Assigned Tasks */}
            <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-sm font-semibold text-blue-900 uppercase tracking-wider">
                    Assigned Tasks
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {displayedTasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium">
                        {taskFilter === "all" ? "No tasks assigned" : `No ${taskFilter} tasks`}
                      </p>
                    </div>
                  ) : (
                    displayedTasks.map((task) => (
                      <Card
                        key={task.id}
                        className="border-2 border-blue-100 bg-white hover:shadow-lg hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 cursor-pointer"
                        onClick={() => {
                          if (onNavigateToTask) {
                            onNavigateToTask(task.id);
                            onOpenChange(false); // Close the modal
                          }
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Task Title and Priority */}
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-bold text-sm text-gray-900 flex-1 line-clamp-2 group-hover:text-blue-700">
                                {task.title}
                              </h4>
                              <Badge className={`text-xs px-2 py-1 ${getPriorityColor(task.priority)}`}>
                                {task.priority.toUpperCase()}
                              </Badge>
                            </div>

                            {/* Status and Due Date */}
                            <div className="flex items-center justify-between gap-2">
                              <Badge className={`text-xs px-2 py-1 ${getStatusColor(task.status)}`}>
                                {task.status.replace('-', ' ').toUpperCase()}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Calendar className="w-3 h-3" />
                                <span className="font-medium">
                                  Due {new Date(task.dueDate).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Task Completion Progress */}
            <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white shadow-md">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-blue-900 uppercase tracking-wider">
                  Task Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Overall Progress</span>
                    <span className="text-sm font-bold text-blue-900">
                      {completedTasks} / {totalTasks} tasks
                    </span>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={completionRate} 
                      className="h-3 bg-gray-200"
                    />
                    <div 
                      className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600">
                    {Math.round(completionRate)}% of assigned tasks completed
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemberDetailModal;
