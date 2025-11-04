/**
 * Meeting Notes Component - Rich text notes for meetings
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Calendar, 
  Users, 
  Clock,
  Save,
  CheckSquare,
  Plus
} from 'lucide-react';
import RichTextEditor, { Block } from '../ui/RichTextEditor';
import { getAuthToken } from '../../utils/auth';

interface MeetingNotesProps {
  meetingId: string;
  meetingTitle: string;
  meetingDate: Date;
  attendees?: string[];
  onClose?: () => void;
}

interface Document {
  id: string;
  title: string;
  content: Block[];
  type: string;
  meetingId: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: number;
    name: string;
    email: string;
  };
}

const MeetingNotes: React.FC<MeetingNotesProps> = ({
  meetingId,
  meetingTitle,
  meetingDate,
  attendees = [],
  onClose
}) => {
  const [notes, setNotes] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

  // Load existing meeting notes
  useEffect(() => {
    loadMeetingNotes();
  }, [meetingId]);

  const loadMeetingNotes = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_URL}/projects/meetings/${meetingId}/notes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.notes) {
          setNotes(data.notes);
        } else {
          // Create new meeting notes if none exist
          await createMeetingNotes();
        }
      } else {
        // Create new meeting notes if none exist
        await createMeetingNotes();
      }
    } catch (error) {
      console.error('Error loading meeting notes:', error);
      await createMeetingNotes();
    } finally {
      setIsLoading(false);
    }
  };

  const createMeetingNotes = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const initialContent: Block[] = [
        { id: `block-${Date.now()}`, type: 'heading1', content: `${meetingTitle} - Meeting Notes` },
        { id: `block-${Date.now() + 1}`, type: 'paragraph', content: '' },
        { id: `block-${Date.now() + 2}`, type: 'heading2', content: 'Agenda' },
        { id: `block-${Date.now() + 3}`, type: 'bulletList', content: '' },
        { id: `block-${Date.now() + 4}`, type: 'heading2', content: 'Discussion Points' },
        { id: `block-${Date.now() + 5}`, type: 'paragraph', content: '' },
        { id: `block-${Date.now() + 6}`, type: 'heading2', content: 'Action Items' },
        { id: `block-${Date.now() + 7}`, type: 'todo', content: '' },
        { id: `block-${Date.now() + 8}`, type: 'heading2', content: 'Next Steps' },
        { id: `block-${Date.now() + 9}`, type: 'paragraph', content: '' }
      ];

      const response = await fetch(`${API_URL}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `${meetingTitle} - Meeting Notes`,
          type: 'MEETING_NOTES',
          meetingId,
          content: initialContent
        })
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data.document);
      }
    } catch (error) {
      console.error('Error creating meeting notes:', error);
    }
  };

  const saveMeetingNotes = async (content: Block[]) => {
    if (!notes) return;

    setIsSaving(true);
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_URL}/documents/${notes.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data.document);
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Error saving meeting notes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save with debounce
  useEffect(() => {
    if (!notes) return;

    const timeoutId = setTimeout(() => {
      saveMeetingNotes(notes.content);
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [notes?.content]);

  const handleContentChange = (blocks: Block[]) => {
    if (notes) {
      setNotes({ ...notes, content: blocks });
    }
  };

  const getActionItems = () => {
    if (!notes) return [];
    return notes.content.filter(block => block.type === 'todo' && block.content.trim());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{meetingTitle}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{meetingDate.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {attendees.length > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{attendees.length} attendees</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Save Status */}
            <div className="flex items-center gap-2 text-sm">
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-blue-600">Saving...</span>
                </>
              ) : lastSaved ? (
                <>
                  <Save className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">
                    Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </>
              ) : null}
            </div>

            {onClose && (
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            )}
          </div>
        </div>

        {/* Attendees */}
        {attendees.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Attendees</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {attendees.map((attendee, index) => (
                <Badge key={index} variant="secondary">
                  {attendee}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Main Notes Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {notes ? (
            <RichTextEditor
              initialContent={notes.content}
              onChange={handleContentChange}
              placeholder="Start taking meeting notes..."
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Unable to load meeting notes</p>
            </div>
          )}
        </div>

        {/* Action Items Sidebar */}
        <div className="w-80 border-l bg-gray-50 p-4">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Action Items</h3>
          </div>

          <div className="space-y-2">
            {getActionItems().length === 0 ? (
              <p className="text-sm text-gray-500">
                No action items yet. Use the todo block type in your notes to create action items.
              </p>
            ) : (
              getActionItems().map((item, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-white rounded border">
                  <input
                    type="checkbox"
                    checked={item.completed || false}
                    onChange={(e) => {
                      const updatedContent = notes!.content.map(block =>
                        block.id === item.id ? { ...block, completed: e.target.checked } : block
                      );
                      handleContentChange(updatedContent);
                    }}
                    className="mt-1"
                  />
                  <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : ''}`}>
                    {item.content}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-gray-500">
              💡 Tip: Use the "/" command in your notes and select "To-do List" to create action items that will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingNotes;