import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  StickyNote, 
  Plus, 
  X, 
  ChevronRight,
  ChevronLeft,
  Trash2,
  Copy,
  Edit3
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
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

  // Get colors based on workflow type
  const colors = workflowType === 'custom' ? CUSTOM_COLORS : AUTOMATED_COLORS;
  
  // Get theme colors
  const themeColors = {
    primary: workflowType === 'custom' ? 'purple' : 'blue',
    bg: workflowType === 'custom' ? 'bg-purple-50' : 'bg-blue-50',
    border: workflowType === 'custom' ? 'border-purple-300' : 'border-blue-300',
    text: workflowType === 'custom' ? 'text-purple-900' : 'text-blue-900',
    button: workflowType === 'custom' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-blue-500 hover:bg-blue-600',
    accent: workflowType === 'custom' ? 'bg-purple-100' : 'bg-blue-100',
    hover: workflowType === 'custom' ? 'hover:bg-purple-50' : 'hover:bg-blue-50',
  };

  const getColorClasses = (colorValue: string) => {
    const colorObj = colors.find(c => c.value === colorValue);
    return colorObj || colors[0];
  };

  return (
    <>
      {/* Side Panel */}
      <div className={cn(
        "fixed bottom-6 right-0 z-40 transition-all duration-300 ease-in-out",
        isPanelOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <Card className={cn(
          "rounded-l-lg rounded-r-none border-l border-t border-b shadow-lg",
          themeColors.bg,
          "w-72 max-h-[calc(100vh-8rem)]"
        )}>
          <CardContent className="p-0 h-full flex flex-col max-h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className={cn(
              "p-3 border-b flex-shrink-0",
              themeColors.border,
              "bg-white"
            )}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center",
                    themeColors.button,
                    "text-white shadow-sm"
                  )}>
                    <StickyNote className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={cn("font-semibold text-xs", themeColors.text)}>
                      Notes
                    </h3>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 mt-0.5">
                      {notes.length}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsPanelOpen(false)}
                  className="w-6 h-6"
                  title="Close panel"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Add Note Button */}
              <Button
                onClick={async () => {
                  const newNoteId = await createNote(colors[0].value);
                  if (newNoteId) {
                    setExpandedNoteId(newNoteId);
                  }
                }}
                className={cn(
                  "w-full font-medium shadow-sm text-xs h-7",
                  themeColors.button,
                  "text-white"
                )}
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add Note
              </Button>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
              {notes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <StickyNote className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p className="text-xs">No notes yet</p>
                </div>
              ) : (
                notes.map((note) => {
                  const colorClasses = getColorClasses(note.color);
                  const isExpanded = expandedNoteId === note.id;
                  
                  return (
                    <Card 
                      key={note.id}
                      className={cn(
                        "border transition-all duration-200 cursor-pointer",
                        colorClasses.value,
                        themeColors.hover
                      )}
                      onClick={() => !isExpanded && setExpandedNoteId(note.id)}
                    >
                      <CardContent className="p-2">
                        {!isExpanded ? (
                          // Collapsed View - Title Only
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className={cn(
                                "w-2 h-2 rounded-full flex-shrink-0",
                                colorClasses.accent
                              )} />
                              <span className={cn("text-xs font-medium truncate", colorClasses.text)}>
                                {note.title || 'Untitled Note'}
                              </span>
                            </div>
                            <Edit3 className={cn("w-3 h-3 flex-shrink-0 ml-2", colorClasses.text, "opacity-50")} />
                          </div>
                        ) : (
                          // Expanded View - Full Edit Mode
                          <div onClick={(e) => e.stopPropagation()}>
                            {/* Note Header */}
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                <div className={cn(
                                  "w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5",
                                  colorClasses.accent
                                )} />
                                <span className={cn("text-[10px] truncate", colorClasses.text)}>
                                  {new Date(note.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => duplicateNote(note.id)}
                                  className="w-5 h-5 hover:bg-white/50"
                                  title="Duplicate"
                                >
                                  <Copy className="w-2.5 h-2.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    if (confirm('Delete this note?')) {
                                      deleteNote(note.id);
                                      setExpandedNoteId(null);
                                    }
                                  }}
                                  className="w-5 h-5 hover:bg-red-100 hover:text-red-600"
                                  title="Delete"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setExpandedNoteId(null)}
                                  className="w-5 h-5 hover:bg-white/50"
                                  title="Close"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </Button>
                              </div>
                            </div>

                            {/* Title Input */}
                            <Input
                              value={note.title}
                              onChange={(e) => updateNote(note.id, { title: e.target.value })}
                              placeholder="Note title..."
                              className={cn(
                                "mb-2 border-0 bg-white/70 focus-visible:ring-1 focus-visible:ring-offset-0 rounded text-xs p-2 h-7 font-medium",
                                colorClasses.text,
                                "placeholder:text-gray-400"
                              )}
                              style={{ 
                                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                              }}
                            />

                            {/* Content Textarea */}
                            <Textarea
                              value={note.content}
                              onChange={(e) => updateNote(note.id, { content: e.target.value })}
                              placeholder="Note description..."
                              className={cn(
                                "resize-none border-0 bg-white/70 focus-visible:ring-1 focus-visible:ring-offset-0 rounded text-xs p-2 min-h-[100px]",
                                colorClasses.text,
                                "placeholder:text-gray-400"
                              )}
                              style={{ 
                                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                              }}
                            />

                            {/* Note Footer */}
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/40">
                              <span className={cn("text-[10px]", colorClasses.text, "opacity-75")}>
                                {note.content.length} chars
                              </span>
                              <span className={cn("text-[10px]", colorClasses.text, "opacity-75")}>
                                {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Footer Actions */}
            {notes.length > 0 && (
              <div className="p-2.5 border-t bg-white flex-shrink-0">
                <div className="grid grid-cols-2 gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-6"
                    onClick={() => {
                      if (confirm(`Clear all ${notes.length} notes?`)) {
                        notes.forEach(note => deleteNote(note.id));
                        setExpandedNoteId(null);
                      }
                    }}
                  >
                    <Trash2 className="w-2.5 h-2.5 mr-1" />
                    Clear
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-6"
                    onClick={() => {
                      const data = JSON.stringify(notes, null, 2);
                      const blob = new Blob([data], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `notes-${projectId}-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Export
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Toggle Button (when panel is closed) */}
      {!isPanelOpen && (
        <Button
          onClick={() => setIsPanelOpen(true)}
          className={cn(
            "fixed bottom-8 right-0 z-40 rounded-l-md rounded-r-none shadow-md h-20 w-8 flex flex-col items-center justify-center gap-1 py-2",
            themeColors.button,
            "text-white"
          )}
          title="Open notes"
        >
          <StickyNote className="w-4 h-4" />
          <ChevronLeft className="w-3.5 h-3.5" />
          {notes.length > 0 && (
            <Badge className="h-4 min-w-4 text-[9px] px-1 bg-white text-blue-600">
              {notes.length}
            </Badge>
          )}
        </Button>
      )}
    </>
  );
};

export default StickyNotes;