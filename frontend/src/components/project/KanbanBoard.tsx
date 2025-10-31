import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, GripVertical } from "lucide-react";
import KanbanBoardAutoSync from "./KanbanBoardAutoSync";
import KanbanBoardCustom from "./KanbanBoardCustom";

interface KanbanBoardProps {
  projectMembers: any[];
  onWorkflowChange?: (workflow: "auto-sync" | "custom") => void;
  workflowType?: "auto-sync" | "custom";
}

const KanbanBoard = ({ projectMembers, onWorkflowChange, workflowType: initialWorkflowType }: KanbanBoardProps) => {
  const [boardTemplate, setBoardTemplate] = useState<"auto-sync" | "custom">(initialWorkflowType || "auto-sync");

  const handleTemplateChange = (template: "auto-sync" | "custom") => {
    setBoardTemplate(template);
    onWorkflowChange?.(template);
  };

  return (
    <div className="space-y-4">
      {boardTemplate === "auto-sync" ? (
        <KanbanBoardAutoSync projectMembers={projectMembers} />
      ) : (
        <KanbanBoardCustom projectMembers={projectMembers} />
      )}
    </div>
  );
};

export default KanbanBoard;
