/**
 * Enhanced Task Description Editor with Rich Text
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Save, 
  Edit,
  Eye,
  Clock,
  User
} from 'lucide-react';
import RichTextEditor, { Block } from '../ui/RichTextEditor';
import { getAuthToken } from '../../utils/auth';

interface TaskDescriptionEditorProps {
  taskId: number;
  taskTitle: string;
  initialDescription?: string;
  onSave?: (content: Block[]) => void;
  readOnly?: boolean;
}

interface TaskDescription {
  id: string;
  title: string;
  content: Block[];
  taskId: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: number;
    name: string;
    email: string;
  };
}

const TaskDescriptionEditor: React.FC<TaskDescriptionEditorProps> = ({
  taskId,
  taskTitle,
  initialDescription,
  onSave,
  readOnly = false
}) => {
  const [description, setDescription] = useState<TaskDescription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(!readOnly);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

  // Load existing task description
  useEffect(() => {
    loadTaskDescription();
  }, [taskId]);

  const loadTaskDescription = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        // Fallback to simple description
        if (initialDescription) {
          setDescription({
            id: `task-desc-${taskId}`,
            title: `${taskTitle} - Description`,
            content: [
              { id: `block-${Date.now()}`, type: 'paragraph', content: initialDescription }
            ],
            taskId,
            createdBy: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/projects/tasks/${taskId}/description`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.description) {
          setDescription(data.description);
        } else {
          await createTaskDescription();
        }
      } else {
        await createTaskDescription();
      }
    } catch (error) {
      console.error('Error loading task description:', error);
      await createTaskDescription();
    } finally {
      setIsLoading(false);
    }
  };

  const createTaskDescription = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const initialContent: Block[] = [
        { id: `block-${Date.now()}`, type: 'heading2', content: 'Description' },
        { 
          id: `block-${Date.now() + 1}`, 
          type: 'paragraph', 
          content: initialDescription || 'Add a detailed description for this task...' 
        },
        { id: `block-${Date.now() + 2}`, type: 'heading3', content: 'Acceptance Criteria' },
        { id: `block-${Date.now() + 3}`, type: 'todo', content: '' },
        { id: `block-${Date.now() + 4}`, type: 'heading3', content: 'Notes' },
        { id: `block-${Date.now() + 5}`, type: 'paragraph', content: '' }
      ];

      const response = await fetch(`${API_URL}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `${taskTitle} - Description`,
          type: 'TASK_DESCRIPTION',
          taskId,
          content: initialContent
        })
      });

      if (response.ok) {
        const data = await response.json();
        setDescription(data.document);
      }
    } catch (error) {
      console.error('Error creating task description:', error);
    }
  };

  const saveDescription = async (content: Block[]) => {
    if (!description) return;

    setIsSaving(true);
    try {
      const token = getAuthToken();
      if (!token) {
        // Fallback to local callback
        onSave?.(content);
        setLastSaved(new Date());
        return;
      }

      const response = await fetch(`${API_URL}/documents/${description.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        const data = await response.json();
        setDescription(data.document);
        setLastSaved(new Date());
        onSave?.(content);
      }
    } catch (error) {
      console.error('Error saving task description:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = (blocks: Block[]) => {
    if (description) {
      setDescription({ ...description, content: blocks });
    }
  };

  // Auto-save with debounce
  useEffect(() => {
    if (!description || !isEditing) return;

    const timeoutId = setTimeout(() => {
      saveDescription(description.content);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [description?.content, isEditing]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Task Description
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Save Status */}
            {isSaving ? (
              <div className="flex items-center gap-1 text-sm text-blue-600">
                <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : lastSaved ? (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <Save className="w-3 h-3" />
                <span>Saved</span>
              </div>
            ) : null}

            {/* Edit/View Toggle */}
            {!readOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {description?.author && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <User className="w-4 h-4" />
            <span>Created by {description.author.name}</span>
            <Clock className="w-4 h-4 ml-2" />
            <span>Updated {new Date(description.updatedAt).toLocaleDateString()}</span>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {description ? (
          <RichTextEditor
            initialContent={description.content}
            onChange={handleContentChange}
            placeholder="Add a detailed description for this task..."
            readOnly={!isEditing}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No description available</p>
            {!readOnly && (
              <Button
                onClick={createTaskDescription}
                className="mt-2"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Description
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskDescriptionEditor;