import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export interface Note {
  id: string;
  title: string;
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

  // Load notes from API
  useEffect(() => {
    const loadNotes = async () => {
      try {
        if (projectId === 'default') {
          setIsLoading(false);
          return;
        }

        const response = await api.getNotesByProject(parseInt(projectId));
        const apiNotes = response.map((note: any) => ({
          id: note.id.toString(),
          title: note.title,
          content: note.content,
          color: note.color,
          position: { x: 100, y: 100 }, // Default position since not stored in DB
          isMinimized: false,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        }));
        setNotes(apiNotes);
      } catch (error) {
        console.error('Error loading notes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, [projectId]);

  const createNote = useCallback(async (defaultColor?: string) => {
    try {
      if (projectId === 'default') {
        return '';
      }

      const response = await api.createNote(parseInt(projectId), {
        title: '',
        content: '',
        color: defaultColor || 'bg-blue-50 border-blue-200',
      });

      const newNote: Note = {
        id: response.id.toString(),
        title: response.title,
        content: response.content,
        color: response.color,
        position: { x: 100, y: 100 },
        isMinimized: false,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      };
      
      setNotes(prev => [...prev, newNote]);
      return newNote.id;
    } catch (error) {
      console.error('Error creating note:', error);
      return '';
    }
  }, [projectId]);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    try {
      // Optimistic update
      setNotes(prev => prev.map(note => 
        note.id === id 
          ? { ...note, ...updates, updatedAt: new Date().toISOString() }
          : note
      ));

      if (projectId === 'default') {
        return;
      }

      // Only send title, content, and color to API
      const apiUpdates: any = {};
      if (updates.title !== undefined) apiUpdates.title = updates.title;
      if (updates.content !== undefined) apiUpdates.content = updates.content;
      if (updates.color !== undefined) apiUpdates.color = updates.color;

      if (Object.keys(apiUpdates).length > 0) {
        await api.updateNote(parseInt(id), apiUpdates);
      }
    } catch (error) {
      console.error('Error updating note:', error);
      // Revert on error - reload notes
      const response = await api.getNotesByProject(parseInt(projectId));
      const apiNotes = response.map((note: any) => ({
        id: note.id.toString(),
        title: note.title,
        content: note.content,
        color: note.color,
        position: { x: 100, y: 100 },
        isMinimized: false,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      }));
      setNotes(apiNotes);
    }
  }, [projectId]);

  const deleteNote = useCallback(async (id: string) => {
    try {
      // Optimistic delete
      setNotes(prev => prev.filter(note => note.id !== id));

      if (projectId === 'default') {
        return;
      }

      await api.deleteNote(parseInt(id));
    } catch (error) {
      console.error('Error deleting note:', error);
      // Revert on error - reload notes
      const response = await api.getNotesByProject(parseInt(projectId));
      const apiNotes = response.map((note: any) => ({
        id: note.id.toString(),
        title: note.title,
        content: note.content,
        color: note.color,
        position: { x: 100, y: 100 },
        isMinimized: false,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      }));
      setNotes(apiNotes);
    }
  }, [projectId]);

  const clearAllNotes = useCallback(async () => {
    try {
      const notesToDelete = [...notes];
      setNotes([]);

      if (projectId === 'default') {
        return;
      }

      // Delete all notes
      await Promise.all(notesToDelete.map(note => api.deleteNote(parseInt(note.id))));
    } catch (error) {
      console.error('Error clearing notes:', error);
    }
  }, [notes, projectId]);

  const duplicateNote = useCallback(async (id: string) => {
    try {
      const noteToClone = notes.find(note => note.id === id);
      if (!noteToClone || projectId === 'default') return;

      const response = await api.createNote(parseInt(projectId), {
        title: noteToClone.title,
        content: noteToClone.content,
        color: noteToClone.color,
      });

      const duplicatedNote: Note = {
        id: response.id.toString(),
        title: response.title,
        content: response.content,
        color: response.color,
        position: {
          x: noteToClone.position.x + 20,
          y: noteToClone.position.y + 20,
        },
        isMinimized: false,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      };

      setNotes(prev => [...prev, duplicatedNote]);
      return duplicatedNote.id;
    } catch (error) {
      console.error('Error duplicating note:', error);
      return '';
    }
  }, [notes, projectId]);

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