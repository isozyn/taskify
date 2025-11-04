import { useState } from "react";
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
  const [boardTemplate, setBoardTemplate] = useState<"auto-sync" | "custom">(initialWorkflowType || "auto-sync");

  const handleTemplateChange = async (template: "auto-sync" | "custom") => {
    setBoardTemplate(template);
    onWorkflowChange?.(template);
    
    // Update the project's workflow type in the backend
    if (projectId) {
      try {
        await api.updateProject(projectId, {
          workflowType: template === "auto-sync" ? "AUTOMATED" : "CUSTOM"
        });
        console.log(`Updated project workflow type to ${template}`);
      } catch (error) {
        console.error('Failed to update project workflow type:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      {boardTemplate === "auto-sync" ? (
        <KanbanBoardAutoSync projectMembers={projectMembers} projectId={projectId} onTasksChange={onTasksChange} />
      ) : (
        <KanbanBoardCustom projectMembers={projectMembers} projectId={projectId} onTasksChange={onTasksChange} onColumnsChange={onColumnsChange} />
      )}
    </div>
  );
};

export default KanbanBoard;
