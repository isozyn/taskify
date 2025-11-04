/**
 * Project Wiki Component - Notion-style documentation space for projects
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  FileText, 
  Calendar,
  User,
  Tag,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import RichTextEditor, { Block } from '../ui/RichTextEditor';
import { getAuthToken } from '../../utils/auth';

interface Document {
  id: string;
  title: string;
  content: Block[];
  type: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  author?: {
    id: number;
    name: string;
    email: string;
  };
}

interface ProjectWikiProps {
  projectId: number;
}

const ProjectWiki: React.FC<ProjectWikiProps> = ({ projectId }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

  // Load project wiki pages
  useEffect(() => {
    loadWikiPages();
  }, [projectId]);

  const loadWikiPages = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_URL}/projects/${projectId}/wiki`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.pages || []);
      }
    } catch (error) {
      console.error('Error loading wiki pages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new wiki page
  const createWikiPage = async (title: string) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_URL}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          type: 'WIKI',
          projectId,
          content: [
            { id: `block-${Date.now()}`, type: 'heading1', content: title },
            { id: `block-${Date.now() + 1}`, type: 'paragraph', content: '' }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(prev => [data.document, ...prev]);
        setSelectedDoc(data.document);
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Error creating wiki page:', error);
    }
  };

  // Update document
  const updateDocument = async (docId: string, updates: { title?: string; content?: Block[] }) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_URL}/documents/${docId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(prev => prev.map(doc => 
          doc.id === docId ? data.document : doc
        ));
        if (selectedDoc?.id === docId) {
          setSelectedDoc(data.document);
        }
      }
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  // Filter documents based on search
  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 border-r bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Project Wiki</h2>
            <Button
              onClick={() => setIsCreating(true)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Page
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No wiki pages yet</p>
              <p className="text-sm">Create your first page to get started</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedDoc?.id === doc.id
                      ? 'bg-blue-100 border-blue-200'
                      : 'hover:bg-white border-transparent'
                  } border`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{doc.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <User className="w-3 h-3" />
                        <span>{doc.author?.name}</span>
                        <Calendar className="w-3 h-3 ml-1" />
                        <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                      </div>
                      {doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {doc.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {doc.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{doc.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {isCreating ? (
          <CreatePageForm
            onSubmit={createWikiPage}
            onCancel={() => setIsCreating(false)}
          />
        ) : selectedDoc ? (
          <DocumentEditor
            document={selectedDoc}
            onUpdate={updateDocument}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Welcome to your Project Wiki</h3>
              <p className="text-sm mb-4">Select a page from the sidebar or create a new one</p>
              <Button
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Page
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Create Page Form Component
const CreatePageForm: React.FC<{
  onSubmit: (title: string) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim());
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Wiki Page</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Page Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter page title..."
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={!title.trim()}>
                Create Page
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Document Editor Component
const DocumentEditor: React.FC<{
  document: Document;
  onUpdate: (docId: string, updates: { title?: string; content?: Block[] }) => void;
}> = ({ document, onUpdate }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(document.title);

  const handleTitleSave = () => {
    if (title.trim() && title !== document.title) {
      onUpdate(document.id, { title: title.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleContentChange = (blocks: Block[]) => {
    onUpdate(document.id, { content: blocks });
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Document Header */}
      <div className="border-b bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSave();
                    if (e.key === 'Escape') {
                      setTitle(document.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  className="text-2xl font-bold border-none p-0 h-auto"
                  autoFocus
                />
              </div>
            ) : (
              <h1
                className="text-2xl font-bold cursor-pointer hover:bg-gray-50 p-2 rounded"
                onClick={() => setIsEditingTitle(true)}
              >
                {document.title}
              </h1>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{document.author?.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Updated {new Date(document.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <RichTextEditor
          initialContent={document.content}
          onChange={handleContentChange}
          placeholder="Start writing your wiki page..."
        />
      </div>
    </div>
  );
};

export default ProjectWiki;