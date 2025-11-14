import { useState, useEffect } from "react";
import { CheckSquare, Calendar, Users, BarChart3, MessageSquare, Plus, ChevronRight, Clock, Paperclip, Eye, TrendingUp, Zap } from "lucide-react";

const InteractiveDemo = () => {
  const [activeTab, setActiveTab] = useState<'board' | 'timeline' | 'calendar'>('board');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [animatedCards, setAnimatedCards] = useState<number[]>([]);
  const [pulseActivity, setPulseActivity] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Animate cards on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedCards([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Pulse activity indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseActivity(true);
      setTimeout(() => setPulseActivity(false), 1000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Show notification periodically
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }, 4000);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const tasks = [
    { id: 1, title: "Design landing page", status: "todo", priority: "high", assignee: "JD", comments: 3, attachments: 2, dueDate: "Today" },
    { id: 2, title: "API integration", status: "progress", priority: "high", assignee: "SM", comments: 5, attachments: 1, dueDate: "Tomorrow" },
    { id: 3, title: "User testing", status: "progress", priority: "medium", assignee: "MJ", comments: 2, attachments: 0, dueDate: "Dec 15" },
    { id: 4, title: "Deploy to staging", status: "review", priority: "urgent", assignee: "SW", comments: 8, attachments: 3, dueDate: "Today" },
    { id: 5, title: "Update documentation", status: "done", priority: "low", assignee: "JD", comments: 1, attachments: 1, dueDate: "Completed" },
    { id: 6, title: "Database optimization", status: "todo", priority: "medium", assignee: "SM", comments: 0, attachments: 0, dueDate: "Dec 18" },
    { id: 7, title: "Code review", status: "progress", priority: "high", assignee: "MJ", comments: 4, attachments: 0, dueDate: "Tomorrow" },
    { id: 8, title: "Bug fixes", status: "review", priority: "urgent", assignee: "SW", comments: 6, attachments: 2, dueDate: "Today" },
    { id: 9, title: "Performance testing", status: "done", priority: "medium", assignee: "JD", comments: 2, attachments: 1, dueDate: "Completed" },
  ];

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-slate-100', count: 2 },
    { id: 'progress', title: 'In Progress', color: 'bg-blue-100', count: 2 },
    { id: 'review', title: 'Review', color: 'bg-amber-100', count: 2 },
    { id: 'done', title: 'Done', color: 'bg-green-100', count: 2 },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 shadow-xl overflow-hidden">
      {/* Demo Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 relative">
        {/* Live Activity Notification */}
        {showNotification && (
          <div className="absolute top-full left-4 mt-2 bg-white border border-blue-200 rounded-lg shadow-lg p-3 z-10 animate-slideDown w-64">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                <CheckSquare className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-900">Task completed!</p>
                <p className="text-[10px] text-slate-500">Sarah completed "Deploy to staging"</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center relative">
              <CheckSquare className="w-4 h-4 text-white" />
              {pulseActivity && (
                <div className="absolute inset-0 rounded bg-blue-600 animate-ping opacity-75"></div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Website Redesign</h3>
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-500">12 tasks • 4 members</p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[10px] text-green-600 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {['JD', 'SM', 'MJ', 'SW'].map((initials, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-white flex items-center justify-center text-[10px] font-semibold text-white hover:scale-110 transition-transform cursor-pointer"
                  title={`Team member ${initials}`}
                >
                  {initials}
                </div>
              ))}
            </div>
            <button className="p-1.5 hover:bg-slate-100 rounded transition-colors group">
              <Plus className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-3">
          {[
            { id: 'board', label: 'Board', icon: CheckSquare },
            { id: 'timeline', label: 'Timeline', icon: Calendar },
            { id: 'calendar', label: 'Calendar', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setAnimatedCards([]);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Demo Content */}
      <div className="p-4 h-[calc(100%-120px)] overflow-hidden">
        {activeTab === 'board' && (
          <div className="grid grid-cols-4 gap-3 h-full">
            {columns.map((column, colIndex) => (
              <div key={column.id} className="flex flex-col">
                <div className="flex items-center justify-between mb-2 px-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${column.color.replace('100', '500')}`}></div>
                    <span className="text-xs font-semibold text-slate-700">{column.title}</span>
                    <span className="text-xs text-slate-400">{column.count}</span>
                  </div>
                </div>
                <div className="space-y-2 flex-1">
                  {tasks
                    .filter((task) => task.status === column.id)
                    .map((task, index) => (
                      <div
                        key={task.id}
                        onMouseEnter={() => setHoveredCard(task.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                        className={`bg-white rounded-lg border border-slate-200 p-3 cursor-pointer transition-all duration-300 ${
                          animatedCards.includes(index)
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-4'
                        } ${
                          hoveredCard === task.id
                            ? 'shadow-md scale-105 border-blue-300'
                            : 'shadow-sm hover:shadow-md'
                        }`}
                        style={{
                          transitionDelay: `${colIndex * 50 + index * 100}ms`,
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-xs font-medium text-slate-900 line-clamp-2">
                            {task.title}
                          </h4>
                          <div className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(task.priority)} flex-shrink-0 ml-2`}></div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            {task.comments > 0 && (
                              <div className="flex items-center gap-0.5">
                                <MessageSquare className="w-3 h-3 text-slate-400" />
                                <span className="text-[10px] text-slate-500">{task.comments}</span>
                              </div>
                            )}
                            {task.attachments > 0 && (
                              <div className="flex items-center gap-0.5">
                                <Paperclip className="w-3 h-3 text-slate-400" />
                                <span className="text-[10px] text-slate-500">{task.attachments}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {task.dueDate === "Today" && (
                              <Clock className="w-3 h-3 text-orange-500" />
                            )}
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[8px] font-semibold text-white">
                              {task.assignee}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center gap-4 text-xs text-slate-500 px-2">
              <div className="w-32">Task</div>
              <div className="flex-1">Timeline</div>
              <div className="w-20">Progress</div>
            </div>
            {tasks.slice(0, 4).map((task, index) => (
              <div
                key={task.id}
                className={`bg-white rounded-lg border border-slate-200 p-3 transition-all duration-300 ${
                  animatedCards.includes(index)
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-4'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <p className="text-xs font-medium text-slate-900">{task.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{task.assignee}</p>
                  </div>
                  <div className="flex-1">
                    <div className="h-6 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000"
                        style={{ width: `${20 + index * 20}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-20 text-right">
                    <span className="text-xs font-semibold text-slate-700">{20 + index * 20}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="grid grid-cols-7 gap-2 animate-fadeIn">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-[10px] font-semibold text-slate-500 py-2">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }).map((_, index) => {
              const hasEvent = [5, 8, 12, 15, 20, 24].includes(index);
              const isToday = index === 13;
              return (
                <div
                  key={index}
                  className={`aspect-square rounded-lg border transition-all duration-300 ${
                    animatedCards.includes(Math.floor(index / 7))
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-95'
                  } ${
                    isToday
                      ? 'bg-blue-600 border-blue-600 text-white font-semibold'
                      : hasEvent
                      ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  } flex items-center justify-center text-[10px] cursor-pointer`}
                  style={{ transitionDelay: `${Math.floor(index / 7) * 50}ms` }}
                >
                  {index + 1}
                  {hasEvent && !isToday && (
                    <div className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600"></div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Demo Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent px-4 py-3 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-600">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Sprint 2 • 8 days left</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Users className="w-3.5 h-3.5" />
              <span>4 members</span>
            </div>
            <div className="flex items-center gap-1.5 text-green-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+24% velocity</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-600">
              <Zap className="w-3.5 h-3.5" />
              <span>67% complete</span>
            </div>
          </div>
          <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-colors group">
            <span>View full workspace</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InteractiveDemo;
