import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
	Calendar,
	GripVertical,
	Check,
	ArrowLeft,
	Sparkles,
	Zap,
	Layout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const TemplateSelection = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [selectedTemplate, setSelectedTemplate] = useState<
		"auto-sync" | "custom" | null
	>(null);

	// Get project data from previous step
	const projectData = location.state?.projectData;

	const handleContinue = () => {
		if (selectedTemplate && projectData) {
			// Navigate to dashboard with complete project data
			navigate("/dashboard", {
				state: {
					selectedTemplate,
					projectData,
					createProject: true,
				},
			});
		}
	};

	return (
		<div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex flex-col">
			<Navbar />

			{/* Main Container - Flex with proper height */}
			<div className="flex-1 flex flex-col max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mt-16 overflow-hidden">
				{/* Back Button - Compact */}
				<div className="mb-3">
					<Button
						variant="ghost"
						size="sm"
						onClick={() =>
							navigate("/project-setup", {
								state: { projectData },
							})
						}
						className="text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 -ml-2 h-8"
					>
						<ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
						Back
					</Button>
				</div>

				{/* Title Section - Minimal */}
				<div className="mb-4">
					<div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-100/60 text-blue-700 text-xs font-medium mb-2">
						<Sparkles className="w-3 h-3" />
						Step 2 of 2
					</div>
					<h1 className="text-2xl font-bold text-slate-900 mb-1">
						Choose your workflow
					</h1>
					{projectData && (
						<p className="text-sm text-blue-600 font-semibold">
							{projectData.name}
						</p>
					)}
				</div>

				{/* Templates Grid - Compact, side by side */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0 overflow-y-auto pb-4">
					{/* Automated Workflow Template */}
					<div
						className={`relative rounded-xl overflow-hidden transition-all duration-200 cursor-pointer bg-white flex flex-col h-fit ${
							selectedTemplate === "auto-sync"
								? "ring-2 ring-blue-500 shadow-lg"
								: "ring-1 ring-slate-200 hover:ring-blue-300 hover:shadow-md"
						}`}
						onClick={() => setSelectedTemplate("auto-sync")}
					>
						{/* Header with badge */}
						<div className="flex items-center justify-between p-3 border-b border-slate-100">
							<div className="flex items-center gap-2">
								<div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
									<Calendar className="w-4 h-4 text-white" />
								</div>
								<div>
									<h3 className="text-base font-bold text-slate-900">
										Automated Workflow
									</h3>
									<p className="text-xs text-slate-500">
										Time-based automation
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
									<Zap className="w-3 h-3" />
									RECOMMENDED
								</span>
								{selectedTemplate === "auto-sync" && (
									<div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
										<Check className="w-3.5 h-3.5 text-white stroke-[3]" />
									</div>
								)}
							</div>
						</div>

						{/* Visual Preview - Image */}
						<div className="p-3 bg-gradient-to-br from-blue-50/60 to-white border-b border-slate-100">
							<div className="bg-white rounded-md border border-slate-200 overflow-hidden h-48 flex items-center justify-center">
							<img 
								src="/Auto Workflow pic.png" 
								alt="Automated Workflow Preview" 
								className="w-full h-full object-cover"
									onError={(e) => {
										// Fallback to placeholder if image fails to load
										e.currentTarget.style.display = 'none';
										e.currentTarget.parentElement!.innerHTML = '<div class="grid grid-cols-5 gap-1 h-full p-2"><div class="h-16 bg-slate-100 rounded"></div><div class="h-14 bg-yellow-100 rounded"></div><div class="h-20 bg-blue-100 rounded"></div><div class="h-12 bg-purple-100 rounded"></div><div class="h-18 bg-green-100 rounded"></div></div>';
									}}
								/>
							</div>
						</div>

						{/* Content - Minimal */}
						<div className="p-3 flex-1 flex flex-col">
							<p className="text-xs text-slate-600 mb-3">
								Tasks move automatically based on dates. Perfect
								for deadline-driven teams.
							</p>

							{/* Compact feature list */}
							<div className="space-y-1.5 mb-3 flex-1">
								{[
									"Auto-moves by date",
									"Fixed workflow stages",
									"Timeline views",
									"Sprint tracking",
								].map((feature, idx) => (
									<div
										key={idx}
										className="flex items-center gap-2"
									>
										<Check className="w-3 h-3 text-blue-600 stroke-[2.5] flex-shrink-0" />
										<p className="text-xs text-slate-700">
											{feature}
										</p>
									</div>
								))}
							</div>

							{/* Tags - Single row */}
							<div className="pt-2 border-t border-slate-100">
								<div className="flex flex-wrap gap-1">
									{["Product Launches", "Marketing", "Agile"].map(
										(tag) => (
											<span
												key={tag}
												className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded border border-blue-100"
											>
												{tag}
											</span>
										)
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Custom Workflow Template */}
					<div
						className={`relative rounded-xl overflow-hidden transition-all duration-200 cursor-pointer bg-white flex flex-col h-fit ${
							selectedTemplate === "custom"
								? "ring-2 ring-purple-500 shadow-lg"
								: "ring-1 ring-slate-200 hover:ring-purple-300 hover:shadow-md"
						}`}
						onClick={() => setSelectedTemplate("custom")}
					>
						{/* Header with badge */}
						<div className="flex items-center justify-between p-3 border-b border-slate-100">
							<div className="flex items-center gap-2">
								<div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
									<GripVertical className="w-4 h-4 text-white" />
								</div>
								<div>
									<h3 className="text-base font-bold text-slate-900">
										Custom Workflow
									</h3>
									<p className="text-xs text-slate-500">
										Drag-and-drop control
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
									<Layout className="w-3 h-3" />
									FLEXIBLE
								</span>
								{selectedTemplate === "custom" && (
									<div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
										<Check className="w-3.5 h-3.5 text-white stroke-[3]" />
									</div>
								)}
							</div>
						</div>

						{/* Visual Preview - Image */}
						<div className="p-3 bg-gradient-to-br from-purple-50/60 to-white border-b border-slate-100">
							<div className="bg-white rounded-md border border-slate-200 overflow-hidden h-48 flex items-center justify-center">
							<img 
								src="/Custom Kanban.png" 
								alt="Custom Workflow Preview" 
								className="w-full h-full object-cover"
									onError={(e) => {
										// Fallback to placeholder if image fails to load
										e.currentTarget.style.display = 'none';
										e.currentTarget.parentElement!.innerHTML = '<div class="grid grid-cols-4 gap-1.5 h-full p-2"><div class="h-20 bg-purple-100 rounded"></div><div class="h-16 bg-blue-100 rounded"></div><div class="h-24 bg-yellow-100 rounded"></div><div class="h-18 bg-green-100 rounded"></div></div>';
									}}
								/>
							</div>
						</div>

						{/* Content - Minimal */}
						<div className="p-3 flex-1 flex flex-col">
							<p className="text-xs text-slate-600 mb-3">
								Full manual control with drag-and-drop. Design
								your own stages for creative workflows.
							</p>

							{/* Compact feature list */}
							<div className="space-y-1.5 mb-3 flex-1">
								{[
									"Unlimited columns",
									"Drag & drop",
									"Manual control",
									"Flexible stages",
								].map((feature, idx) => (
									<div
										key={idx}
										className="flex items-center gap-2"
									>
										<Check className="w-3 h-3 text-purple-600 stroke-[2.5] flex-shrink-0" />
										<p className="text-xs text-slate-700">
											{feature}
										</p>
									</div>
								))}
							</div>

							{/* Tags - Single row */}
							<div className="pt-2 border-t border-slate-100">
								<div className="flex flex-wrap gap-1">
									{["Design", "Content", "Creative"].map(
										(tag) => (
											<span
												key={tag}
												className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded border border-purple-100"
											>
												{tag}
											</span>
										)
									)}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Bottom Action Bar - Fixed height */}
				<div className="mt-auto pt-3">
					<div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3">
						<div className="flex items-center justify-between gap-3">
							<div>
								{selectedTemplate ? (
									<p className="text-sm font-medium text-slate-900">
										<span
											className={
												selectedTemplate === "auto-sync"
													? "text-blue-600"
													: "text-purple-600"
											}
										>
											{selectedTemplate === "auto-sync"
												? "Automated Workflow"
												: "Custom Workflow"}
										</span>{" "}
										selected
									</p>
								) : (
									<p className="text-sm text-slate-600">
										Select a workflow to continue
									</p>
								)}
							</div>
							<Button
								size="default"
								disabled={!selectedTemplate}
								onClick={handleContinue}
								className={`shadow-sm transition-all ${
									selectedTemplate === "auto-sync"
										? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
										: selectedTemplate === "custom"
										? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
										: ""
								}`}
							>
								Continue
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TemplateSelection;
