import { useState, useEffect, useCallback } from 'react';

export interface Note {
  id: string;
  content: string;
  color: string;
  position: { x: number; y: number };
  isMinimized: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useStickyNotes = (projectId: string = 'default') => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load notes from localStorage
  useEffect(() => {
    const loadNotes = () => {
      try {
        const savedNotes = localStorage.getItem(`sticky-notes-${projectId}`);
        if (savedNotes) {
          const parsedNotes = JSON.parse(savedNotes);
          setNotes(parsedNotes);
        }
      } catch (error) {
        console.error('Error loading sticky notes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, [projectId]);

  // Save notes to localStorage
  const saveNotes = useCallback((notesToSave: Note[]) => {
    try {
      if (notesToSave.length > 0) {
        localStorage.setItem(`sticky-notes-${projectId}`, JSON.stringify(notesToSave));
      } else {
        localStorage.removeItem(`sticky-notes-${projectId}`);
      }
    } catch (error) {
      console.error('Error saving sticky notes:', error);
    }
  }, [projectId]);

  // Auto-save when notes change
  useEffect(() => {
    if (!isLoading) {
      saveNotes(notes);
    }
  }, [notes, saveNotes, isLoading]);

  const createNote = useCallback((defaultColor?: string) => {
    const newNote: Note = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: '',
      color: defaultColor || 'bg-blue-50 border-blue-200',
      position: { 
        x: Math.random() * 300 + 100, 
        y: Math.random() * 300 + 100 
      },
      isMinimized: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setNotes(prev => [...prev, newNote]);
    return newNote.id;
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note
    ));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  }, []);

  const clearAllNotes = useCallback(() => {
    setNotes([]);
  }, []);

  const duplicateNote = useCallback((id: string) => {
    const noteToClone = notes.find(note => note.id === id);
    if (!noteToClone) return;

    const duplicatedNote: Note = {
      ...noteToClone,
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: {
        x: noteToClone.position.x + 20,
        y: noteToClone.position.y + 20,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNotes(prev => [...prev, duplicatedNote]);
    return duplicatedNote.id;
  }, [notes]);

  return {
    notes,
    isLoading,
    createNote,
    updateNote,
    deleteNote,
    clearAllNotes,
    duplicateNote,
  };
};