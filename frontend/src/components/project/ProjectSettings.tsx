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
import { Trash2, UserPlus, Activity, Crown, User, Mail, Copy, Download, ChevronDown } from "lucide-react";
import MemberDetailModal from "./MemberDetailModal";

interface ProjectSettingsProps {
  project: any;
  onNavigateToBoard?: () => void;
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

const ProjectSettings = ({ project, onNavigateToBoard }: ProjectSettingsProps) => {
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("member");
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("WR2024-ABC123");
  const [isDangerZoneOpen, setIsDangerZoneOpen] = useState(false);
  const [visibility, setVisibility] = useState("private");
  const [isVisibilityOpen, setIsVisibilityOpen] = useState(false);
  const [members, setMembers] = useState([]);

  // Convert members to detailed format for the modal
  const detailedMembers: TeamMember[] = members.map((member: any) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    joinDate: new Date().toISOString(),
    description: "Team member",
    assignedTasks: []
  }));

  // Use members state
  const projectData = {
    ...project,
    members: members
  };

  const generateInviteCode = () => {
    // Generate a new random invite code
    const prefix = "WR2024";
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newCode = `${prefix}-${randomPart}`;
    setInviteCode(newCode);
    
    // Copy to clipboard
    navigator.clipboard.writeText(newCode);
    
    // TODO: Send new invite code to backend
    console.log("Generated new invite code:", newCode);
  };

  const handleAddMember = () => {
    if (!newMemberEmail.trim()) return;
    
    // Create new member
    const newMember = {
      id: members.length + 1,
      name: newMemberEmail.split('@')[0], // Use email username as name
      email: newMemberEmail,
      role: newMemberRole
    };
    
    // Add to members list
    setMembers([...members, newMember]);
    
    // Close dialog and reset form
    setIsAddMemberDialogOpen(false);
    setNewMemberEmail("");
    setNewMemberRole("member");
    
    // TODO: Send to backend
    console.log("Added member:", newMember);
  };

  const handleRemoveMember = (memberId: number) => {
    // Remove member from list
    setMembers(members.filter(m => m.id !== memberId));
    
    // TODO: Send to backend
    console.log("Removed member:", memberId);
  };

  const handleMemberClick = (memberId: number) => {
    const member = detailedMembers.find(m => m.id === memberId);
    if (member) {
      setSelectedMember(member);
      setIsMemberModalOpen(true);
    }
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download logic with backend
    console.log("Downloading project as PDF");
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
              <Label htmlFor="project-name" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
                Project Name
              </Label>
              <Input 
                id="project-name" 
                defaultValue={project.name}
                className="h-14 text-base border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                placeholder="Enter project name"
              />
            </div>

            {/* Description */}
            <div className="space-y-3">
              <Label htmlFor="project-description" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-indigo-600" />
                </div>
                Description
              </Label>
              <Textarea
                id="project-description"
                defaultValue={project.description}
                rows={5}
                className="text-base border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 resize-none"
                placeholder="Describe your project..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t-2 border-slate-100">
              <Button 
                variant="outline"
                className="h-12 px-6 border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 font-semibold"
              >
                Cancel
              </Button>
              <Button className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone Card */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
          <CardHeader 
            className="cursor-pointer bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 transition-all duration-300 group border-b-2 border-red-200"
            onClick={() => setIsDangerZoneOpen(!isDangerZoneOpen)}
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
                className={`w-6 h-6 text-red-600 transition-transform duration-300 ${isDangerZoneOpen ? 'rotate-180' : ''}`}
              />
            </div>
          </CardHeader>
          {isDangerZoneOpen && (
            <CardContent className="pt-6 pb-6 bg-gradient-to-br from-red-50/50 to-rose-50/50">
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-xl border-2 border-red-200">
                  <h4 className="font-semibold text-slate-900 mb-2">Delete this project</h4>
                  <p className="text-sm text-slate-600 mb-4">
                    Once you delete a project, there is no going back. Please be certain.
                  </p>
                  <Button 
                    variant="destructive" 
                    className="w-full sm:w-auto h-12 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Project
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </TabsContent>

      <TabsContent value="team" className="space-y-6">
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500"></div>
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-purple-50/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  Team Members
                </CardTitle>
                <CardDescription className="text-slate-600 mt-2">
                  Manage who has access to this project
                </CardDescription>
              </div>
              <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <UserPlus className="w-4 h-4" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl">
                  <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 -mt-6 -mx-6 mb-4"></div>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      Add Team Member
                    </DialogTitle>
                    <DialogDescription className="text-slate-600">
                      Invite a new member to join this project
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-3">
                      <Label htmlFor="memberEmail" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                          <Mail className="w-4 h-4 text-purple-600" />
                        </div>
                        Email Address
                      </Label>
                      <Input
                        id="memberEmail"
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="member@example.com"
                        className="h-12 text-base border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="memberRole" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                          <Crown className="w-4 h-4 text-pink-600" />
                        </div>
                        Role
                      </Label>
                      <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                        <SelectTrigger className="h-12 text-base border-2 border-slate-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-100">
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
                      className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Member
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {projectData.members.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No team members yet</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Start building your team by adding members
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {projectData.members.map((member) => (
                  <div 
                    key={member.id}
                    className="group p-4 rounded-xl bg-gradient-to-r from-slate-50 to-purple-50/30 hover:from-slate-100 hover:to-purple-100/40 border-2 border-slate-200 hover:border-purple-300 cursor-pointer transition-all duration-300 hover:shadow-lg"
                    onClick={() => handleMemberClick(member.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-300"></div>
                          <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">
                              {member.name}
                            </p>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(member.role)}`}>
                              {member.role}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">{member.email}</p>
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
                            className="text-red-600 hover:text-red-700 hover:bg-red-100 transition-all duration-300"
                          >
                            <Trash2 className="w-4 h-4" />
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
  );
};

export default ProjectSettings;
