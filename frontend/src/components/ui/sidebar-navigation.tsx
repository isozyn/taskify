import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isCompleted?: boolean;
  isRequired?: boolean;
}

interface SidebarNavigationProps {
  sections: SidebarSection[];
  currentSection: string;
  onSectionChange: (sectionId: string) => void;
  className?: string;
}

export const SidebarNavigation = ({ 
  sections, 
  currentSection, 
  onSectionChange, 
  className = "" 
}: SidebarNavigationProps) => {
  return (
    <div className={cn("w-64 bg-slate-50 border-r border-slate-200 p-4", className)}>
      <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wide">
        Setup Progress
      </h3>
      
      <nav className="space-y-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = currentSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200",
                isActive 
                  ? "bg-blue-100 text-blue-700 border border-blue-200" 
                  : "hover:bg-white hover:shadow-sm text-slate-700 hover:text-slate-900"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                isActive 
                  ? "bg-blue-200" 
                  : section.isCompleted 
                    ? "bg-green-100" 
                    : "bg-slate-200"
              )}>
                {section.isCompleted ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Icon className={cn(
                    "w-4 h-4",
                    isActive 
                      ? "text-blue-600" 
                      : section.isCompleted 
                        ? "text-green-600" 
                        : "text-slate-500"
                  )} />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {section.title}
                  </span>
                  {section.isRequired && (
                    <span className="text-red-500 text-xs">*</span>
                  )}
                </div>
              </div>
              
              {isActive && (
                <ChevronRight className="w-4 h-4 text-blue-600" />
              )}
            </button>
          );
        })}
      </nav>
      
      <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-xs font-medium text-blue-700">Progress</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(sections.filter(s => s.isCompleted).length / sections.length) * 100}%` 
            }}
          />
        </div>
        <p className="text-xs text-blue-600 mt-1">
          {sections.filter(s => s.isCompleted).length} of {sections.length} completed
        </p>
      </div>
    </div>
  );
};