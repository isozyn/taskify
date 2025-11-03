import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, GripVertical } from "lucide-react";
import KanbanBoardAutoSync from "./KanbanBoardAutoSync";
import KanbanBoardCustom from "./KanbanBoardCustom";

interface KanbanBoardProps {
  projectMembers: any[];
  onWorkflowChange?: (workflow: "auto-sync" | "custom") => void;
  workflowType?: "auto-sync" | "custom";
  projectId?: number;
  onTasksChange?: () => void;
}

const KanbanBoard = ({ projectMembers, onWorkflowChange, workflowType: initialWorkflowType, projectId, onTasksChange }: KanbanBoardProps) => {
  const [boardTemplate, setBoardTemplate] = useState<"auto-sync" | "custom">(initialWorkflowType || "auto-sync");

  const handleTemplateChange = (template: "auto-sync" | "custom") => {
    setBoardTemplate(template);
    onWorkflowChange?.(template);
  };

  return (
    <div className="space-y-4">
      {boardTemplate === "auto-sync" ? (
        <KanbanBoardAutoSync projectMembers={projectMembers} projectId={projectId} onTasksChange={onTasksChange} />
      ) : (
        <KanbanBoardCustom projectMembers={projectMembers} projectId={projectId} onTasksChange={onTasksChange} />
      )}
    </div>
  );
};

export default KanbanBoard;
