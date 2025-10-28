import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, GripVertical } from "lucide-react";
import KanbanBoardAutoSync from "./KanbanBoardAutoSync";
import KanbanBoardCustom from "./KanbanBoardCustom";

interface KanbanBoardProps {
  projectMembers: any[];
}

const KanbanBoard = ({ projectMembers }: KanbanBoardProps) => {
  const [boardTemplate, setBoardTemplate] = useState<"auto-sync" | "custom">("auto-sync");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <span className="text-sm font-medium text-slate-700">Board Template:</span>
        <div className="flex gap-2">
          <Button
            variant={boardTemplate === "auto-sync" ? "default" : "outline"}
            size="sm"
            onClick={() => setBoardTemplate("auto-sync")}
            className={boardTemplate === "auto-sync" 
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" 
              : "border-slate-300 text-slate-700 hover:bg-slate-100"
            }
          >
            <Calendar className="w-4 h-4 mr-2" />
            Automated Workflow
          </Button>
          <Button
            variant={boardTemplate === "custom" ? "default" : "outline"}
            size="sm"
            onClick={() => setBoardTemplate("custom")}
            className={boardTemplate === "custom" 
              ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white" 
              : "border-slate-300 text-slate-700 hover:bg-slate-100"
            }
          >
            <GripVertical className="w-4 h-4 mr-2" />
            Custom Workflow
          </Button>
        </div>
      </div>

      {boardTemplate === "auto-sync" ? (
        <KanbanBoardAutoSync projectMembers={projectMembers} />
      ) : (
        <KanbanBoardCustom projectMembers={projectMembers} />
      )}
    </div>
  );
};

export default KanbanBoard;
