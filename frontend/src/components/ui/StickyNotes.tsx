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
}

const COLORS = [
  { name: 'Yellow', value: 'bg-yellow-200 border-yellow-300', text: 'text-yellow-900' },
  { name: 'Pink', value: 'bg-pink-200 border-pink-300', text: 'text-pink-900' },
  { name: 'Blue', value: 'bg-blue-200 border-blue-300', text: 'text-blue-900' },
  { name: 'Green', value: 'bg-green-200 border-green-300', text: 'text-green-900' },
  { name: 'Purple', value: 'bg-purple-200 border-purple-300', text: 'text-purple-900' },
  { name: 'Orange', value: 'bg-orange-200 border-orange-300', text: 'text-orange-900' },
];

const StickyNotes = ({ projectId = 'default' }: StickyNotesProps) => {
  const { notes, createNote, updateNote, deleteNote, duplicateNote } = useStickyNotes(projectId);
  const [isMainMinimized, setIsMainMinimized] = useState(false);
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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
    const colorObj = COLORS.find(c => c.value === colorValue);
    return colorObj || COLORS[0];
  };

  return (
    <>
      {/* Main Sticky Notes Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          isMainMinimized ? "transform scale-75" : ""
        )}>
          {!isMainMinimized ? (
            <Card className="bg-yellow-100 border-yellow-300 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 w-64">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <StickyNote className="w-5 h-5 text-yellow-700" />
                    <span className="font-semibold text-yellow-900">Sticky Notes</span>
                    <Badge variant="outline" className="text-xs">
                      {notes.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMainMinimized(true)}
                      className="w-6 h-6 hover:bg-yellow-200"
                    >
                      <Minimize2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button
                    onClick={createNote}
                    className="w-full bg-yellow-300 hover:bg-yellow-400 text-yellow-900 border border-yellow-400"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Note
                  </Button>
                  
                  {notes.length > 0 && (
                    <div className="text-xs text-yellow-700 space-y-1">
                      <p className="font-medium">Recent Notes:</p>
                      {notes.slice(-3).map(note => (
                        <div key={note.id} className="truncate">
                          • {note.content || 'Empty note'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button
              onClick={() => setIsMainMinimized(false)}
              className="w-12 h-12 rounded-full bg-yellow-300 hover:bg-yellow-400 text-yellow-900 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <StickyNote className="w-5 h-5" />
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
            <Card className={cn(
              "shadow-lg hover:shadow-xl transition-all duration-300 border-2",
              colorClasses.value,
              draggedNote === note.id ? "scale-105 shadow-2xl" : "",
              note.isMinimized ? "w-48" : "w-64"
            )}>
              <CardContent className="p-0">
                {/* Note Header */}
                <div 
                  className={cn(
                    "flex items-center justify-between p-2 border-b cursor-move",
                    colorClasses.value,
                    colorClasses.text
                  )}
                  onMouseDown={(e) => handleMouseDown(e, note.id)}
                >
                  <div className="flex items-center gap-2">
                    <Grip className="w-4 h-4 opacity-60" />
                    <span className="text-xs font-medium">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {/* Color Picker */}
                    <div className="flex items-center gap-1">
                      {COLORS.slice(0, 3).map((color) => (
                        <button
                          key={color.name}
                          onClick={() => updateNote(note.id, { color: color.value })}
                          className={cn(
                            "w-3 h-3 rounded-full border transition-all duration-200",
                            color.value,
                            note.color === color.value ? "ring-2 ring-gray-400" : ""
                          )}
                          title={color.name}
                        />
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

                {/* Note Content */}
                {!note.isMinimized && (
                  <div className="p-3">
                    <Textarea
                      value={note.content}
                      onChange={(e) => updateNote(note.id, { content: e.target.value })}
                      placeholder="Write your note here..."
                      className={cn(
                        "min-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
                        colorClasses.text
                      )}
                      style={{ 
                        background: 'transparent',
                        boxShadow: 'none'
                      }}
                    />
                    
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/10">
                      <span className="text-xs opacity-60">
                        {note.content.length} characters
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => duplicateNote(note.id)}
                          className="w-6 h-6 hover:bg-black/10"
                          title="Duplicate note"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateNote(note.id, { updatedAt: new Date().toISOString() })}
                          className="w-6 h-6 hover:bg-black/10"
                          title="Save note"
                        >
                          <Save className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteNote(note.id)}
                          className="w-6 h-6 hover:bg-red-200 hover:text-red-700"
                          title="Delete note"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Minimized Preview */}
                {note.isMinimized && (
                  <div className={cn("p-2", colorClasses.text)}>
                    <p className="text-xs truncate">
                      {note.content || 'Empty note'}
                    </p>
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