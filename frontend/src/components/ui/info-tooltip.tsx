import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InfoTooltipProps {
  content: string | React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

export const InfoTooltip = ({ content, side = "top", className = "" }: InfoTooltipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className={`w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help ${className}`} />
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs">
        <div className="text-xs">{content}</div>
      </TooltipContent>
    </Tooltip>
  );
};