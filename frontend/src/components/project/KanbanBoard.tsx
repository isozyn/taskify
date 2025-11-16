import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, GripVertical } from "lucide-react";
import KanbanBoardAutoSync from "./KanbanBoardAutoSync";
import KanbanBoardCustom from "./KanbanBoardCustom";
import { api } from "@/lib/api";

interface KanbanBoardProps {
  projectMembers: any[];
  onWorkflowChange?: (workflow: "auto-sync" | "custom") => void;
  workflowType?: "auto-sync" | "custom";
  projectId?: number;
  onTasksChange?: () => void;
  onColumnsChange?: () => void;
}

const KanbanBoard = ({ projectMembers, onWorkflowChange, workflowType: initialWorkflowType, projectId, onTasksChange, onColumnsChange }: KanbanBoardProps) => {
  // Use the current workflow type directly from props, with fallback to auto-sync
  const currentWorkflowType = initialWorkflowType || "auto-sync";

  const handleTemplateChange = async (template: "auto-sync" | "custom") => {
    onWorkflowChange?.(template);
    
    // Update the project's workflow type in the backend
    if (projectId) {
      try {
        await api.updateProject(projectId, {
          workflowType: template === "auto-sync" ? "AUTOMATED" : "CUSTOM"
        });
      } catch (error) {
      }
    }
  };

  return (
    <div className="space-y-4">
      {currentWorkflowType === "auto-sync" ? (
        <KanbanBoardAutoSync projectMembers={projectMembers} projectId={projectId} onTasksChange={onTasksChange} />
      ) : (
        <KanbanBoardCustom projectMembers={projectMembers} projectId={projectId} onTasksChange={onTasksChange} onColumnsChange={onColumnsChange} />
      )}
    </div>
  );
};

export default KanbanBoard;
