import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, CheckCircle, Plus } from "lucide-react";
import moment from 'moment';
import QuickTaskModal from "./QuickTaskModal";

interface CalendarWidgetProps {
  tasks: any[];
  projectMembers: any[];
  onDateSelect?: (date: Date) => void;
  onTaskCreate?: (task: any) => void;
}

const CalendarWidget = ({ tasks, projectMembers, onDateSelect, onTaskCreate }: CalendarWidgetProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showQuickTaskModal, setShowQuickTaskModal] = useState(false);

  const startOfMonth = moment(currentDate).startOf('month');
  const endOfMonth = moment(currentDate).endOf('month');
  const startOfCalendar = moment(startOfMonth).startOf('week');
  const endOfCalendar = moment(endOfMonth).endOf('week');

  const calendarDays = [];
  let day = moment(startOfCalendar);

  while (day.isSameOrBefore(endOfCalendar)) {
    calendarDays.push(day.clone());
    day.add(1, 'day');
  }

  const getTasksForDate = (date: moment.Moment) => {
    return tasks.filter(task => {
      const taskStart = moment(task.startDate);
      const taskEnd = moment(task.endDate);
      return date.isBetween(taskStart, taskEnd, 'day', '[]');
    });
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'complete').length;
    const inProgress = tasks.filter(task => task.status === 'in-progress').length;
    const upcoming = tasks.filter(task => task.status === 'upcoming').length;

    return { total, completed, inProgress, upcoming };
  };

  const stats = getTaskStats();

  const handleDateClick = (date: moment.Moment) => {
    const dateObj = date.toDate();
    setSelectedDate(dateObj);
    onDateSelect?.(dateObj);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = moment(prev);
      if (direction === 'prev') {
        newDate.subtract(1, 'month');
      } else {
        newDate.add(1, 'month');
      }
      return newDate.toDate();
    });
  };

  return (
    <div className="space-y-4">
      {/* Mini Calendar */}
      <Card className="premium-card border-0 bg-gradient-to-br from-card to-card/80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              {moment(currentDate).format('MMMM YYYY')}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth('prev')}
                className="w-8 h-8 hover:bg-muted/50"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth('next')}
                className="w-8 h-8 hover:bg-muted/50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const tasksForDay = getTasksForDate(day);
              const isCurrentMonth = day.month() === moment(currentDate).month();
              const isToday = day.isSame(moment(), 'day');
              const isSelected = selectedDate && day.isSame(moment(selectedDate), 'day');

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(day)}
                  className={`
                    relative p-2 text-sm rounded-md transition-all duration-200 hover:bg-muted/50
                    ${!isCurrentMonth ? 'text-muted-foreground/50' : 'text-foreground'}
                    ${isToday ? 'bg-primary text-primary-foreground font-bold' : ''}
                    ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                  `}
                >
                  {day.date()}
                  {tasksForDay.length > 0 && (
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-accent rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Task Statistics */}
      <Card className="premium-card border-0 bg-gradient-to-br from-card to-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Project Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-xs text-muted-foreground font-medium">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-xs text-muted-foreground font-medium">Completed</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">In Progress</Badge>
              <span className="text-sm font-semibold">{stats.inProgress}</span>
            </div>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">Upcoming</Badge>
              <span className="text-sm font-semibold">{stats.upcoming}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span className="font-bold">{Math.round((stats.completed / stats.total) * 100)}%</span>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                style={{ width: `${(stats.completed / stats.total) * 100}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Tasks */}
      {selectedDate && (
        <Card className="premium-card border-0 bg-gradient-to-br from-card to-card/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              {moment(selectedDate).format('MMM DD, YYYY')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {(() => {
              const tasksForSelectedDate = getTasksForDate(moment(selectedDate));
              if (tasksForSelectedDate.length === 0) {
                return (
                  <div className="text-center text-muted-foreground py-4">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tasks scheduled for this date</p>
                  </div>
                );
              }
              
              return (
                <div className="space-y-3">
                  {tasksForSelectedDate.map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${
                        task.status === 'complete' ? 'bg-green-500' :
                        task.status === 'in-progress' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{task.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {task.progress}% complete • {task.assignees.length} assignee{task.assignees.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Quick Add Task Button */}
      <Button
        onClick={() => setShowQuickTaskModal(true)}
        className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add New Task
      </Button>

      {/* Quick Task Modal */}
      <QuickTaskModal
        open={showQuickTaskModal}
        onClose={() => setShowQuickTaskModal(false)}
        selectedDate={selectedDate}
        projectMembers={projectMembers}
        onTaskCreate={onTaskCreate}
      />
    </div>
  );
};

export default CalendarWidget;