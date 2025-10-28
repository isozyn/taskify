import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, GripVertical, Check, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const TemplateSelection = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<"auto-sync" | "custom" | null>(null);

  const handleContinue = () => {
    if (selectedTemplate) {
      // Navigate to new project form with selected template
      navigate("/dashboard", { state: { selectedTemplate } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-slate-900">Template Selection</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Choose your project template
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Select the workflow that best fits your team's needs. Each template is designed for specific project types and team workflows.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Calendar-Synced Template */}
          <div
            className={`relative border-2 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ${
              selectedTemplate === "auto-sync"
                ? "border-blue-500 shadow-xl shadow-blue-100 scale-[1.02]"
                : "border-slate-200 hover:border-blue-300 hover:shadow-lg"
            }`}
            onClick={() => setSelectedTemplate("auto-sync")}
          >
            {/* Selected indicator */}
            {selectedTemplate === "auto-sync" && (
              <div className="absolute top-4 right-4 z-10">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <Check className="w-5 h-5 text-white font-bold" />
                </div>
              </div>
            )}

            {/* Colorful header */}
            <div className="h-3 bg-gradient-to-r from-purple-400 via-blue-500 to-blue-600"></div>

            {/* Preview Section */}
            <div className="p-8 bg-gradient-to-br from-blue-50/60 to-white border-b border-slate-100">
              <div className="bg-white rounded-xl border-2 border-slate-200 shadow-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="h-3 bg-blue-200 rounded w-24 mb-1"></div>
                      <div className="h-2 bg-slate-200 rounded w-16"></div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    RECOMMENDED
                  </span>
                </div>
                
                <div className="grid grid-cols-5 gap-2">
                  <div className="space-y-2">
                    <div className="h-2 bg-slate-300 rounded"></div>
                    <div className="h-16 bg-slate-100 rounded"></div>
                    <div className="h-12 bg-slate-100 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-slate-300 rounded"></div>
                    <div className="h-14 bg-yellow-100 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-slate-300 rounded"></div>
                    <div className="h-20 bg-blue-100 rounded"></div>
                    <div className="h-16 bg-blue-100 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-slate-300 rounded"></div>
                    <div className="h-12 bg-purple-100 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-slate-300 rounded"></div>
                    <div className="h-24 bg-green-100 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 bg-white">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">
                    Calendar-Synced Board
                  </h3>
                  <p className="text-sm text-blue-600 font-medium">
                    Automated time-based workflow
                  </p>
                </div>
              </div>

              <p className="text-slate-700 mb-6 leading-relaxed">
                Perfect for deadline-driven teams and time-sensitive projects. Tasks automatically move between stages based on their dates, ensuring nothing falls through the cracks.
              </p>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                  Key Features
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 text-blue-600 font-bold" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Automatic Task Movement</p>
                      <p className="text-xs text-slate-600">Tasks transition through stages based on start and due dates</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 text-blue-600 font-bold" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Fixed Workflow Stages</p>
                      <p className="text-xs text-slate-600">Backlog → Upcoming → In Progress → Review → Complete</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 text-blue-600 font-bold" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Timeline & Calendar Views</p>
                      <p className="text-xs text-slate-600">Visualize project progress across time with integrated calendars</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 text-blue-600 font-bold" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Sprint & Milestone Support</p>
                      <p className="text-xs text-slate-600">Built-in support for agile methodologies and milestone tracking</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 text-blue-600 font-bold" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Progress Tracking</p>
                      <p className="text-xs text-slate-600">Visual progress bars and completion metrics for each task</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-500 font-medium mb-3">BEST FOR:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-lg">
                    Product Launches
                  </span>
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-lg">
                    Marketing Campaigns
                  </span>
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-lg">
                    Agile/Scrum Teams
                  </span>
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-lg">
                    Event Planning
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Workflow Template */}
          <div
            className={`relative border-2 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ${
              selectedTemplate === "custom"
                ? "border-purple-500 shadow-xl shadow-purple-100 scale-[1.02]"
                : "border-slate-200 hover:border-purple-300 hover:shadow-lg"
            }`}
            onClick={() => setSelectedTemplate("custom")}
          >
            {/* Selected indicator */}
            {selectedTemplate === "custom" && (
              <div className="absolute top-4 right-4 z-10">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Check className="w-5 h-5 text-white font-bold" />
                </div>
              </div>
            )}

            {/* Colorful header */}
            <div className="h-3 bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500"></div>

            {/* Preview Section */}
            <div className="p-8 bg-gradient-to-br from-purple-50/60 to-white border-b border-slate-100">
              <div className="bg-white rounded-xl border-2 border-slate-200 shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <GripVertical className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="h-3 bg-purple-200 rounded w-28 mb-1"></div>
                    <div className="h-2 bg-slate-200 rounded w-20"></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-2">
                    <div className="h-2 bg-slate-300 rounded mb-2"></div>
                    <div className="h-20 bg-purple-100 rounded shadow-sm"></div>
                    <div className="h-14 bg-purple-100 rounded shadow-sm"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-slate-300 rounded mb-2"></div>
                    <div className="h-16 bg-blue-100 rounded shadow-sm"></div>
                    <div className="h-12 bg-blue-100 rounded shadow-sm"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-slate-300 rounded mb-2"></div>
                    <div className="h-24 bg-yellow-100 rounded shadow-sm"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-slate-300 rounded mb-2"></div>
                    <div className="h-18 bg-green-100 rounded shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 bg-white">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                  <GripVertical className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">
                    Custom Workflow Board
                  </h3>
                  <p className="text-sm text-purple-600 font-medium">
                    Flexible drag-and-drop workflow
                  </p>
                </div>
              </div>

              <p className="text-slate-700 mb-6 leading-relaxed">
                Ideal for creative teams with unique processes and flexible timelines. Design your own workflow stages and move tasks manually between them with intuitive drag-and-drop.
              </p>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                  Key Features
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 text-purple-600 font-bold" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Unlimited Custom Columns</p>
                      <p className="text-xs text-slate-600">Create as many workflow stages as you need for your process</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 text-purple-600 font-bold" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Drag & Drop Interface</p>
                      <p className="text-xs text-slate-600">Intuitive task movement between columns with smooth animations</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 text-purple-600 font-bold" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Complete Control</p>
                      <p className="text-xs text-slate-600">No automatic task movement - you decide when tasks move forward</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 text-purple-600 font-bold" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Quick Task Creation</p>
                      <p className="text-xs text-slate-600">Trello-style quick add cards in any column for rapid task entry</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 text-purple-600 font-bold" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Customizable Stages</p>
                      <p className="text-xs text-slate-600">Rename, reorder, add, or remove columns to match your workflow</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-500 font-medium mb-3">BEST FOR:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-purple-100 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-lg">
                    Design Projects
                  </span>
                  <span className="bg-purple-100 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-lg">
                    Content Creation
                  </span>
                  <span className="bg-purple-100 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-lg">
                    Creative Teams
                  </span>
                  <span className="bg-purple-100 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-lg">
                    Flexible Workflows
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-between p-6 bg-white rounded-xl border-2 border-slate-200 shadow-sm">
          <div>
            <p className="text-sm text-slate-700 font-medium">
              {selectedTemplate ? (
                <>
                  Selected:{" "}
                  <span className={selectedTemplate === "auto-sync" ? "text-blue-600" : "text-purple-600"}>
                    {selectedTemplate === "auto-sync" ? "Calendar-Synced Board" : "Custom Workflow Board"}
                  </span>
                </>
              ) : (
                "Select a template to continue"
              )}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              💡 You can switch templates later in Project Settings
            </p>
          </div>
          <Button
            size="lg"
            disabled={!selectedTemplate}
            onClick={handleContinue}
            className={
              selectedTemplate === "auto-sync"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
                : selectedTemplate === "custom"
                ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md"
                : ""
            }
          >
            Continue with Selected Template
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelection;
