import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  StickyNote, 
  Plus, 
  X, 
  Minimize2, 
  Maximize2, 
  Grip,
  Palette,
  Save,
  Trash2,
  Copy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStickyNotes } from "@/hooks/useStickyNotes";

interface StickyNotesProps {
  projectId?: string;
  workflowType?: 'auto-sync' | 'custom';
}

const AUTOMATED_COLORS = [
  { name: 'Professional Blue', value: 'bg-blue-50 border-blue-200', text: 'text-blue-800', accent: 'bg-blue-500' },
  { name: 'Success Green', value: 'bg-green-50 border-green-200', text: 'text-green-800', accent: 'bg-green-500' },
  { name: 'Warning Amber', value: 'bg-amber-50 border-amber-200', text: 'text-amber-800', accent: 'bg-amber-500' },
  { name: 'Info Cyan', value: 'bg-cyan-50 border-cyan-200', text: 'text-cyan-800', accent: 'bg-cyan-500' },
  { name: 'Neutral Gray', value: 'bg-gray-50 border-gray-200', text: 'text-gray-800', accent: 'bg-gray-500' },
];

const CUSTOM_COLORS = [
  { name: 'Royal Purple', value: 'bg-purple-50 border-purple-200', text: 'text-purple-800', accent: 'bg-purple-500' },
  { name: 'Magenta', value: 'bg-fuchsia-50 border-fuchsia-200', text: 'text-fuchsia-800', accent: 'bg-fuchsia-500' },
  { name: 'Indigo', value: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-800', accent: 'bg-indigo-500' },
  { name: 'Rose', value: 'bg-rose-50 border-rose-200', text: 'text-rose-800', accent: 'bg-rose-500' },
  { name: 'Violet', value: 'bg-violet-50 border-violet-200', text: 'text-violet-800', accent: 'bg-violet-500' },
];

const StickyNotes = ({ projectId = 'default', workflowType = 'auto-sync' }: StickyNotesProps) => {
  const { notes, createNote, updateNote, deleteNote, duplicateNote } = useStickyNotes(projectId);
  const [isMainMinimized, setIsMainMinimized] = useState(true); // Start minimized
  const [isExpanded, setIsExpanded] = useState(false);
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Get colors based on workflow type
  const colors = workflowType === 'custom' ? CUSTOM_COLORS : AUTOMATED_COLORS;
  
  // Get theme colors
  const themeColors = {
    primary: workflowType === 'custom' ? 'purple' : 'blue',
    bg: workflowType === 'custom' ? 'bg-purple-100' : 'bg-blue-100',
    border: workflowType === 'custom' ? 'border-purple-300' : 'border-blue-300',
    text: workflowType === 'custom' ? 'text-purple-900' : 'text-blue-900',
    button: workflowType === 'custom' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-blue-500 hover:bg-blue-600',
    accent: workflowType === 'custom' ? 'bg-purple-200 hover:bg-purple-300' : 'bg-blue-200 hover:bg-blue-300',
  };

  const handleMouseDown = (e: React.MouseEvent, noteId: string) => {
    if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
    
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    setDraggedNote(noteId);
    setDragOffset({
      x: e.clientX - note.position.x,
      y: e.clientY - note.position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!draggedNote) return;

    updateNote(draggedNote, {
      position: {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      }
    });
  };

  const handleMouseUp = () => {
    setDraggedNote(null);
  };

  useEffect(() => {
    if (draggedNote) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedNote, dragOffset]);

  const getColorClasses = (colorValue: string) => {
    const colorObj = colors.find(c => c.value === colorValue);
    return colorObj || colors[0];
  };

  return (
    <>
      {/* Professional Sticky Notes Panel */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className={cn(
          "transition-all duration-500 ease-in-out transform",
          isMainMinimized ? "translate-x-0" : "translate-x-0"
        )}>
          {!isMainMinimized ? (
            <Card className={cn(
              "shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm mt-2",
              themeColors.bg,
              themeColors.border,
              "border-2"
            )}>
              <CardContent className={cn(
                "p-0 overflow-hidden",
                isExpanded ? "w-80" : "w-64"
              )}>
                {/* Header */}
                <div className={cn(
                  "p-4 border-b",
                  themeColors.border,
                  "bg-white/50"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        themeColors.button,
                        "text-white shadow-sm"
                      )}>
                        <StickyNote className="w-4 h-4" />
                      </div>
                      <div>
                        <span className={cn("font-bold text-sm", themeColors.text)}>
                          {workflowType === 'custom' ? 'Custom Notes' : 'Project Notes'}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs px-2 py-0">
                            {notes.length} notes
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs px-2 py-0",
                              workflowType === 'custom' ? 'border-purple-300 text-purple-700' : 'border-blue-300 text-blue-700'
                            )}
                          >
                            {workflowType === 'custom' ? 'Custom' : 'Auto-Sync'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-7 h-7 hover:bg-white/50"
                        title={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMainMinimized(true)}
                        className="w-7 h-7 hover:bg-white/50"
                        title="Minimize"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <Button
                    onClick={() => createNote(colors[0].value)}
                    className={cn(
                      "w-full font-semibold shadow-sm",
                      themeColors.button,
                      "text-white"
                    )}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Note
                  </Button>
                  
                  {notes.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className={cn("font-semibold text-xs", themeColors.text)}>
                          Recent Notes
                        </p>
                        {notes.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{notes.length - 3} more
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {notes.slice(-3).map(note => (
                          <div 
                            key={note.id} 
                            className="p-2 bg-white/50 rounded-md border border-gray-200 hover:bg-white/70 transition-colors cursor-pointer"
                            onClick={() => {
                              // Focus on the note
                              const noteElement = document.querySelector(`[data-note-id="${note.id}"]`);
                              if (noteElement) {
                                noteElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }
                            }}
                          >
                            <div className="text-xs font-medium text-gray-700 truncate">
                              {note.content || 'Empty note'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(note.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isExpanded && (
                    <div className="pt-2 border-t border-gray-200">
                      <p className={cn("font-semibold text-xs mb-2", themeColors.text)}>
                        Quick Actions
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            // Clear all notes with confirmation
                            if (confirm('Clear all notes?')) {
                              notes.forEach(note => deleteNote(note.id));
                            }
                          }}
                        >
                          Clear All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            // Export notes
                            const data = JSON.stringify(notes, null, 2);
                            const blob = new Blob([data], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `notes-${projectId}-${new Date().toISOString().split('T')[0]}.json`;
                            a.click();
                          }}
                        >
                          Export
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button
              onClick={() => setIsMainMinimized(false)}
              className={cn(
                "w-9 h-9 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105",
                "bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm"
              )}
              title="Sticky Notes"
            >
              S
            </Button>
          )}
        </div>
      </div>

      {/* Individual Sticky Notes */}
      {notes.map((note) => {
        const colorClasses = getColorClasses(note.color);
        
        return (
          <div
            key={note.id}
            className="fixed z-40 select-none"
            style={{
              left: note.position.x,
              top: note.position.y,
              transform: draggedNote === note.id ? 'rotate(2deg)' : 'rotate(0deg)',
            }}
          >
            <Card 
              className={cn(
                "shadow-lg hover:shadow-xl transition-all duration-300 border-2 backdrop-blur-sm",
                colorClasses.value,
                draggedNote === note.id ? "scale-105 shadow-2xl rotate-1" : "",
                note.isMinimized ? "w-52" : "w-72"
              )}
              data-note-id={note.id}
            >
              <CardContent className="p-0">
                {/* Professional Note Header */}
                <div 
                  className={cn(
                    "flex items-center justify-between p-3 border-b cursor-move bg-white/30",
                    "hover:bg-white/50 transition-colors duration-200",
                    colorClasses.text
                  )}
                  onMouseDown={(e) => handleMouseDown(e, note.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center",
                      colorClasses.accent,
                      "text-white shadow-sm"
                    )}>
                      <Grip className="w-3 h-3" />
                    </div>
                    <div>
                      <span className="text-xs font-bold">
                        Note #{note.id.split('-')[1]?.slice(0, 4)}
                      </span>
                      <div className="text-xs opacity-75 mt-0.5">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {/* Color Picker */}
                    <div className="flex items-center gap-1">
                      {colors.slice(0, 3).map((color) => (
                        <button
                          key={color.name}
                          onClick={() => updateNote(note.id, { color: color.value })}
                          className={cn(
                            "w-4 h-4 rounded-full border-2 transition-all duration-200 relative",
                            color.value,
                            note.color === color.value ? "ring-2 ring-offset-1 ring-gray-400" : ""
                          )}
                          title={color.name}
                        >
                          <div className={cn(
                            "absolute inset-1 rounded-full",
                            color.accent
                          )} />
                        </button>
                      ))}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => updateNote(note.id, { isMinimized: !note.isMinimized })}
                      className="w-5 h-5 hover:bg-black/10"
                    >
                      {note.isMinimized ? (
                        <Maximize2 className="w-3 h-3" />
                      ) : (
                        <Minimize2 className="w-3 h-3" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteNote(note.id)}
                      className="w-5 h-5 hover:bg-red-200 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Professional Note Content */}
                {!note.isMinimized && (
                  <div className="p-4 bg-white/20">
                    <Textarea
                      value={note.content}
                      onChange={(e) => updateNote(note.id, { content: e.target.value })}
                      placeholder={workflowType === 'custom' ? "Custom workflow notes..." : "Project notes and reminders..."}
                      className={cn(
                        "min-h-[140px] resize-none border-0 bg-white/50 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-0 rounded-md p-3",
                        colorClasses.text,
                        "placeholder:text-gray-500 font-medium"
                      )}
                      style={{ 
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    />
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/30">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium opacity-75">
                          {note.content.length} chars
                        </span>
                        <span className="text-xs opacity-50">•</span>
                        <span className="text-xs opacity-75">
                          {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => duplicateNote(note.id)}
                          className="w-7 h-7 hover:bg-white/30 rounded-md"
                          title="Duplicate note"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateNote(note.id, { updatedAt: new Date().toISOString() })}
                          className="w-7 h-7 hover:bg-white/30 rounded-md"
                          title="Save note"
                        >
                          <Save className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteNote(note.id)}
                          className="w-7 h-7 hover:bg-red-200 hover:text-red-700 rounded-md"
                          title="Delete note"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Professional Minimized Preview */}
                {note.isMinimized && (
                  <div className={cn("p-3 bg-white/20", colorClasses.text)}>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        colorClasses.accent
                      )} />
                      <p className="text-xs font-medium truncate flex-1">
                        {note.content || 'Empty note'}
                      </p>
                    </div>
                    <div className="text-xs opacity-60 mt-1">
                      {note.content.length} characters
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </>
  );
};

export default StickyNotes;