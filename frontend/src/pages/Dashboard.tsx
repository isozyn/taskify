import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { api, Project } from "@/lib/api";
import TrashModal from "@/components/project/TrashModal";
import {
	Plus,
	Layers,
	Calendar,
	Users,
	CheckSquare2,
	TrendingUp,
	Filter,
	Search,
	ChevronRight,
	Clock,
	Eye,
	UserPlus,
	BarChart3,
	Star,
	Grid3x3,
	List,
	FolderOpen,
	Settings,
	GripVertical,
	Check,
	Sparkles,
	ArrowLeft,
	Trash2,
	AlertTriangle,
	RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
	const navigate = useNavigate();
	const [joinProjectCode, setJoinProjectCode] = useState("");
	const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
	const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
	const [isTemplateSelectionOpen, setIsTemplateSelectionOpen] =
		useState(false);
	const [selectedTemplate, setSelectedTemplate] = useState<
		"auto-sync" | "custom" | null
	>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [activeTab, setActiveTab] = useState("recent");
	const [projects, setProjects] = useState<Project[]>([]);
	const [isLoadingProjects, setIsLoadingProjects] = useState(true);
	const [deletedProjects, setDeletedProjects] = useState<Project[]>([]);
	const [isLoadingDeletedProjects, setIsLoadingDeletedProjects] = useState(false);
	const [newProject, setNewProject] = useState({
		name: "",
		description: "",
		startDate: "",
		endDate: "",
		visibility: "private",
	});

	// Fetch projects from database
	const fetchProjects = async () => {
		try {
			setIsLoadingProjects(true);
			const response: any = await api.getProjects();
			setProjects(response || []);
		} catch (error) {
			console.error("Failed to fetch projects:", error);
		} finally {
			setIsLoadingProjects(false);
		}
	};

	// Fetch deleted projects from database
	const fetchDeletedProjects = async () => {
		try {
			setIsLoadingDeletedProjects(true);
			const token = localStorage.getItem('token');
			const response = await fetch('/api/v1/projects/trash', {
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});

			if (response.ok) {
				const deletedProjectsData = await response.json();
				setDeletedProjects(deletedProjectsData || []);
			}
		} catch (error) {
			console.error("Failed to fetch deleted projects:", error);
		} finally {
			setIsLoadingDeletedProjects(false);
		}
	};

	useEffect(() => {
		fetchProjects();
	}, []);

	// Fetch deleted projects when trash tab is active
	useEffect(() => {
		if (activeTab === 'trash') {
			fetchDeletedProjects();
		}
	}, [activeTab]);

	// Mock active tasks data
	const activeTasks = [
		{
			id: 1,
			title: "Design landing page mockup",
			project: "Website Redesign",
			projectId: 1,
			priority: "high",
			dueDate: "2024-01-20",
			assignees: ["John Doe", "Jane Smith"],
			status: "in-progress",
		},
		{
			id: 2,
			title: "Implement authentication system",
			project: "Mobile App Launch",
			projectId: 2,
			priority: "high",
			dueDate: "2024-01-18",
			assignees: ["Mike Johnson"],
			status: "in-progress",
		},
		{
			id: 3,
			title: "Create social media content",
			project: "Marketing Campaign",
			projectId: 3,
			priority: "medium",
			dueDate: "2024-01-22",
			assignees: ["Sarah Wilson", "Emily Davis"],
			status: "review",
		},
		{
			id: 4,
			title: "Database optimization",
			project: "Website Redesign",
			projectId: 1,
			priority: "medium",
			dueDate: "2024-01-25",
			assignees: ["John Doe"],
			status: "upcoming",
		},
		{
			id: 5,
			title: "User testing preparation",
			project: "Mobile App Launch",
			projectId: 2,
			priority: "low",
			dueDate: "2024-01-28",
			assignees: ["Jane Smith", "Mike Johnson"],
			status: "upcoming",
		},
		{
			id: 6,
			title: "Campaign analytics setup",
			project: "Marketing Campaign",
			projectId: 3,
			priority: "high",
			dueDate: "2024-01-19",
			assignees: ["Sarah Wilson"],
			status: "in-progress",
		},
		{
			id: 7,
			title: "API documentation update",
			project: "Website Redesign",
			projectId: 1,
			priority: "low",
			dueDate: "2024-01-30",
			assignees: ["Emily Davis"],
			status: "upcoming",
		},
		{
			id: 8,
			title: "Performance testing",
			project: "Mobile App Launch",
			projectId: 2,
			priority: "medium",
			dueDate: "2024-01-24",
			assignees: ["John Doe", "Mike Johnson"],
			status: "review",
		},
	];

	const handleJoinProject = () => {
		// TODO: Implement join project logic with backend
		console.log("Joining project with code:", joinProjectCode);
		setIsJoinDialogOpen(false);
		setJoinProjectCode("");
		// For now, just show a success message or navigate
	};

	const handleTemplateSelect = (template: "auto-sync" | "custom") => {
		setSelectedTemplate(template);
	};

	const handleConfirmTemplate = () => {
		if (selectedTemplate) {
			setIsTemplateSelectionOpen(false);
			setIsNewProjectModalOpen(true);
		}
	};

	const handleCreateProject = async () => {
		try {
			// Map selectedTemplate to workflowType
			const workflowType =
				selectedTemplate === "auto-sync" ? "AUTOMATED" : "CUSTOM";

			const response: any = await api.createProject({
				title: newProject.name,
				description: newProject.description || undefined,
				workflowType: workflowType,
				startDate: newProject.startDate || undefined,
				endDate: newProject.endDate || undefined,
			});

			console.log("Project created successfully:", response);

			// Refresh the projects list
			const updatedProjects: any = await api.getProjects();
			setProjects(updatedProjects || []);

			setIsNewProjectModalOpen(false);

			// Reset form
			setNewProject({
				name: "",
				description: "",
				startDate: "",
				endDate: "",
				visibility: "private",
			});
			setSelectedTemplate(null);

			// Navigate to the new project workspace
			if (response.id) {
				navigate(`/project/${response.id}`);
			}
		} catch (error) {
			console.error("Failed to create project:", error);
			alert("Failed to create project. Please try again.");
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "high":
				return "bg-red-100 text-red-800 border-red-200";
			case "medium":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "low":
				return "bg-green-100 text-green-800 border-green-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "in-progress":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "review":
				return "bg-purple-100 text-purple-800 border-purple-200";
			case "upcoming":
				return "bg-gray-100 text-gray-800 border-gray-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	// Group tasks by project and sort by priority
	const getTasksByProject = () => {
		const priorityOrder = { high: 3, medium: 2, low: 1 };

		const tasksByProject = activeTasks.reduce(
			(acc, task) => {
				if (!acc[task.project]) {
					const project = projects.find(
						(p) => p.id === task.projectId
					);
					acc[task.project] = {
						projectId: task.projectId,
						projectName: task.project,
						progress: 0, // Will be calculated from tasks when we add task fetching
						totalTasks: 0,
						completedTasks: 0,
						tasks: [],
					};
				}
				acc[task.project].tasks.push(task);
				return acc;
			},
			{} as Record<
				string,
				{
					projectId: number;
					projectName: string;
					progress: number;
					totalTasks: number;
					completedTasks: number;
					tasks: typeof activeTasks;
				}
			>
		);

		// Sort tasks within each project by priority (high to low)
		Object.values(tasksByProject).forEach((project) => {
			project.tasks.sort(
				(a, b) =>
					priorityOrder[b.priority as keyof typeof priorityOrder] -
					priorityOrder[a.priority as keyof typeof priorityOrder]
			);
		});

		return Object.values(tasksByProject);
	};

	// Filter projects based on search query and tab
	const getFilteredProjects = () => {
		let filtered = projects.filter(
			(project) =>
				project.title
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				(project.description &&
					project.description
						.toLowerCase()
						.includes(searchQuery.toLowerCase()))
		);

		if (activeTab === "starred") {
			// For now, show all projects since we don't have starred functionality yet
			filtered = filtered;
		}

		return filtered;
	};

	const filteredProjects = getFilteredProjects();

	// Calculate stats - these will be placeholder until we add task counting
	const totalProjects = projects.length;
	const activeProjects = projects.filter((p) => p.status === "ACTIVE").length;
	const completedProjects = projects.filter(
		(p) => p.status === "COMPLETED"
	).length;

	const renderProjectsView = () => {
		if (isLoadingProjects) {
			return (
				<div className="text-center py-12 bg-white rounded-lg border border-slate-200">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
					<p className="text-sm text-slate-500">
						Loading projects...
					</p>
				</div>
			);
		}

		if (filteredProjects.length === 0) {
			return (
				<div className="text-center py-12 bg-white rounded-lg border border-slate-200">
					<FolderOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
					<h3 className="text-lg font-medium text-slate-900 mb-1">
						No projects found
					</h3>
					<p className="text-sm text-slate-500 mb-4">
						Get started by creating your first project
					</p>
					<Button
						className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
						onClick={() => setIsTemplateSelectionOpen(true)}
					>
						<Plus className="w-4 h-4" />
						Create Project
					</Button>
				</div>
			);
		}

		if (viewMode === "grid") {
			return (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{filteredProjects.map((project) => (
						<Card
							key={project.id}
							className="group cursor-pointer border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all bg-white"
							onClick={() => navigate(`/project/${project.id}`)}
						>
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between mb-2">
									<div
										className="w-10 h-10 rounded flex items-center justify-center"
										style={{
											backgroundColor:
												project.color || "#3B82F6",
										}}
									>
										<Layers className="w-5 h-5 text-white" />
									</div>
									<Badge
										variant="outline"
										className="text-xs"
									>
										{project.workflowType === "AUTOMATED"
											? "Auto-Sync"
											: "Custom"}
									</Badge>
								</div>
								<CardTitle className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
									{project.title}
								</CardTitle>
								<CardDescription className="text-sm text-slate-500 line-clamp-2">
									{project.description || "No description"}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex items-center justify-between pt-2 border-t border-slate-100">
									<Badge
										variant="outline"
										className={`text-xs ${
											project.status === "ACTIVE"
												? "bg-green-50 text-green-700 border-green-200"
												: project.status === "COMPLETED"
												? "bg-blue-50 text-blue-700 border-blue-200"
												: "bg-gray-50 text-gray-700 border-gray-200"
										}`}
									>
										{project.status}
									</Badge>
									<div className="flex items-center gap-1 text-xs text-slate-400">
										<Clock className="w-3.5 h-3.5" />
										<span>
											{new Date(
												project.updatedAt
											).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
											})}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			);
		}

		// List view
		return (
			<div className="space-y-2">
				{filteredProjects.map((project) => (
					<Card
						key={project.id}
						className="group cursor-pointer border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all bg-white"
						onClick={() => navigate(`/project/${project.id}`)}
					>
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4 flex-1">
									<div
										className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
										style={{
											backgroundColor:
												project.color || "#3B82F6",
										}}
									>
										<Layers className="w-5 h-5 text-white" />
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
												{project.title}
											</h3>
											<Badge
												variant="outline"
												className="text-xs flex-shrink-0"
											>
												{project.workflowType ===
												"AUTOMATED"
													? "Auto-Sync"
													: "Custom"}
											</Badge>
										</div>
										<p className="text-sm text-slate-500 truncate">
											{project.description ||
												"No description"}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-6 ml-4">
									<Badge
										variant="outline"
										className={`text-xs w-24 justify-center ${
											project.status === "ACTIVE"
												? "bg-green-50 text-green-700 border-green-200"
												: project.status === "COMPLETED"
												? "bg-blue-50 text-blue-700 border-blue-200"
												: "bg-gray-50 text-gray-700 border-gray-200"
										}`}
									>
										{project.status}
									</Badge>
									<div className="flex items-center gap-1 text-xs text-slate-400 w-20">
										<Clock className="w-3.5 h-3.5" />
										<span>
											{new Date(
												project.updatedAt
											).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
											})}
										</span>
									</div>
									<ChevronRight className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		);
	};

	const renderTrashView = () => {
		if (isLoadingDeletedProjects) {
			return (
				<div className="flex items-center justify-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				</div>
			);
		}

		if (deletedProjects.length === 0) {
			return (
				<div className="text-center py-12 bg-white rounded-lg border border-slate-200">
					<Trash2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
					<h3 className="text-lg font-medium text-slate-900 mb-1">
						No deleted projects
					</h3>
					<p className="text-sm text-slate-500">
						Deleted projects will appear here and be automatically removed after 30 days
					</p>
				</div>
			);
		}

		const getDaysUntilExpiry = (deletedAt: string) => {
			const deletedDate = new Date(deletedAt);
			const expiryDate = new Date(deletedDate.getTime() + (30 * 24 * 60 * 60 * 1000));
			const now = new Date();
			const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
			return Math.max(0, daysLeft);
		};

		const restoreProject = async (projectId: number) => {
			try {
				const token = localStorage.getItem('token');
				const response = await fetch(`/api/v1/projects/${projectId}/restore`, {
					method: 'PATCH',
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				});

				if (!response.ok) {
					throw new Error('Failed to restore project');
				}

				// Remove from deleted projects and refresh main projects
				setDeletedProjects(prev => prev.filter(p => p.id !== projectId));
				fetchProjects();
			} catch (error) {
				console.error('Error restoring project:', error);
				alert('Failed to restore project. Please try again.');
			}
		};

		const permanentlyDeleteProject = async (projectId: number) => {
			if (!window.confirm('Are you sure you want to permanently delete this project? This action cannot be undone.')) {
				return;
			}

			try {
				const token = localStorage.getItem('token');
				const response = await fetch(`/api/v1/projects/${projectId}/permanent`, {
					method: 'DELETE',
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				});

				if (!response.ok) {
					throw new Error('Failed to permanently delete project');
				}

				// Remove from deleted projects list
				setDeletedProjects(prev => prev.filter(p => p.id !== projectId));
			} catch (error) {
				console.error('Error permanently deleting project:', error);
				alert('Failed to permanently delete project. Please try again.');
			}
		};

		return (
			<div className="space-y-4">
				<div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
					<div className="flex items-center space-x-2">
						<AlertTriangle className="w-4 h-4 text-yellow-600" />
						<p className="text-yellow-800 text-sm">
							Projects in trash will be permanently deleted after 30 days
						</p>
					</div>
				</div>

				{deletedProjects.map((project) => {
					const daysLeft = getDaysUntilExpiry(project.deletedAt);
					return (
						<Card
							key={project.id}
							className="border border-gray-200 hover:shadow-sm transition-shadow"
						>
							<CardContent className="p-4">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center space-x-3">
											<div
												className="w-4 h-4 rounded-full"
												style={{ backgroundColor: project.color || '#6B7280' }}
											/>
											<h3 className="font-medium text-gray-900">{project.title}</h3>
										</div>
										
										{project.description && (
											<p className="text-sm text-gray-600 mt-2 ml-7">
												{project.description}
											</p>
										)}
										
										<div className="flex items-center space-x-4 mt-3 ml-7 text-xs text-gray-500">
											<div className="flex items-center space-x-1">
												<Calendar className="w-3 h-3" />
												<span>Deleted {new Date(project.deletedAt).toLocaleDateString()}</span>
											</div>
											<span className={`px-2 py-1 rounded-full ${
												daysLeft <= 7 
													? 'bg-red-100 text-red-700' 
													: daysLeft <= 14 
														? 'bg-yellow-100 text-yellow-700'
														: 'bg-gray-100 text-gray-700'
											}`}>
												{daysLeft} days left
											</span>
										</div>
									</div>

									<div className="flex items-center space-x-2 ml-4">
										<Button
											onClick={() => restoreProject(project.id)}
											size="sm"
											variant="outline"
											className="text-blue-700 border-blue-200 hover:bg-blue-50"
										>
											<RotateCcw className="w-3 h-3 mr-1" />
											Restore
										</Button>
										
										<Button
											onClick={() => permanentlyDeleteProject(project.id)}
											size="sm"
											variant="outline"
											className="text-red-700 border-red-200 hover:bg-red-50"
										>
											<Trash2 className="w-3 h-3 mr-1" />
											Delete Forever
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-slate-50">
			{/* Navbar */}
			<Navbar />

			{/* Main Content */}
			<main className="container mx-auto px-6 py-6 max-w-7xl">
				{/* Header Section with Jira-inspired design */}
				<div className="mb-6">
					<h1 className="text-2xl font-semibold text-slate-900 mb-6">
						Your work
					</h1>

					{/* Action Bar */}
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-3">
							{/* Search */}
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
								<Input
									placeholder="Search projects..."
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
									className="pl-10 w-80 h-9 bg-white border-slate-200 focus:ring-2 focus:ring-blue-100"
								/>
							</div>
						</div>

						<div className="flex items-center gap-2">
							{/* View Toggle */}
							<div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md p-1">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setViewMode("grid")}
									className={`h-7 px-2 ${
										viewMode === "grid"
											? "bg-slate-100"
											: ""
									}`}
								>
									<Grid3x3 className="w-4 h-4" />
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setViewMode("list")}
									className={`h-7 px-2 ${
										viewMode === "list"
											? "bg-slate-100"
											: ""
									}`}
								>
									<List className="w-4 h-4" />
								</Button>
							</div>

							{/* Create Project Button */}
							<Button
								className="gap-2 bg-blue-600 hover:bg-blue-700 text-white h-9 shadow-sm"
								onClick={() => setIsTemplateSelectionOpen(true)}
							>
								<Plus className="w-4 h-4" />
								Create
							</Button>
						</div>
					</div>

					{/* Tabs Navigation */}
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="w-full"
					>
						<TabsList className="bg-transparent border-b border-slate-200 w-full justify-start h-auto p-0 rounded-none">
							<TabsTrigger
								value="recent"
								className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-4 py-2 data-[state=active]:text-blue-600 text-slate-600 font-medium"
							>
								Recent
							</TabsTrigger>
							<TabsTrigger
								value="starred"
								className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-4 py-2 data-[state=active]:text-blue-600 text-slate-600 font-medium"
							>
								<Star className="w-4 h-4 mr-1.5" />
								Starred
							</TabsTrigger>
							<TabsTrigger
								value="all"
								className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-4 py-2 data-[state=active]:text-blue-600 text-slate-600 font-medium"
							>
								All projects
							</TabsTrigger>
							<TabsTrigger
								value="trash"
								className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-4 py-2 data-[state=active]:text-blue-600 text-slate-600 font-medium"
							>
								<Trash2 className="w-4 h-4 mr-1.5" />
								Trash
							</TabsTrigger>
						</TabsList>

						<TabsContent value="recent" className="mt-6">
							{renderProjectsView()}
						</TabsContent>

						<TabsContent value="starred" className="mt-6">
							{/* Starred functionality coming soon */}
							<div className="text-center py-12">
								<Star className="w-12 h-12 mx-auto text-slate-300 mb-3" />
								<h3 className="text-lg font-medium text-slate-900 mb-1">
									Starred projects
								</h3>
								<p className="text-sm text-slate-500">
									Star projects feature coming soon
								</p>
							</div>
						</TabsContent>

						<TabsContent value="all" className="mt-6">
							{renderProjectsView()}
						</TabsContent>

						<TabsContent value="trash" className="mt-6">
							{renderTrashView()}
						</TabsContent>
					</Tabs>
				</div>
			</main>

			{/* Join Project Modal */}
			<Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
				<DialogContent className="sm:max-w-[450px]">
					<DialogHeader>
						<DialogTitle>Join Project</DialogTitle>
						<DialogDescription>
							Enter the project invitation code to join an
							existing project.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-6 py-6">
						<div className="space-y-2">
							<Label
								htmlFor="projectCode"
								className="text-sm font-medium"
							>
								Project Code
							</Label>
							<Input
								id="projectCode"
								value={joinProjectCode}
								onChange={(e) =>
									setJoinProjectCode(e.target.value)
								}
								placeholder="Enter invitation code"
								className="h-11"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							onClick={handleJoinProject}
							disabled={!joinProjectCode.trim()}
							className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
						>
							Join Project
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Template Selection Modal */}
			<Dialog
				open={isTemplateSelectionOpen}
				onOpenChange={setIsTemplateSelectionOpen}
			>
				<DialogContent className="max-w-5xl max-h-[100vh] overflow-hidden bg-white border border-slate-200 p-0">
					{/* Header */}
					<div className="border-b border-slate-200 bg-white px-6 py-4">
						<DialogTitle className="text-xl font-semibold text-slate-900 mb-1">
							Choose your project template
						</DialogTitle>
						<DialogDescription className="text-sm text-slate-600">
							Select the workflow that best fits your team's needs
						</DialogDescription>
					</div>

					{/* Content */}
					<div className="px-6 py-5 overflow-y-auto max-h-[calc(100vh-140px)]">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
							{/* Calendar-Synced Template */}
							<div
								className={`relative border rounded-lg overflow-hidden transition-all duration-200 cursor-pointer bg-white ${
									selectedTemplate === "auto-sync"
										? "border-blue-500 shadow-lg ring-2 ring-blue-100"
										: "border-slate-200 hover:border-blue-300 hover:shadow-md"
								}`}
								onClick={() =>
									handleTemplateSelect("auto-sync")
								}
							>
								{/* Header */}
								<div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-br from-blue-50/50 to-white">
									<div className="flex items-start justify-between">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
												<Calendar className="w-5 h-5 text-blue-600" />
											</div>
											<div>
												<h3 className="text-base font-semibold text-slate-900">
													Automated Workflow Board
												</h3>
												<p className="text-xs text-slate-600 mt-0.5">
													Automated time-based
													workflow
												</p>
											</div>
										</div>
										{selectedTemplate === "auto-sync" && (
											<div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
												<Check className="w-4 h-4 text-white" />
											</div>
										)}
									</div>
								</div>

								{/* Content */}
								<div className="px-5 py-4">
									<p className="text-sm text-slate-700 mb-4 leading-relaxed">
										Perfect for deadline-driven teams. Tasks
										automatically move between stages based
										on their dates.
									</p>

									<div className="space-y-2.5 mb-4">
										<div className="flex items-start gap-2.5">
											<div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 flex-shrink-0">
												<Check className="w-2.5 h-2.5 text-blue-600" />
											</div>
											<div>
												<p className="text-sm font-medium text-slate-900">
													Automatic Task Movement
												</p>
												<p className="text-xs text-slate-600">
													Tasks transition based on
													start and due dates
												</p>
											</div>
										</div>

										<div className="flex items-start gap-2.5">
											<div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 flex-shrink-0">
												<Check className="w-2.5 h-2.5 text-blue-600" />
											</div>
											<div>
												<p className="text-sm font-medium text-slate-900">
													Fixed Workflow Stages
												</p>
												<p className="text-xs text-slate-600">
													Backlog → Upcoming → In
													Progress → Review → Complete
												</p>
											</div>
										</div>

										<div className="flex items-start gap-2.5">
											<div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 flex-shrink-0">
												<Check className="w-2.5 h-2.5 text-blue-600" />
											</div>
											<div>
												<p className="text-sm font-medium text-slate-900">
													Timeline & Calendar Views
												</p>
												<p className="text-xs text-slate-600">
													Visualize project progress
													across time
												</p>
											</div>
										</div>

										<div className="flex items-start gap-2.5">
											<div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 flex-shrink-0">
												<Check className="w-2.5 h-2.5 text-blue-600" />
											</div>
											<div>
												<p className="text-sm font-medium text-slate-900">
													Sprint & Milestone Support
												</p>
												<p className="text-xs text-slate-600">
													Built-in agile methodology
													support
												</p>
											</div>
										</div>

										<div className="flex items-start gap-2.5">
											<div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 flex-shrink-0">
												<Check className="w-2.5 h-2.5 text-blue-600" />
											</div>
											<div>
												<p className="text-sm font-medium text-slate-900">
													Progress Tracking
												</p>
												<p className="text-xs text-slate-600">
													Visual progress bars and
													completion metrics
												</p>
											</div>
										</div>
									</div>

									<div className="pt-4 border-t border-slate-100">
										<p className="text-xs text-slate-500 font-medium mb-2">
											BEST FOR:
										</p>
										<div className="flex flex-wrap gap-1.5">
											<span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-md">
												Product Launches
											</span>
											<span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-md">
												Marketing Campaigns
											</span>
											<span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-md">
												Agile Teams
											</span>
										</div>
									</div>
								</div>
							</div>

							{/* Custom Workflow Template */}
							<div
								className={`relative border rounded-lg overflow-hidden transition-all duration-200 cursor-pointer bg-white ${
									selectedTemplate === "custom"
										? "border-purple-500 shadow-lg ring-2 ring-purple-100"
										: "border-slate-200 hover:border-purple-300 hover:shadow-md"
								}`}
								onClick={() => handleTemplateSelect("custom")}
							>
								{/* Header */}
								<div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-br from-purple-50/50 to-white">
									<div className="flex items-start justify-between">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
												<GripVertical className="w-5 h-5 text-purple-600" />
											</div>
											<div>
												<h3 className="text-base font-semibold text-slate-900">
													Custom Workflow Board
												</h3>
												<p className="text-xs text-slate-600 mt-0.5">
													Flexible drag-and-drop
													workflow
												</p>
											</div>
										</div>
										{selectedTemplate === "custom" && (
											<div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
												<Check className="w-4 h-4 text-white" />
											</div>
										)}
									</div>
								</div>

								{/* Content */}
								<div className="px-5 py-4">
									<p className="text-sm text-slate-700 mb-4 leading-relaxed">
										Ideal for creative teams with unique
										processes. Design your own workflow
										stages and move tasks manually.
									</p>

									<div className="space-y-2.5 mb-4">
										<div className="flex items-start gap-2.5">
											<div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center mt-0.5 flex-shrink-0">
												<Check className="w-2.5 h-2.5 text-purple-600" />
											</div>
											<div>
												<p className="text-sm font-medium text-slate-900">
													Unlimited Custom Columns
												</p>
												<p className="text-xs text-slate-600">
													Create as many workflow
													stages as you need
												</p>
											</div>
										</div>

										<div className="flex items-start gap-2.5">
											<div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center mt-0.5 flex-shrink-0">
												<Check className="w-2.5 h-2.5 text-purple-600" />
											</div>
											<div>
												<p className="text-sm font-medium text-slate-900">
													Drag & Drop Interface
												</p>
												<p className="text-xs text-slate-600">
													Intuitive task movement
													between columns
												</p>
											</div>
										</div>

										<div className="flex items-start gap-2.5">
											<div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center mt-0.5 flex-shrink-0">
												<Check className="w-2.5 h-2.5 text-purple-600" />
											</div>
											<div>
												<p className="text-sm font-medium text-slate-900">
													Complete Control
												</p>
												<p className="text-xs text-slate-600">
													No automatic task movement -
													you decide
												</p>
											</div>
										</div>

										<div className="flex items-start gap-2.5">
											<div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center mt-0.5 flex-shrink-0">
												<Check className="w-2.5 h-2.5 text-purple-600" />
											</div>
											<div>
												<p className="text-sm font-medium text-slate-900">
													Customizable Stages
												</p>
												<p className="text-xs text-slate-600">
													Rename, reorder, add, or
													remove columns
												</p>
											</div>
										</div>
									</div>

									<div className="pt-4 border-t border-slate-100">
										<p className="text-xs text-slate-500 font-medium mb-2">
											BEST FOR:
										</p>
										<div className="flex flex-wrap gap-1.5">
											<span className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-md">
												Design Projects
											</span>
											<span className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-md">
												Content Creation
											</span>
											<span className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-md">
												Creative Teams
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Additional info and action buttons */}
						<div className="mt-4 space-y-3">
							{/* Action Buttons */}
							<div className="flex items-center justify-between pt-2">
								<Button
									variant="outline"
									onClick={() => {
										setIsTemplateSelectionOpen(false);
										setSelectedTemplate(null);
									}}
									className="border-slate-300"
								>
									Cancel
								</Button>
								<Button
									disabled={!selectedTemplate}
									onClick={handleConfirmTemplate}
									className={
										selectedTemplate === "auto-sync"
											? "bg-blue-600 hover:bg-blue-700 text-white"
											: selectedTemplate === "custom"
											? "bg-purple-600 hover:bg-purple-700 text-white"
											: ""
									}
								>
									{selectedTemplate
										? `Continue with ${
												selectedTemplate === "auto-sync"
													? "Automated Workflow"
													: "Custom Workflow"
										  }`
										: "Select a Template"}
								</Button>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* New Project Modal */}
			<Dialog
				open={isNewProjectModalOpen}
				onOpenChange={setIsNewProjectModalOpen}
			>
				<DialogContent className="sm:max-w-[550px]">
					<DialogHeader className="space-y-2">
						<DialogTitle className="flex items-center gap-2 text-slate-900">
							<Plus className="w-5 h-5 text-blue-600" />
							Create New Project
						</DialogTitle>
						<DialogDescription>
							{selectedTemplate === "auto-sync"
								? "📅 Automated Workflow Template - Tasks move automatically based on dates"
								: selectedTemplate === "custom"
								? "🎯 Custom Workflow Template - Create your own columns and workflow"
								: "Set up a new project and start collaborating with your team"}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						{/* Project Name */}
						<div className="space-y-2">
							<Label
								htmlFor="project-name"
								className="text-sm font-medium"
							>
								Project Name *
							</Label>
							<Input
								id="project-name"
								value={newProject.name}
								onChange={(e) =>
									setNewProject({
										...newProject,
										name: e.target.value,
									})
								}
								placeholder="Enter project name"
								className="h-11"
							/>
						</div>

						{/* Description */}
						<div className="space-y-2">
							<Label
								htmlFor="project-description"
								className="text-sm font-medium"
							>
								Description
							</Label>
							<Textarea
								id="project-description"
								value={newProject.description}
								onChange={(e) =>
									setNewProject({
										...newProject,
										description: e.target.value,
									})
								}
								placeholder="Describe your project goals and objectives"
								className="min-h-[80px] resize-none"
							/>
						</div>

						{/* Date Range */}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label
									htmlFor="project-start-date"
									className="text-sm font-medium"
								>
									Start Date
								</Label>
								<Input
									id="project-start-date"
									type="date"
									value={newProject.startDate}
									onChange={(e) =>
										setNewProject({
											...newProject,
											startDate: e.target.value,
										})
									}
									className="h-11"
								/>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="project-end-date"
									className="text-sm font-medium"
								>
									Target End Date
								</Label>
								<Input
									id="project-end-date"
									type="date"
									value={newProject.endDate}
									onChange={(e) =>
										setNewProject({
											...newProject,
											endDate: e.target.value,
										})
									}
									className="h-11"
								/>
							</div>
						</div>

						{/* Visibility */}
						<div className="space-y-2">
							<Label
								htmlFor="project-visibility"
								className="text-sm font-medium"
							>
								Project Visibility
							</Label>
							<select
								id="project-visibility"
								value={newProject.visibility}
								onChange={(e) =>
									setNewProject({
										...newProject,
										visibility: e.target.value,
									})
								}
								className="flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
							>
								<option value="private">
									Private - Only invited members
								</option>
								<option value="team">
									Team - All team members can view
								</option>
								<option value="public">
									Public - Anyone can view
								</option>
							</select>
							<p className="text-xs text-slate-500">
								Control who can view and access this project
							</p>
						</div>
					</div>

					<DialogFooter className="border-t border-slate-100 pt-4">
						<Button
							variant="outline"
							onClick={() => {
								setIsNewProjectModalOpen(false);
								setSelectedTemplate(null);
							}}
							className="border-slate-200 hover:bg-slate-50"
						>
							Cancel
						</Button>
						<Button
							onClick={handleCreateProject}
							disabled={!newProject.name.trim()}
							className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
						>
							Create Project
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default Dashboard;
