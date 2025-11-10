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
import { Trash2, UserPlus, Activity, Crown, User, Mail, Copy, Calendar } from "lucide-react";
import MemberDetailModal from "./MemberDetailModal";
import CalendarSettings from "./CalendarSettings";

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
        <TabsTrigger value="calendar">
          <Calendar className="w-4 h-4 mr-2" />
          Calendar
        </TabsTrigger>
        <TabsTrigger value="activity">Activity Log</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>Basic information about your project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input id="project-name" defaultValue={project.name} />
              </div>
              <div className="space-y-2">
                <Label>Invitation Code</Label>
                <div className="flex gap-2">
                  <Input value={projectData.inviteCode} readOnly />
                  <Button variant="outline" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this code with team members to invite them to the project
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                defaultValue={project.description}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-visibility">Visibility</Label>
              <select
                id="project-visibility"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="private">Private</option>
                <option value="team">Team Only</option>
                <option value="public">Public</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>Irreversible actions for this project</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Project
            </Button>
          </CardContent>
        </Card>
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

      <TabsContent value="calendar" className="space-y-4">
        <CalendarSettings />
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
