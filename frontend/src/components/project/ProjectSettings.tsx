import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Trash2,
	UserPlus,
	UserMinus,
	Activity,
	Crown,
	User,
	Mail,
	Copy,
	Download,
	ChevronDown,
	Loader2,
	AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MemberDetailModal from "./MemberDetailModal";
import api from "@/lib/api";

interface ProjectSettingsProps {
	project: any;
	workflowType?: "auto-sync" | "custom";
	onNavigateToBoard?: () => void;
	onProjectUpdate?: () => void;
}

interface TeamMember {
	id: number;
	name: string;
	avatar?: string;
	email: string;
	role: string;
	joinDate: string;
	description: string;
	assignedTasks: Array<{
		id: number;
		title: string;
		status: string;
		priority: string;
		dueDate: string;
	}>;
}

const ProjectSettings = ({
	project,
	workflowType = "custom",
	onNavigateToBoard,
	onProjectUpdate,
}: ProjectSettingsProps) => {
	const navigate = useNavigate();
	const { user } = useUser();
	const { toast } = useToast();

	// Helper function to get theme class - Tailwind requires complete class names
	const getThemeClass = (element: string) => {
		const isCustom = workflowType === "custom";

		const classes = {
			headerGradient: isCustom
				? "bg-gradient-to-r from-purple-500 to-pink-600"
				: "bg-gradient-to-r from-blue-500 to-indigo-600",
			headerBg: isCustom ? "bg-purple-50/50" : "bg-blue-50/50",
			iconGradient: isCustom
				? "bg-gradient-to-br from-purple-500 via-purple-500 to-pink-600"
				: "bg-gradient-to-br from-blue-500 via-blue-500 to-indigo-600",
			buttonGradient: isCustom
				? "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
				: "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700",
			dialogHeaderGradient: isCustom
				? "bg-gradient-to-r from-purple-500 to-pink-600"
				: "bg-gradient-to-r from-blue-500 to-indigo-600",
			avatarGlow: isCustom
				? "shadow-lg shadow-purple-500/50"
				: "shadow-lg shadow-blue-500/50",
			avatarGradient: isCustom
				? "bg-gradient-to-br from-purple-500 to-pink-600"
				: "bg-gradient-to-br from-blue-500 to-indigo-600",
			nameHover: isCustom
				? "hover:text-purple-600"
				: "hover:text-blue-600",
			roleBorder: isCustom
				? "border-purple-300 focus:border-purple-500 focus:ring-purple-100"
				: "border-blue-300 focus:border-blue-500 focus:ring-blue-100",
			text: isCustom ? "text-purple-600" : "text-blue-600",
			bg: isCustom ? "bg-purple-600" : "bg-blue-600",
			hover: isCustom ? "hover:bg-purple-50" : "hover:bg-blue-50",
			border: isCustom ? "border-purple-300" : "border-blue-300",
			focus: isCustom
				? "focus:border-purple-500"
				: "focus:border-blue-500",
			ring: isCustom ? "focus:ring-purple-100" : "focus:ring-blue-100",
		};

		return classes[element as keyof typeof classes] || "";
	};

	// Form state
	const [projectName, setProjectName] = useState(project?.title || "");
	const [projectDescription, setProjectDescription] = useState(
		project?.description || ""
	);

	// Member management state
	const [members, setMembers] = useState([]);
	const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
	const [newMemberEmail, setNewMemberEmail] = useState("");
	const [newMemberRole, setNewMemberRole] = useState("MEMBER");
	const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
	const [selectedMember, setSelectedMember] = useState<TeamMember | null>(
		null
	);
	const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

	// UI state
	const [isDangerZoneOpen, setIsDangerZoneOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isRemoveMemberDialogOpen, setIsRemoveMemberDialogOpen] =
		useState(false);
	const [memberToRemove, setMemberToRemove] = useState<{
		id: number;
		name: string;
	} | null>(null);

	// Loading states
	const [isSaving, setIsSaving] = useState(false);
	const [isLoadingMembers, setIsLoadingMembers] = useState(false);
	const [isAddingMember, setIsAddingMember] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// Fetch project members on mount
	useEffect(() => {
		if (project?.id && user?.id) {
			fetchMembers();
		}
	}, [project?.id, user?.id]);

	// Update form when project changes
	useEffect(() => {
		setProjectName(project?.title || "");
		setProjectDescription(project?.description || "");
	}, [project]);

	const fetchMembers = async () => {
		try {
			setIsLoadingMembers(true);
			const response = await api.getProjectMembers(project.id);
			console.log("Members response:", response);
			// Ensure response is always an array
			if (Array.isArray(response)) {
				setMembers(response);
				// Find current user's role
				if (user?.id) {
					console.log("Current user from context:", user);
					const currentMember = response.find((m: any) => {
						console.log(
							"Checking member:",
							m,
							"against user ID:",
							user.id
						);
						return m.userId === user.id;
					});
					console.log("Found current member:", currentMember);
					if (currentMember) {
						setCurrentUserRole(currentMember.role);
						console.log(
							"Set current user role to:",
							currentMember.role
						);
					}
				}
			} else {
				setMembers([]);
				console.warn(
					"API returned non-array response for members:",
					response
				);
			}
		} catch (err: any) {
			console.error("Failed to fetch members:", err);
			setMembers([]); // Set empty array on error
		} finally {
			setIsLoadingMembers(false);
		}
	};

	const handleSaveChanges = async () => {
		try {
			setIsSaving(true);

			await api.updateProject(project.id, {
				title: projectName,
				description: projectDescription,
			});

			toast({
				title: "Success",
				description: "Project updated successfully!",
			});

			// Refresh project data in parent component
			if (onProjectUpdate) {
				onProjectUpdate();
			}
		} catch (err: any) {
			console.error("Failed to update project:", err);
			toast({
				title: "Error",
				description: err.message || "Failed to update project",
				variant: "destructive",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handleAddMember = async () => {
		if (!newMemberEmail.trim()) {
			toast({
				title: "Error",
				description: "Please enter an email address",
				variant: "destructive",
			});
			return;
		}

		// Basic email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(newMemberEmail)) {
			toast({
				title: "Error",
				description: "Please enter a valid email address",
				variant: "destructive",
			});
			return;
		}

		// Check if member already exists in the project
		const memberExists = members.some(
			(member: any) =>
				member.user?.email?.toLowerCase() ===
				newMemberEmail.toLowerCase()
		);

		if (memberExists) {
			toast({
				title: "Error",
				description: "This user is already a member of this project",
				variant: "destructive",
			});
			return;
		}

		try {
			setIsAddingMember(true);

			await api.inviteProjectMembers(project.id, [
				{
					email: newMemberEmail,
					role: newMemberRole,
				},
			]);

			// Refresh members list
			await fetchMembers();

			toast({
				title: "Success",
				description: `Invitation sent to ${newMemberEmail}`,
			});
			setIsAddMemberDialogOpen(false);
			setNewMemberEmail("");
			setNewMemberRole("MEMBER");
		} catch (err: any) {
			console.error("Failed to add member:", err);
			toast({
				title: "Error",
				description: err.message || "Failed to invite member",
				variant: "destructive",
			});
		} finally {
			setIsAddingMember(false);
		}
	};

	const handleUpdateMemberRole = async (
		memberId: number,
		newRole: string
	) => {
		try {
			await api.updateMemberRole(project.id, memberId, newRole);

			// Refresh members list
			await fetchMembers();

			toast({
				title: "Success",
				description: "Member role updated successfully!",
			});
		} catch (err: any) {
			console.error("Failed to update member role:", err);
			toast({
				title: "Error",
				description: err.message || "Failed to update member role",
				variant: "destructive",
			});
		}
	};

	const handleRemoveMember = async (memberId: number, memberName: string) => {
		setMemberToRemove({ id: memberId, name: memberName });
		setIsRemoveMemberDialogOpen(true);
	};

	const confirmRemoveMember = async () => {
		if (!memberToRemove) return;

		try {
			await api.removeMember(project.id, memberToRemove.id);

			// Refresh members list
			await fetchMembers();

			toast({
				title: "Member removed",
				description: `${memberToRemove.name} has been removed from the project`,
			});

			setIsRemoveMemberDialogOpen(false);
			setMemberToRemove(null);
		} catch (err: any) {
			console.error("Failed to remove member:", err);
			toast({
				title: "Error",
				description: err.message || "Failed to remove member",
				variant: "destructive",
			});
		}
	};

	const handleDeleteProject = async () => {
		try {
			setIsDeleting(true);

			await api.deleteProject(project.id);

			// Navigate to dashboard after successful deletion
			navigate("/dashboard");
		} catch (err: any) {
			console.error("Failed to delete project:", err);
			toast({
				title: "Error",
				description: err.message || "Failed to delete project",
				variant: "destructive",
			});
			setIsDeleting(false);
			setIsDeleteDialogOpen(false);
		}
	};

	const handleCancelChanges = () => {
		setProjectName(project?.title || "");
		setProjectDescription(project?.description || "");
	};

	// Convert members to detailed format for the modal
	const detailedMembers: TeamMember[] = Array.isArray(members)
		? members.map((member: any) => ({
				id: member.user?.id || member.id,
				name: member.user?.name || member.name || "Unknown User",
				email: member.user?.email || member.email || "",
				role: member.role || "MEMBER",
				joinDate: member.joinedAt || new Date().toISOString(),
				description: "Team member",
				assignedTasks: [],
				avatar: member.user?.avatar,
		  }))
		: [];

	const handleMemberClick = (memberId: number) => {
		const member = detailedMembers.find((m) => m.id === memberId);
		if (member) {
			setSelectedMember(member);
			setIsMemberModalOpen(true);
		}
	};

	const getRoleIcon = (role: string) => {
		const roleUpper = role?.toUpperCase();
		switch (roleUpper) {
			case "OWNER":
				return <Crown className="w-4 h-4 text-yellow-500" />;
			case "ADMIN":
				return <User className="w-4 h-4 text-blue-500" />;
			default:
				return <User className="w-4 h-4 text-gray-500" />;
		}
	};

	const getRoleBadgeColor = (role: string) => {
		const roleUpper = role?.toUpperCase();
		switch (roleUpper) {
			case "OWNER":
				return "bg-yellow-100 text-yellow-800";
			case "ADMIN":
				return "bg-blue-100 text-blue-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getInitials = (name: string) => {
		if (!name) return "?";
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<div className="space-y-6">
			<Tabs defaultValue="general" className="w-full">
				<TabsList>
					<TabsTrigger value="general">General</TabsTrigger>
					<TabsTrigger value="team">Team</TabsTrigger>
				</TabsList>

				<TabsContent value="general" className="space-y-6">
					{/* Project Information Card */}
					<Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
						<div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
						<CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/30 pb-6">
							<CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
								Project Information
							</CardTitle>
							<CardDescription className="text-slate-600">
								Manage your project details and settings
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-8 pt-8">
							{/* Project Name */}
							<div className="space-y-3">
								<Label
									htmlFor="project-name"
									className="text-sm font-semibold text-slate-700 flex items-center gap-2"
								>
									<div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
										<Activity className="w-4 h-4 text-blue-600" />
									</div>
									Project Name
								</Label>
								<Input
									id="project-name"
									value={projectName}
									onChange={(e) =>
										setProjectName(e.target.value)
									}
									className="h-14 text-base border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
									placeholder="Enter project name"
								/>
							</div>

							{/* Description */}
							<div className="space-y-3">
								<Label
									htmlFor="project-description"
									className="text-sm font-semibold text-slate-700 flex items-center gap-2"
								>
									<div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
										<Mail className="w-4 h-4 text-indigo-600" />
									</div>
									Description
								</Label>
								<Textarea
									id="project-description"
									value={projectDescription}
									onChange={(e) =>
										setProjectDescription(e.target.value)
									}
									rows={5}
									className="text-base border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 resize-none"
									placeholder="Describe your project..."
								/>
							</div>

							{/* Action Buttons */}
							<div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t-2 border-slate-100">
								<Button
									variant="outline"
									onClick={handleCancelChanges}
									disabled={isSaving}
									className="h-12 px-6 border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 font-semibold"
								>
									Cancel
								</Button>
								<Button
									onClick={handleSaveChanges}
									disabled={isSaving || !projectName.trim()}
									className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
								>
									{isSaving ? (
										<>
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											Saving...
										</>
									) : (
										"Save Changes"
									)}
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Danger Zone Card */}
					<Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
						<CardHeader
							className="cursor-pointer bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 transition-all duration-300 group border-b-2 border-red-200"
							onClick={() =>
								setIsDangerZoneOpen(!isDangerZoneOpen)
							}
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
										<Trash2 className="w-5 h-5 text-white" />
									</div>
									<div>
										<CardTitle className="text-xl font-bold text-red-700 group-hover:text-red-800 transition-colors">
											Danger Zone
										</CardTitle>
									</div>
								</div>
								<ChevronDown
									className={`w-6 h-6 text-red-600 transition-transform duration-300 ${
										isDangerZoneOpen ? "rotate-180" : ""
									}`}
								/>
							</div>
						</CardHeader>
						{isDangerZoneOpen && (
							<CardContent className="pt-6 pb-6 bg-gradient-to-br from-red-50/50 to-rose-50/50">
								<div className="space-y-4">
									<div className="p-4 bg-white rounded-xl border-2 border-red-200">
										<h4 className="font-semibold text-slate-900 mb-2">
											Delete this project
										</h4>
										<p className="text-sm text-slate-600 mb-4">
											Once you delete a project, there is
											no going back. Please be certain.
										</p>
										<Dialog
											open={isDeleteDialogOpen}
											onOpenChange={setIsDeleteDialogOpen}
										>
											<DialogTrigger asChild>
												<Button
													variant="destructive"
													className="w-full sm:w-auto h-12 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all duration-300"
												>
													<Trash2 className="w-4 h-4 mr-2" />
													Delete Project
												</Button>
											</DialogTrigger>
											<DialogContent className="sm:max-w-[450px]">
												<DialogHeader>
													<DialogTitle>
														Are you absolutely sure?
													</DialogTitle>
													<DialogDescription>
														This action cannot be
														undone. This will
														permanently delete the
														project
														<span className="font-semibold text-slate-900">
															{" "}
															"{project?.title}"
														</span>{" "}
														and remove all
														associated data
														including tasks,
														comments, and files.
													</DialogDescription>
												</DialogHeader>
												<DialogFooter className="gap-2 sm:gap-0">
													<Button
														variant="outline"
														onClick={() =>
															setIsDeleteDialogOpen(
																false
															)
														}
														disabled={isDeleting}
													>
														Cancel
													</Button>
													<Button
														variant="destructive"
														onClick={
															handleDeleteProject
														}
														disabled={isDeleting}
													>
														{isDeleting ? (
															<>
																<Loader2 className="w-4 h-4 mr-2 animate-spin" />
																Deleting...
															</>
														) : (
															<>
																<Trash2 className="w-4 h-4 mr-2" />
																Delete Project
															</>
														)}
													</Button>
												</DialogFooter>
											</DialogContent>
										</Dialog>
									</div>
								</div>
							</CardContent>
						)}
					</Card>
				</TabsContent>

				<TabsContent value="team" className="space-y-6">
					<Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
						<div
							className={getThemeClass("headerGradient") + " h-2"}
						></div>
						<CardHeader
							className={`border-b border-slate-100 ${getThemeClass(
								"headerBg"
							)}`}
						>
							<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
								<div>
									<CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent flex items-center gap-3">
										<div
											className={`w-10 h-10 rounded-lg flex items-center justify-center ${getThemeClass(
												"iconGradient"
											)}`}
										>
											<User className="w-5 h-5 text-white" />
										</div>
										Team Members
									</CardTitle>
									<CardDescription className="text-slate-600 mt-2">
										Manage who has access to this project
									</CardDescription>
								</div>
								<Dialog
									open={isAddMemberDialogOpen}
									onOpenChange={setIsAddMemberDialogOpen}
								>
									<DialogTrigger asChild>
										<Button
											className={`gap-2 text-white shadow-lg hover:shadow-xl transition-all duration-300 ${getThemeClass(
												"buttonGradient"
											)}`}
										>
											<UserPlus className="w-4 h-4" />
											Add Member
										</Button>
									</DialogTrigger>
									<DialogContent className="sm:max-w-[500px] border-0 shadow-2xl">
										<div
											className={`h-2 -mt-6 -mx-6 mb-4 ${getThemeClass(
												"dialogHeaderGradient"
											)}`}
										></div>
										<DialogHeader>
											<DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
												Add Team Member
											</DialogTitle>
											<DialogDescription className="text-slate-600">
												Invite a new member to join this
												project
											</DialogDescription>
										</DialogHeader>
										<div className="space-y-6 py-4">
											<div className="space-y-3">
												<Label
													htmlFor="memberEmail"
													className="text-sm font-semibold text-slate-700 flex items-center gap-2"
												>
													<div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
														<Mail className="w-4 h-4 text-purple-600" />
													</div>
													Email Address
												</Label>
												<Input
													id="memberEmail"
													type="email"
													value={newMemberEmail}
													onChange={(e) =>
														setNewMemberEmail(
															e.target.value
														)
													}
													placeholder="member@example.com"
													className="h-12 text-base border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
												/>
											</div>
											<div className="space-y-3">
												<Label
													htmlFor="memberRole"
													className="text-sm font-semibold text-slate-700 flex items-center gap-2"
												>
													<div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
														<Crown className="w-4 h-4 text-pink-600" />
													</div>
													Role
												</Label>
												<Select
													value={newMemberRole}
													onValueChange={
														setNewMemberRole
													}
												>
													<SelectTrigger className="h-12 text-base border-2 border-slate-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-100">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="MEMBER">
															Member
														</SelectItem>
														<SelectItem value="ADMIN">
															Admin
														</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
										<DialogFooter>
											<Button
												onClick={handleAddMember}
												disabled={
													!newMemberEmail.trim() ||
													isAddingMember
												}
												className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
											>
												{isAddingMember ? (
													<>
														<Loader2 className="w-4 h-4 mr-2 animate-spin" />
														Sending Invite...
													</>
												) : (
													<>
														<UserPlus className="w-4 h-4 mr-2" />
														Add Member
													</>
												)}
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</div>
						</CardHeader>
						<CardContent className="pt-6">
							{isLoadingMembers ? (
								<div className="text-center py-12">
									<Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-600" />
									<p className="text-sm text-slate-500">
										Loading team members...
									</p>
								</div>
							) : members.length === 0 ? (
								<div className="text-center py-12">
									<div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
										<User className="w-8 h-8 text-purple-600" />
									</div>
									<h3 className="text-lg font-semibold text-slate-900 mb-2">
										No team members yet
									</h3>
									<p className="text-sm text-slate-500 mb-4">
										Start building your team by adding
										members
									</p>
								</div>
							) : (
								<div className="space-y-3">
									{detailedMembers.map((member) => (
										<div
											key={member.id}
											className={`group p-4 rounded-xl border-2 border-slate-200 transition-all duration-300 hover:shadow-lg ${
												workflowType === "custom"
													? "bg-gradient-to-r from-slate-50 to-purple-50/30 hover:from-slate-100 hover:to-purple-100/40 hover:border-purple-300"
													: "bg-gradient-to-r from-slate-50 to-blue-50/30 hover:from-slate-100 hover:to-blue-100/40 hover:border-blue-300"
											}`}
										>
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-4 flex-1">
													<div
														className="relative cursor-pointer"
														onClick={() =>
															handleMemberClick(
																member.id
															)
														}
													>
														<div
															className={`absolute -inset-1 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-300 ${getThemeClass(
																"avatarGradient"
															)}`}
														></div>
														<div
															className={`relative w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${getThemeClass(
																"avatarGradient"
															)}`}
														>
															{getInitials(
																member.name
															)}
														</div>
													</div>
													<div className="flex-1">
														<div className="flex items-center gap-2 mb-1">
															<p
																className={`font-semibold text-slate-900 transition-colors cursor-pointer ${getThemeClass(
																	"nameHover"
																)}`}
																onClick={() =>
																	handleMemberClick(
																		member.id
																	)
																}
															>
																{member.name}
															</p>
														</div>
														<p className="text-sm text-slate-600">
															{member.email}
														</p>
													</div>
												</div>
												<div
													className="flex items-center gap-3"
													onClick={(e) =>
														e.stopPropagation()
													}
												>
													{getRoleIcon(member.role)}
													<Select
														value={member.role}
														onValueChange={(
															newRole
														) =>
															handleUpdateMemberRole(
																member.id,
																newRole
															)
														}
													>
														<SelectTrigger
															className={`w-32 h-9 text-sm transition-colors ${getThemeClass(
																"roleBorder"
															)}`}
														>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="OWNER">
																Owner
															</SelectItem>
															<SelectItem value="ADMIN">
																Admin
															</SelectItem>
															<SelectItem value="MEMBER">
																Member
															</SelectItem>
														</SelectContent>
													</Select>
													{/* Debug: Current user role is {currentUserRole} */}
													{currentUserRole ===
														"OWNER" && (
														<Button
															variant="ghost"
															size="sm"
															onClick={() =>
																handleRemoveMember(
																	member.id,
																	member.name
																)
															}
															className="h-9 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
															title="Remove member"
														>
															<UserMinus className="w-4 h-4" />
														</Button>
													)}
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Member Detail Modal */}
					<MemberDetailModal
						member={selectedMember}
						isOpen={isMemberModalOpen}
						onOpenChange={setIsMemberModalOpen}
						onNavigateToTask={(taskId) => {
							console.log("Navigating to task:", taskId);
							if (onNavigateToBoard) {
								onNavigateToBoard();
							}
						}}
					/>
				</TabsContent>
			</Tabs>

			{/* Remove Member Confirmation Dialog */}
			<AlertDialog
				open={isRemoveMemberDialogOpen}
				onOpenChange={setIsRemoveMemberDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove team member</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to remove{" "}
							<strong>{memberToRemove?.name}</strong> from this
							project? This action cannot be undone and they will
							lose access to all project resources.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmRemoveMember}
							className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
						>
							Remove
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default ProjectSettings;
