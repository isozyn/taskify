import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import { Camera, Save, Mail, Briefcase, FileText, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  
  // Mock user data - will be replaced with real data from backend
  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "john.doe@company.com",
    jobTitle: "Full Stack Developer",
    description: "Senior developer with expertise in React and Node.js. Passionate about creating scalable applications and mentoring junior developers.",
    avatar: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(userData);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // TODO: Save to backend
    setUserData(formData);
    setIsEditing(false);
    console.log("Saving user data:", formData);
  };

  const handleCancel = () => {
    setFormData(userData);
    setIsEditing(false);
  };

  const handleAvatarUpload = () => {
    // TODO: Implement file upload
    console.log("Upload avatar");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-amber-50/50 to-amber-100/30">
      {/* Navbar */}
  <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="heading-executive">Profile Settings</h2>
            <p className="text-executive">Manage your personal information and preferences</p>
          </div>

          <div className="space-y-6">
            {/* Profile Picture Card */}
            <Card className="premium-card border-0 bg-gradient-to-br from-card via-card to-card/90 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  Profile Picture
                </CardTitle>
                <CardDescription>Update your profile picture</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24 ring-4 ring-primary/20">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold text-3xl">
                        {formData.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <button
                        onClick={handleAvatarUpload}
                        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all duration-300"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground">{userData.name}</h3>
                    <p className="text-sm text-muted-foreground">{userData.jobTitle}</p>
                    {isEditing && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Click the camera icon to upload a new profile picture
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information Card */}
            <Card className="premium-card border-0 bg-gradient-to-br from-card via-card to-card/90 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="btn-executive"
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    className={`h-12 border-border/50 ${
                      isEditing ? 'focus:border-primary/50' : 'bg-muted/30 cursor-not-allowed'
                    } transition-all duration-300`}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    className={`h-12 border-border/50 ${
                      isEditing ? 'focus:border-primary/50' : 'bg-muted/30 cursor-not-allowed'
                    } transition-all duration-300`}
                    placeholder="Enter your email address"
                  />
                </div>

                {/* Job Title */}
                <div className="space-y-2">
                  <Label htmlFor="jobTitle" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    Job Title
                  </Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    disabled={!isEditing}
                    className={`h-12 border-border/50 ${
                      isEditing ? 'focus:border-primary/50' : 'bg-muted/30 cursor-not-allowed'
                    } transition-all duration-300`}
                    placeholder="Enter your job title"
                  />
                </div>

                {/* Description/Bio */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={!isEditing}
                    className={`min-h-[120px] border-border/50 ${
                      isEditing ? 'focus:border-primary/50' : 'bg-muted/30 cursor-not-allowed'
                    } transition-all duration-300 resize-none`}
                    placeholder="Tell us about yourself, your skills, and experience..."
                  />
                  <p className="text-xs text-muted-foreground">
                    This description will be visible to your team members
                  </p>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                    <Button
                      onClick={handleSave}
                      className="btn-executive gap-2 flex-1"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="flex-1 font-semibold border-border/50 hover:bg-muted/50 transition-all duration-300"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Statistics */}
            <Card className="premium-card border-0 bg-gradient-to-br from-card via-card to-card/90 shadow-lg">
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
                <CardDescription>Your activity overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
                    <div className="text-2xl font-bold text-foreground mb-1">3</div>
                    <p className="text-sm text-muted-foreground font-medium">Active Projects</p>
                  </div>
                  <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-lg p-4 border border-success/20">
                    <div className="text-2xl font-bold text-foreground mb-1">12</div>
                    <p className="text-sm text-muted-foreground font-medium">Completed Tasks</p>
                  </div>
                  <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg p-4 border border-accent/20">
                    <div className="text-2xl font-bold text-foreground mb-1">5</div>
                    <p className="text-sm text-muted-foreground font-medium">Team Members</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
