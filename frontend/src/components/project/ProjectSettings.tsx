import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus, Activity, Crown, User, Mail, Copy, Lock, Users, Palette, Calendar, Shield, ChevronDown, RefreshCw, Check, Save } from "lucide-react";
import MemberDetailModal from "./MemberDetailModal";

interface ProjectSettingsProps {
  project: any;
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

const ProjectSettings = ({ project }: ProjectSettingsProps) => {
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("member");
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isVisibilityExpanded, setIsVisibilityExpanded] = useState(false);
  const [selectedVisibility, setSelectedVisibility] = useState("private");
  const [inviteCode, setInviteCode] = useState("WR2024-ABC123");
  const [isCopied, setIsCopied] = useState(false);
  const [isDangerZoneExpanded, setIsDangerZoneExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPrivacyExpanded, setIsPrivacyExpanded] = useState(false);

  // Generate a new invitation code
  const generateInviteCode = () => {
    const prefix = "WR2024";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newCode = `${prefix}-${code}`;
    setInviteCode(newCode);
    // TODO: Send new code to backend to save
    console.log("Generated new invite code:", newCode);
  };

  // Copy invite code to clipboard
  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Mock detailed member data - will be replaced with real data from backend
  const detailedMembers: TeamMember[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "owner",
      joinDate: "2024-01-05",
      description: "Senior developer with expertise in React and Node.js. Passionate about creating scalable applications and mentoring junior developers.",
      assignedTasks: [
        { id: 1, title: "Design landing page mockup", status: "complete", priority: "high", dueDate: "2024-01-20" },
        { id: 4, title: "Database optimization", status: "in-progress", priority: "medium", dueDate: "2024-01-25" },
        { id: 7, title: "API documentation update", status: "upcoming", priority: "low", dueDate: "2024-01-30" },
      ]
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "admin",
      joinDate: "2023-12-10",
      description: "Creative designer focused on user-centered design and accessibility. Specializes in creating intuitive and beautiful interfaces.",
      assignedTasks: [
        { id: 1, title: "Design landing page mockup", status: "complete", priority: "high", dueDate: "2024-01-20" },
        { id: 2, title: "Implement authentication", status: "in-progress", priority: "high", dueDate: "2024-01-18" },
        { id: 5, title: "User testing preparation", status: "review", priority: "low", dueDate: "2024-01-28" },
      ]
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "member",
      joinDate: "2024-01-15",
      description: "Backend specialist with strong database and API design skills. Experienced in microservices architecture and cloud infrastructure.",
      assignedTasks: [
        { id: 2, title: "Implement authentication", status: "in-progress", priority: "high", dueDate: "2024-01-18" },
        { id: 3, title: "Write API documentation", status: "upcoming", priority: "medium", dueDate: "2024-01-25" },
        { id: 8, title: "Performance testing", status: "review", priority: "medium", dueDate: "2024-01-24" },
      ]
    },
    {
      id: 4,
      name: "Sarah Wilson",
      email: "sarah@example.com",
      role: "member",
      joinDate: "2023-11-20",
      description: "Experienced project manager ensuring smooth delivery and team collaboration. Skilled in agile methodologies and stakeholder management.",
      assignedTasks: [
        { id: 4, title: "Database migration", status: "review", priority: "high", dueDate: "2024-01-17" },
        { id: 6, title: "Campaign analytics setup", status: "in-progress", priority: "high", dueDate: "2024-01-19" },
      ]
    }
  ];

  // Mock data - will be replaced with real data from backend
  const projectData = {
    ...project,
    inviteCode: "WR2024-ABC123",
    members: [
      { id: 1, name: "John Doe", email: "john@example.com", role: "owner" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", role: "admin" },
      { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "member" },
      { id: 4, name: "Sarah Wilson", email: "sarah@example.com", role: "member" },
    ]
  };

  const handleAddMember = () => {
    // TODO: Implement add member logic with backend
    console.log("Adding member:", { email: newMemberEmail, role: newMemberRole });
    setIsAddMemberDialogOpen(false);
    setNewMemberEmail("");
    setNewMemberRole("member");
    // For now, just show a success message
  };

  const handleRemoveMember = (memberId: number) => {
    // TODO: Implement remove member logic with backend
    console.log("Removing member:", memberId);
  };

  const handleMemberClick = (memberId: number) => {
    const member = detailedMembers.find(m => m.id === memberId);
    if (member) {
      setSelectedMember(member);
      setIsMemberModalOpen(true);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "admin":
        return <User className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-yellow-100 text-yellow-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
        <TabsTrigger value="activity">Activity Log</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-6">
        {/* Project Identity Section */}
        <Card className="border-2 hover:border-primary/20 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Project Identity</CardTitle>
                <CardDescription>Define your project's core information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="project-name" className="text-sm font-semibold">
                  Project Name
                </Label>
                <Input 
                  id="project-name" 
                  defaultValue={project.name}
                  className="focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Invitation Code
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input 
                      value={inviteCode} 
                      readOnly 
                      className="pr-10 font-mono text-sm bg-muted/50"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="hover:bg-primary/5"
                    onClick={copyInviteCode}
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="hover:bg-accent/5"
                    onClick={generateInviteCode}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project-description" className="text-sm font-semibold">
                Description
              </Label>
              <Textarea
                id="project-description"
                defaultValue={project.description}
                rows={4}
                className="focus:border-primary transition-all resize-none"
                placeholder="Describe your project's goals and objectives..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Access Section */}
        <Card className="border-2 hover:border-primary/20 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 border-b-0">
            <button
              type="button"
              onClick={() => setIsPrivacyExpanded(!isPrivacyExpanded)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <CardTitle>Privacy & Access</CardTitle>
                  <CardDescription>Control who can view and access this project</CardDescription>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-blue-600 transition-transform duration-200 ${isPrivacyExpanded ? 'rotate-180' : ''}`} />
            </button>
          </CardHeader>
          
          {isPrivacyExpanded && (
            <CardContent className="pt-6 animate-in slide-in-from-top-2 duration-200">
              <div className="space-y-4">
              {/* Visibility Selector Button */}
              <button
                type="button"
                onClick={() => setIsVisibilityExpanded(!isVisibilityExpanded)}
                className="w-full flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-blue-600 group-hover:text-primary transition-colors" />
                  <div className="text-left">
                    <span className="font-semibold text-sm">Visibility Settings</span>
                    <p className="text-xs text-muted-foreground">
                      {selectedVisibility === "private" ? "Private - Only you can access" : "Team Only - Accessible to team members"}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isVisibilityExpanded ? 'rotate-180' : ''}`} />
              </button>

              {/* Expandable Options */}
              {isVisibilityExpanded && (
                <div className="grid gap-3 animate-in slide-in-from-top-2 duration-200">
                  {/* Private Option */}
                  <label 
                    className={`relative flex items-start gap-4 p-4 rounded-lg border cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group ${
                      selectedVisibility === "private" ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => {
                      setSelectedVisibility("private");
                      setIsVisibilityExpanded(false);
                    }}
                  >
                    <input 
                      type="radio" 
                      name="visibility" 
                      value="private" 
                      checked={selectedVisibility === "private"}
                      onChange={() => setSelectedVisibility("private")}
                      className="mt-1 w-4 h-4 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Lock className="w-4 h-4 text-gray-700 group-hover:text-primary transition-colors" />
                        <span className="font-semibold text-sm">Private</span>
                        <Badge variant="secondary" className="text-xs">Recommended</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Only you can access this project. Perfect for personal work and confidential projects.
                      </p>
                    </div>
                  </label>

                  {/* Team Only Option */}
                  <label 
                    className={`relative flex items-start gap-4 p-4 rounded-lg border cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group ${
                      selectedVisibility === "team" ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => {
                      setSelectedVisibility("team");
                      setIsVisibilityExpanded(false);
                    }}
                  >
                    <input 
                      type="radio" 
                      name="visibility" 
                      value="team"
                      checked={selectedVisibility === "team"}
                      onChange={() => setSelectedVisibility("team")}
                      className="mt-1 w-4 h-4 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-blue-600 group-hover:text-primary transition-colors" />
                        <span className="font-semibold text-sm">Team Only</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Accessible to invited team members only. Ideal for collaborative team projects.
                      </p>
                    </div>
                  </label>
                </div>
              )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Danger Zone */}
        <Card className="border-2 border-red-200 hover:border-red-300 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
            <button
              type="button"
              onClick={() => setIsDangerZoneExpanded(!isDangerZoneExpanded)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-left">
                  <CardTitle className="text-red-900">Danger Zone</CardTitle>
                  <CardDescription className="text-red-700">Irreversible actions - proceed with caution</CardDescription>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-red-600 transition-transform duration-200 ${isDangerZoneExpanded ? 'rotate-180' : ''}`} />
            </button>
          </CardHeader>
          
          {isDangerZoneExpanded && (
            <CardContent className="pt-6 animate-in slide-in-from-top-2 duration-200">
              <div className="space-y-6">
                {/* Save/Cancel Actions */}
                <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-200">
                  <div className="flex items-start gap-3 mb-4">
                    <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-blue-900">Save or discard changes</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Save your project settings or cancel to discard changes.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        // TODO: Implement cancel logic
                        console.log("Canceling changes...");
                        setIsDangerZoneExpanded(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                      onClick={() => {
                        // TODO: Implement save logic
                        console.log("Saving changes...");
                        alert("Changes saved successfully!");
                        setIsDangerZoneExpanded(false);
                      }}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>

                {/* Separator */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-red-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-red-600 font-semibold">Danger Zone</span>
                  </div>
                </div>

                {/* Delete Project */}
                <div className="p-4 rounded-lg bg-red-50/50 border border-red-200">
                  <div className="flex items-start gap-3 mb-4">
                    <Trash2 className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-red-900">Delete this project</p>
                      <p className="text-xs text-red-700 mt-1">
                        Once deleted, all data will be permanently removed and cannot be recovered.
                      </p>
                    </div>
                  </div>
                  
                  {!showDeleteConfirm ? (
                    <Button 
                      onClick={() => setShowDeleteConfirm(true)}
                      variant="outline" 
                      className="w-full border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      I want to delete this project
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                        <p className="text-sm font-semibold text-red-900 mb-1">⚠️ Are you absolutely sure?</p>
                        <p className="text-xs text-red-700">
                          This action cannot be undone. This will permanently delete the project and all associated data.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          variant="destructive" 
                          className="flex-1 shadow-lg shadow-red-500/20"
                          onClick={() => {
                            // TODO: Implement delete logic
                            console.log("Deleting project...");
                            alert("Project deletion would happen here");
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Yes, Delete Project
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setShowDeleteConfirm(false)}
                        >
                          Cancel Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Save All Changes Button */}
        <div className="flex justify-center pt-6">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-xl shadow-primary/30 px-12 h-14 text-lg font-semibold"
            onClick={() => {
              // TODO: Implement save all changes logic
              console.log("Saving all changes...");
              alert("All changes saved successfully!");
            }}
          >
            <Save className="w-5 h-5 mr-2" />
            Save All Changes
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="team" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage who has access to this project</CardDescription>
              </div>
              <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                      Invite a new member to join this project.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="memberEmail" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="memberEmail"
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="member@example.com"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="memberRole" className="text-right">
                        Role
                      </Label>
                      <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleAddMember}
                      disabled={!newMemberEmail.trim()}
                    >
                      Add Member
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectData.members.map((member, index) => (
                <div key={member.id}>
                  <div 
                    className="flex items-center justify-between py-3 cursor-pointer hover:bg-accent/5 rounded-lg px-2 -mx-2 transition-all group"
                    onClick={() => handleMemberClick(member.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold group-hover:ring-2 group-hover:ring-primary/30 transition-all">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium group-hover:text-primary transition-colors">{member.name}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                            {member.role}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {member.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(member.role)}
                      {member.role !== "owner" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveMember(member.id);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {index < projectData.members.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Member Detail Modal */}
        <MemberDetailModal
          member={selectedMember}
          isOpen={isMemberModalOpen}
          onOpenChange={setIsMemberModalOpen}
        />
      </TabsContent>

      <TabsContent value="activity" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>Recent project activity and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  user: "John Doe",
                  action: "completed task",
                  target: "Design landing page mockup",
                  time: "2 hours ago",
                  type: "success",
                },
                {
                  user: "Jane Smith",
                  action: "updated task",
                  target: "Implement authentication",
                  time: "5 hours ago",
                  type: "primary",
                },
                {
                  user: "Mike Johnson",
                  action: "added comment on",
                  target: "Write API documentation",
                  time: "1 day ago",
                  type: "accent",
                },
                {
                  user: "Sarah Wilson",
                  action: "created task",
                  target: "Database migration",
                  time: "2 days ago",
                  type: "primary",
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-4 border-b border-border/50 last:border-0">
                  <Activity className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{" "}
                      {activity.action}{" "}
                      <span className="font-medium">"{activity.target}"</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ProjectSettings;
