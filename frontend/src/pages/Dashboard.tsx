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
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

const Dashboard = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { user, isAuthenticated } = useUser();
	const [joinProjectCode, setJoinProjectCode] = useState("");
	const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [activeTab, setActiveTab] = useState("recent");
	const [projects, setProjects] = useState<Project[]>([]);
	const [isLoadingProjects, setIsLoadingProjects] = useState(true);
	const [isCreatingProject, setIsCreatingProject] = useState(false);

	// Fetch projects from database
	useEffect(() => {
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

		fetchProjects();
	}, []);

	// Handle project creation from template selection
	useEffect(() => {
		const handleProjectCreation = async () => {
			const { createProject, selectedTemplate, projectData } = location.state || {};
			
			if (createProject && selectedTemplate && projectData) {
				// Prevent duplicate execution in React Strict Mode
				if (isCreatingProject) return;
				
				setIsCreatingProject(true);
				
				if (!isAuthenticated) {
					console.error("User not authenticated, redirecting to login");
					navigate("/auth");
					setIsCreatingProject(false);
					return;
				}
				
				try {
					// Clear the location state immediately to prevent duplicate creation
					window.history.replaceState({}, document.title);
					
					// Map selectedTemplate to workflowType
					const workflowType = selectedTemplate === "auto-sync" ? "AUTOMATED" : "CUSTOM";
					
					const response: any = await api.createProject({
						title: projectData.name,
						description: projectData.description || undefined,
						workflowType: workflowType,
						startDate: projectData.startDate || undefined,
						endDate: projectData.endDate || undefined,
					});

					// Invite team members if any (excluding current user)
					if (projectData.teamMembers && Array.isArray(projectData.teamMembers)) {
						const membersToInvite = projectData.teamMembers.filter(
							(member: any) => member.id !== "current-user" && member.email
						);
						
						if (membersToInvite.length > 0) {
							try {
								await api.inviteProjectMembers(
									response.id,
									membersToInvite.map((member: any) => ({
										email: member.email,
										role: member.role
									}))
								);
							} catch (inviteError) {
								console.error('Failed to send some invitations:', inviteError);
								// Continue anyway, project was created successfully
							}
						}
					}

					// Navigate directly to the new project board with project data to avoid refetch
					if (response.id) {
						navigate(`/project/${response.id}`, { 
							replace: true,
							state: { 
								projectData: response,
								skipLoading: true 
							}
						});
						return;
					}
				} catch (error) {
					console.error("Failed to create project:", error);
					alert(`Failed to create project: ${error.message || 'Unknown error'}`);
					setIsCreatingProject(false);
				}
			}
		};

		handleProjectCreation();
	}, [location.state, navigate, isAuthenticated, isCreatingProject]);

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
						onClick={() => navigate("/project-setup")}
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
					{filteredProjects.map((project) => {
						const isCustomWorkflow = project.workflowType === "CUSTOM";
						const themeColor = isCustomWorkflow ? "#A855F7" : "#3B82F6";
						const themeName = isCustomWorkflow ? "purple" : "blue";
						
						return (
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
												backgroundColor: themeColor,
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
									<CardTitle className={`text-base font-semibold text-slate-900 group-hover:text-${themeName}-600 transition-colors`}>
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
						);
					})}
				</div>
			);
		}

		// List view
		return (
			<div className="space-y-2">
				{filteredProjects.map((project) => {
					const isCustomWorkflow = project.workflowType === "CUSTOM";
					const themeColor = isCustomWorkflow ? "#A855F7" : "#3B82F6";
					const themeName = isCustomWorkflow ? "purple" : "blue";
					
					return (
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
												backgroundColor: themeColor,
											}}
										>
											<Layers className="w-5 h-5 text-white" />
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												<h3 className={`font-semibold text-slate-900 group-hover:text-${themeName}-600 transition-colors truncate`}>
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
					);
				})}
			</div>
		);
	};

	// Show loading screen when creating project
	if (isCreatingProject) {
		return (
			<div className="min-h-screen bg-slate-50">
				<Navbar />
				<div className="h-[calc(100vh-64px)] flex items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
						<p className="text-slate-600 font-medium">Creating your project...</p>
					</div>
				</div>
			</div>
		);
	}

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
								onClick={() => navigate("/project-setup")}
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
		</div>
	);
};

export default Dashboard;
