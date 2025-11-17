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

				{/* Template Cards */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
					{/* Calendar-Synced Template */}
					<div
						onClick={() => setSelectedTemplate("auto-sync")}
						onMouseEnter={() => setHoveredTemplate("auto-sync")}
						onMouseLeave={() => setHoveredTemplate(null)}
						className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
							selectedTemplate === "auto-sync"
								? "bg-white border-2 border-blue-500 shadow-2xl"
								: "bg-white/80 border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl"
						}`}
						style={{
							backdropFilter: 'blur(10px)',
						}}
					>
						{/* Subtle gradient effect */}
						{(selectedTemplate === "auto-sync" || hoveredTemplate === "auto-sync") && (
							<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/50 to-transparent pointer-events-none"></div>
						)}

						<div className="relative z-10">
							<h2 className="text-3xl font-bold text-slate-900 mb-2">Automated Workflow</h2>
							<p className="text-slate-600 mb-6">Date-based automation</p>

							{/* Icon Illustration */}
							<div className="mb-6 p-6 rounded-xl bg-blue-50 border border-blue-200">
								<div className="flex items-center justify-center gap-4">
									<div className="relative">
										<Calendar className="w-16 h-16 text-blue-600 stroke-[1.5]" />
										<div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
											<Check className="w-4 h-4 text-white" />
										</div>
									</div>
									<Clock className="w-16 h-16 text-blue-600 stroke-[1.5]" />
								</div>
								<div className="flex justify-center gap-1 mt-4">
									{[...Array(3)].map((_, i) => (
										<div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
									))}
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
						onClick={() => setSelectedTemplate("custom")}
						onMouseEnter={() => setHoveredTemplate("custom")}
						onMouseLeave={() => setHoveredTemplate(null)}
						className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
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
									<div className="text-purple-600">
										<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<path d="M7 7l10 10M17 7l-10 10" />
										</svg>
									</div>
								</div>
								<div className="flex justify-center gap-1 mt-4">
									{[...Array(3)].map((_, i) => (
										<div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
									))}
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

				{/* Continue Button */}
				<div className="flex justify-center">
					<Button
						size="lg"
						disabled={!selectedTemplate}
						onClick={handleContinue}
						className={`px-8 py-6 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 ${
							selectedTemplate === "auto-sync"
								? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
								: selectedTemplate === "custom"
								? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
								: "bg-slate-300"
						} disabled:opacity-50 disabled:cursor-not-allowed text-white`}
					>
						Continue to Dashboard
					</Button>
				</div>
			</div>
		</div>
	);
};

export default TemplateSelection;
