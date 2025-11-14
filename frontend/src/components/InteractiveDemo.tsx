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
    { id: 1, title: "Design product mockups", status: "todo", priority: "high", assignee: "AH", comments: 3, attachments: 2, dueDate: "Today", tags: ["Design", "UI"] },
    { id: 2, title: "Setup calendar sync workflow", status: "todo", priority: "medium", assignee: "JM", comments: 1, attachments: 0, dueDate: "Dec 16", tags: ["Backend"] },
    { id: 3, title: "Build custom board view", status: "progress", priority: "high", assignee: "SM", comments: 5, attachments: 1, dueDate: "Tomorrow", tags: ["Frontend"] },
    { id: 4, title: "Implement drag & drop", status: "progress", priority: "high", assignee: "DK", comments: 4, attachments: 0, dueDate: "Dec 15", tags: ["Feature"] },
    { id: 5, title: "Add team member invites", status: "progress", priority: "medium", assignee: "AH", comments: 2, attachments: 1, dueDate: "Dec 17", tags: ["Feature"] },
    { id: 6, title: "Test workflow automation", status: "review", priority: "urgent", assignee: "JM", comments: 8, attachments: 3, dueDate: "Today", tags: ["Testing"] },
    { id: 7, title: "Review task assignment logic", status: "review", priority: "high", assignee: "SM", comments: 6, attachments: 2, dueDate: "Today", tags: ["Review"] },
    { id: 8, title: "Launch beta version", status: "done", priority: "urgent", assignee: "DK", comments: 12, attachments: 4, dueDate: "Completed", tags: ["Launch"] },
    { id: 9, title: "User onboarding flow", status: "done", priority: "medium", assignee: "AH", comments: 3, attachments: 2, dueDate: "Completed", tags: ["UX"] },
  ];

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-slate-100', count: tasks.filter(t => t.status === 'todo').length },
    { id: 'progress', title: 'In Progress', color: 'bg-blue-100', count: tasks.filter(t => t.status === 'progress').length },
    { id: 'review', title: 'Review', color: 'bg-amber-100', count: tasks.filter(t => t.status === 'review').length },
    { id: 'done', title: 'Done', color: 'bg-green-100', count: tasks.filter(t => t.status === 'done').length },
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
                <p className="text-[10px] text-slate-500">David completed "Launch beta version"</p>
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
              <h3 className="text-sm font-semibold text-slate-900">Product Launch Q1 2025</h3>
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-500">{tasks.length} tasks • 4 members</p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[10px] text-green-600 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[
                { initials: 'AH', color: 'from-pink-500 to-rose-500' },
                { initials: 'JM', color: 'from-blue-500 to-indigo-500' },
                { initials: 'SM', color: 'from-purple-500 to-violet-500' },
                { initials: 'DK', color: 'from-green-500 to-emerald-500' }
              ].map((member, i) => (
                <div
                  key={i}
                  className={`w-7 h-7 rounded-full bg-gradient-to-br ${member.color} border-2 border-white flex items-center justify-center text-[10px] font-semibold text-white hover:scale-110 transition-transform cursor-pointer`}
                  title={`Team member ${member.initials}`}
                >
                  {member.initials}
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
                        
                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {task.tags.map((tag, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-medium rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
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
                            <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${
                              task.assignee === 'AH' ? 'from-pink-500 to-rose-500' :
                              task.assignee === 'JM' ? 'from-blue-500 to-indigo-500' :
                              task.assignee === 'SM' ? 'from-purple-500 to-violet-500' :
                              'from-green-500 to-emerald-500'
                            } flex items-center justify-center text-[8px] font-semibold text-white`}>
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
              <Calendar className="w-3.5 h-3.5" />
              <span>Jan 15 - Feb 28</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Users className="w-3.5 h-3.5" />
              <span>4 members</span>
            </div>
            <div className="flex items-center gap-1.5 text-green-600">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{tasks.filter(t => t.status === 'done').length}/{tasks.length} tasks done</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-600">
              <Zap className="w-3.5 h-3.5" />
              <span>Calendar-synced workflow</span>
            </div>
          </div>
          <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-colors group">
            <span>Try it yourself</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InteractiveDemo;
