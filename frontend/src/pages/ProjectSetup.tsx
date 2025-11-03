import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Users, 
  Plus, 
  X, 
  Crown, 
  Shield, 
  User, 
  Eye, 
  ArrowRight,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "PROJECT_MANAGER" | "MEMBER" | "VIEWER";
  avatar?: string;
  isInvited?: boolean;
}

const ProjectSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "current-user",
      name: "You",
      email: "your.email@example.com",
      role: "OWNER",
      avatar: "",
    }
  ]);

  // Load existing project data if coming back from template selection
  useEffect(() => {
    const existingProjectData = location.state?.projectData;
    if (existingProjectData) {
      setProjectName(existingProjectData.name || "");
      setProjectDescription(existingProjectData.description || "");
      if (existingProjectData.teamMembers) {
        setTeamMembers(existingProjectData.teamMembers);
      }
    }
  }, [location.state]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"PROJECT_MANAGER" | "MEMBER" | "VIEWER">("MEMBER");

  const roleConfig = {
    OWNER: {
      label: "Admin / Owner",
      icon: Crown,
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      description: "Full access to all projects, users, billing, and workspace settings",
      permissions: [
        "Full access to all projects and tasks",
        "Create, edit, delete users",
        "Assign or change roles",
        "Manage billing/subscription",
        "Access audit logs and reports",
        "Create or delete entire workspaces/projects",
        "Manage integrations (Google, Slack, etc.)"
      ]
    },
    PROJECT_MANAGER: {
      label: "Project Manager / Team Lead",
      icon: Shield,
      color: "bg-blue-100 text-blue-800 border-blue-200",
      description: "Oversees specific projects and team productivity",
      permissions: [
        "Create and edit projects",
        "Assign tasks to team members",
        "Set task priorities, due dates, and milestones",
        "Comment and review progress",
        "View reports for their project"
      ],
      restrictions: [
        "Cannot change billing or global workspace settings",
        "Cannot delete the workspace"
      ]
    },
    MEMBER: {
      label: "Member / Contributor",
      icon: User,
      color: "bg-green-100 text-green-800 border-green-200",
      description: "Regular team member who performs assigned tasks",
      permissions: [
        "View assigned projects and tasks",
        "Create or edit their own tasks",
        "Mark tasks complete",
        "Comment and upload attachments"
      ],
      restrictions: [
        "Cannot manage other users",
        "Cannot delete or rename projects",
        "Cannot see private projects (unless invited)"
      ]
    },
    VIEWER: {
      label: "Viewer / Guest / Client",
      icon: Eye,
      color: "bg-gray-100 text-gray-800 border-gray-200",
      description: "External collaborators (clients, contractors) with limited access",
      permissions: [
        "View shared projects or tasks",
        "Comment (optional)"
      ],
      restrictions: [
        "Cannot edit tasks",
        "Cannot assign or delete anything",
        "Limited access to reports or internal notes"
      ]
    }
  };

  const addTeamMember = () => {
    if (newMemberEmail && !teamMembers.find(m => m.email === newMemberEmail)) {
      const newMember: TeamMember = {
        id: `member-${Date.now()}`,
        name: newMemberEmail.split('@')[0],
        email: newMemberEmail,
        role: newMemberRole,
        isInvited: true
      };
      setTeamMembers([...teamMembers, newMember]);
      setNewMemberEmail("");
      setNewMemberRole("MEMBER");
    }
  };

  const removeTeamMember = (id: string) => {
    if (id !== "current-user") {
      setTeamMembers(teamMembers.filter(m => m.id !== id));
    }
  };

  const updateMemberRole = (id: string, role: "OWNER" | "PROJECT_MANAGER" | "MEMBER" | "VIEWER") => {
    if (id !== "current-user") {
      setTeamMembers(teamMembers.map(m => 
        m.id === id ? { ...m, role } : m
      ));
    }
  };

  const handleContinue = () => {
    if (projectName.trim()) {
      navigate("/template-selection", { 
        state: { 
          projectData: {
            name: projectName,
            description: projectDescription,
            teamMembers: teamMembers
          }
        } 
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-12 mt-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Set up your project
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Give your project a name, add team members, and assign roles. You can always modify these settings later.
          </p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden">
          
          <div className="p-8 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              Project Details
            </h2>

            <div className="space-y-6">
              <div>
                <Label htmlFor="project-name" className="text-sm font-semibold text-slate-700 mb-2 block">
                  Project Name *
                </Label>
                <Input
                  id="project-name"
                  placeholder="Enter your project name..."
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="text-lg h-12"
                />
              </div>

              <div>
                <Label htmlFor="project-description" className="text-sm font-semibold text-slate-700 mb-2 block">
                  Project Description
                </Label>
                <Textarea
                  id="project-description"
                  placeholder="Describe what this project is about... (optional)"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              Team Members
              <Badge variant="secondary" className="ml-2">
                {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
              </Badge>
            </h2>

            <div className="bg-slate-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Invite Team Members</h3>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Enter email address..."
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTeamMember()}
                    className="h-11"
                  />
                </div>
                <Select value={newMemberRole} onValueChange={(value: "PROJECT_MANAGER" | "MEMBER" | "VIEWER") => setNewMemberRole(value)}>
                  <SelectTrigger className="w-40 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={addTeamMember}
                  disabled={!newMemberEmail}
                  className="h-11 px-6"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {teamMembers.map((member) => {
                const RoleIcon = roleConfig[member.role].icon;
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900">
                            {member.name}
                          </h4>
                          {member.isInvited && (
                            <Badge variant="outline" className="text-xs">
                              <Mail className="w-3 h-3 mr-1" />
                              Invited
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {member.id === "current-user" ? (
                        <Badge className={roleConfig[member.role].color}>
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {roleConfig[member.role].label}
                        </Badge>
                      ) : (
                        <Select 
                          value={member.role} 
                          onValueChange={(value: "PROJECT_MANAGER" | "MEMBER" | "VIEWER") => updateMemberRole(member.id, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PROJECT_MANAGER">
                              <div className="flex items-center gap-2">
                                <Shield className="w-3 h-3" />
                                Project Manager
                              </div>
                            </SelectItem>
                            <SelectItem value="MEMBER">
                              <div className="flex items-center gap-2">
                                <User className="w-3 h-3" />
                                Member
                              </div>
                            </SelectItem>
                            <SelectItem value="VIEWER">
                              <div className="flex items-center gap-2">
                                <Eye className="w-3 h-3" />
                                Viewer
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      {member.id !== "current-user" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTeamMember(member.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 p-6 bg-slate-50 rounded-xl">
              <h4 className="text-sm font-semibold text-slate-900 mb-6 uppercase tracking-wide">
                Role Permissions
              </h4>
              <div className="space-y-6">
                {Object.entries(roleConfig).map(([role, config]) => {
                  const Icon = config.icon;
                  return (
                    <div key={role} className="bg-white rounded-lg p-4 border border-slate-200">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{config.label}</p>
                          <p className="text-xs text-slate-600 mt-1">{config.description}</p>
                        </div>
                      </div>
                      
                      <div className="ml-11 space-y-2">
                        {config.permissions && (
                          <div>
                            <p className="text-xs font-medium text-green-700 mb-1">✅ Permissions:</p>
                            <ul className="space-y-1">
                              {config.permissions.map((permission, index) => (
                                <li key={index} className="text-xs text-slate-600 flex items-start gap-1">
                                  <span className="text-green-600 mt-0.5">•</span>
                                  {permission}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {config.restrictions && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-red-700 mb-1">🚫 Restrictions:</p>
                            <ul className="space-y-1">
                              {config.restrictions.map((restriction, index) => (
                                <li key={index} className="text-xs text-slate-600 flex items-start gap-1">
                                  <span className="text-red-600 mt-0.5">•</span>
                                  {restriction}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 bg-white rounded-xl border-2 border-slate-200 shadow-sm mt-8">
          <div>
            <p className="text-sm text-slate-700 font-medium">
              {projectName ? (
                <>
                  Project: <span className="text-blue-600">{projectName}</span>
                </>
              ) : (
                "Enter a project name to continue"
              )}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              💡 You can invite more team members later from project settings
            </p>
          </div>
          <Button
            size="lg"
            disabled={!projectName.trim()}
            onClick={handleContinue}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
          >
            Continue to Template Selection
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSetup;