import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, GripVertical, Check, ArrowLeft, Clock, Layout, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const TemplateSelection = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [selectedTemplate, setSelectedTemplate] = useState<"auto-sync" | "custom" | null>(null);
	const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

	const projectData = location.state?.projectData;

	const handleContinue = () => {
		if (selectedTemplate && projectData) {
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
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
			{/* Subtle Background Gradients */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl"></div>
				<div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl"></div>
			</div>

			{/* Header */}
			<div className="relative z-10 max-w-6xl mx-auto px-6 py-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
							<Check className="w-5 h-5 text-white" />
						</div>
						<span className="text-2xl font-bold text-slate-900">Taskify</span>
					</div>
					<div className="flex items-center gap-3">
						<span className="text-sm text-slate-600">Welcome, <span className="text-slate-900 font-medium">Angelique Hilario</span></span>
						<div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
							A
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
				<div className="text-center mb-12">
					<h1 className="text-5xl font-bold text-slate-900 mb-3">
						Choose your workflow
					</h1>
					<p className="text-lg text-slate-600">{projectData?.name || 'Test example'}</p>
				</div>

				{/* Templates Grid - Compact, side by side */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0 overflow-y-auto pb-4">
					{/* Automated Workflow Template */}
					<div
						className={`relative rounded-xl overflow-hidden transition-all duration-200 cursor-pointer bg-white flex flex-col h-fit ${
							selectedTemplate === "auto-sync"
								? "bg-white border-2 border-blue-500 shadow-2xl"
								: "bg-white/80 border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl"
						}`}
						style={{
							backdropFilter: 'blur(10px)',
						}}
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

							{/* Features */}
							<div className="space-y-2 mb-6">
								{[
									"Auto-moves by date",
									"Fixed workflow stages",
									"Timeline views",
									"Sprint tracking",
								].map((feature, idx) => (
									<div key={idx} className="flex items-center gap-2">
										<Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
										<span className="text-sm text-slate-700">{feature}</span>
									</div>
								))}
							</div>

							{/* Tags */}
							<div className="flex flex-wrap gap-2">
								{["Product Launches", "Marketing", "Agile"].map((tag) => (
									<span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
										{tag}
									</span>
								))}
							</div>
						</div>
					</div>

					{/* Custom Workflow Template */}
					<div
						className={`relative rounded-xl overflow-hidden transition-all duration-200 cursor-pointer bg-white flex flex-col h-fit ${
							selectedTemplate === "custom"
								? "bg-white border-2 border-purple-500 shadow-2xl"
								: "bg-white/80 border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl"
						}`}
						style={{
							backdropFilter: 'blur(10px)',
						}}
					>
						{/* Subtle gradient effect */}
						{(selectedTemplate === "custom" || hoveredTemplate === "custom") && (
							<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-50/50 to-transparent pointer-events-none"></div>
						)}

						<div className="relative z-10">
							<h2 className="text-3xl font-bold text-slate-900 mb-2">Custom Workflow</h2>
							<p className="text-slate-600 mb-6">Drag-and-drop control</p>

							{/* Icon Illustration */}
							<div className="mb-6 p-6 rounded-xl bg-purple-50 border border-purple-200">
								<div className="flex items-center justify-center gap-3">
									<div className="grid grid-cols-3 gap-2">
										<div className="w-12 h-16 bg-purple-200 border border-purple-300 rounded"></div>
										<div className="w-12 h-16 bg-purple-600 border border-purple-600 rounded shadow-lg"></div>
										<div className="w-12 h-16 bg-orange-200 border border-orange-300 rounded"></div>
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

							{/* Features */}
							<div className="space-y-2 mb-6">
								{[
									"Unlimited columns",
									"Drag & drop",
									"Manual control",
									"Flexible stages",
								].map((feature, idx) => (
									<div key={idx} className="flex items-center gap-2">
										<Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
										<span className="text-sm text-slate-700">{feature}</span>
									</div>
								))}
							</div>

							{/* Tags */}
							<div className="flex flex-wrap gap-2">
								{["Design", "Content", "Creative"].map((tag) => (
									<span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
										{tag}
									</span>
								))}
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
