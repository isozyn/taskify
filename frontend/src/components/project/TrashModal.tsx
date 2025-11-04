import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Trash2, AlertTriangle, Calendar } from 'lucide-react';

interface DeletedProject {
  id: number;
  title: string;
  description?: string;
  deletedAt: string;
  color?: string;
}

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectsChange: () => void;
}

const TrashModal: React.FC<TrashModalProps> = ({ isOpen, onClose, onProjectsChange }) => {
  const [deletedProjects, setDeletedProjects] = useState<DeletedProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchDeletedProjects();
    }
  }, [isOpen]);

  const fetchDeletedProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/projects/trash', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch deleted projects');
      }

      const projects = await response.json();
      setDeletedProjects(projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const restoreProject = async (projectId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/projects/${projectId}/restore`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to restore project');
      }

      // Remove from deleted projects list
      setDeletedProjects(prev => prev.filter(p => p.id !== projectId));
      onProjectsChange(); // Refresh main projects list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore project');
    }
  };

  const permanentlyDeleteProject = async (projectId: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/projects/${projectId}/permanent`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to permanently delete project');
      }

      // Remove from deleted projects list
      setDeletedProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to permanently delete project');
    }
  };

  const getDaysUntilExpiry = (deletedAt: string) => {
    const deletedDate = new Date(deletedAt);
    const expiryDate = new Date(deletedDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
    const now = new Date();
    const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    return Math.max(0, daysLeft);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Trash2 className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Trash</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : deletedProjects.length === 0 ? (
            <div className="text-center py-8">
              <Trash2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No deleted projects found</p>
              <p className="text-sm text-gray-400 mt-1">
                Deleted projects will appear here and be automatically removed after 30 days
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <p className="text-yellow-800 text-sm">
                    Projects in trash will be permanently deleted after 30 days
                  </p>
                </div>
              </div>

              {deletedProjects.map((project) => {
                const daysLeft = getDaysUntilExpiry(project.deletedAt);
                return (
                  <div
                    key={project.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: project.color || '#6B7280' }}
                          />
                          <h3 className="font-medium text-gray-900">{project.title}</h3>
                        </div>
                        
                        {project.description && (
                          <p className="text-sm text-gray-600 mt-2 ml-7">
                            {project.description}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 mt-3 ml-7 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Deleted {new Date(project.deletedAt).toLocaleDateString()}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full ${
                            daysLeft <= 7 
                              ? 'bg-red-100 text-red-700' 
                              : daysLeft <= 14 
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                          }`}>
                            {daysLeft} days left
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => restoreProject(project.id)}
                          className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restore</span>
                        </button>
                        
                        <button
                          onClick={() => permanentlyDeleteProject(project.id)}
                          className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete Forever</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrashModal;