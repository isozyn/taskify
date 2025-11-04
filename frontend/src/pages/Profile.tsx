import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import { Camera, Save, Mail, Briefcase, FileText, User, Upload, Check, FolderKanban, CheckCircle2, Users as UsersIcon, Calendar, Clock } from "lucide-react";
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
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [selectedStatType, setSelectedStatType] = useState<'projects' | 'tasks' | 'members' | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mock data for statistics - will be replaced with real data from backend
  const mockActiveProjects = [
    { id: 1, name: "Website Redesign", status: "ACTIVE", progress: 65, dueDate: "2024-12-15" },
    { id: 2, name: "Mobile App Development", status: "ACTIVE", progress: 40, dueDate: "2024-12-20" },
    { id: 3, name: "Marketing Campaign", status: "ACTIVE", progress: 80, dueDate: "2024-12-10" },
  ];

  const mockCompletedTasks = [
    { id: 1, title: "Design homepage mockup", project: "Website Redesign", completedDate: "2024-11-28" },
    { id: 2, title: "Setup database schema", project: "Mobile App", completedDate: "2024-11-27" },
    { id: 3, title: "Write API documentation", project: "Backend API", completedDate: "2024-11-26" },
    { id: 4, title: "Create user flow diagram", project: "UX Design", completedDate: "2024-11-25" },
    { id: 5, title: "Implement authentication", project: "Mobile App", completedDate: "2024-11-24" },
  ];

  const mockTeamMembers = [
    { id: 1, name: "Alice Johnson", role: "Frontend Developer", avatar: "", projects: 3 },
    { id: 2, name: "Bob Smith", role: "Backend Developer", avatar: "", projects: 2 },
    { id: 3, name: "Carol White", role: "UI/UX Designer", avatar: "", projects: 4 },
    { id: 4, name: "David Brown", role: "Project Manager", avatar: "", projects: 5 },
    { id: 5, name: "Eve Davis", role: "QA Engineer", avatar: "", projects: 2 },
  ];

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

  const handleAvatarClick = () => {
    setIsAvatarDialogOpen(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setFormData(prev => ({ ...prev, avatar: imageUrl }));
        setUserData(prev => ({ ...prev, avatar: imageUrl }));
        setIsAvatarDialogOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDialogClose = () => {
    stopCamera();
    setIsAvatarDialogOpen(false);
    setShowCamera(false);
    setCapturedPhoto(null);
  };

  const startCamera = async () => {
    try {
      console.log('🎥 Starting camera...');
      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support camera access. Please use a modern browser like Chrome, Firefox, or Safari.');
        return;
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user', 
          width: { ideal: 1280 }, 
          height: { ideal: 720 } 
        },
        audio: false
      });
      
      console.log('✅ Media stream obtained');
      console.log('📹 Stream tracks:', mediaStream.getTracks().length);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setShowCamera(true); // Show camera immediately
        
        // Wait for video to be ready and play
        videoRef.current.onloadedmetadata = async () => {
          console.log('📺 Video metadata loaded');
          console.log('📐 Video dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
          
          try {
            await videoRef.current?.play();
            console.log('▶️ Video playing successfully');
          } catch (playError) {
            console.error('❌ Error playing video:', playError);
            // Try to play again
            setTimeout(async () => {
              try {
                await videoRef.current?.play();
                console.log('▶️ Video playing after retry');
              } catch (retryError) {
                console.error('❌ Retry failed:', retryError);
              }
            }, 100);
          }
        };
        
        // Also try to play immediately
        try {
          await videoRef.current.play();
          console.log('▶️ Video started playing immediately');
        } catch (immediatePlayError) {
          console.log('⏳ Waiting for metadata before playing...');
        }
      }
    } catch (error: any) {
      console.error('❌ Error accessing camera:', error);
      let errorMessage = 'Unable to access camera. ';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage += 'Please allow camera permissions in your browser.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on your device.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Camera is already in use by another application.';
      } else {
        errorMessage += error.message || 'Please check your camera settings.';
      }
      
      alert(errorMessage);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    console.log('🎥 Capture photo function called');
    
    if (isCapturing) {
      console.log('Already capturing, please wait...');
      return;
    }
    
    setIsCapturing(true);
    
    if (!videoRef.current || !canvasRef.current) {
      console.error('❌ Video or canvas ref not available');
      alert('Camera not ready. Please try again.');
      setIsCapturing(false);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    console.log('📐 Video dimensions:', video.videoWidth, 'x', video.videoHeight);
    console.log('📹 Video ready state:', video.readyState);
    console.log('▶️ Video paused:', video.paused);
    
    // Check if video has loaded
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error('❌ Video not ready yet');
      alert('Camera is still loading. Please wait a moment and try again.');
      setIsCapturing(false);
      return;
    }
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    console.log('🖼️ Canvas dimensions set:', canvas.width, 'x', canvas.height);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ Could not get canvas context');
      alert('Unable to capture photo. Please try again.');
      setIsCapturing(false);
      return;
    }

    try {
      // Save the current context state
      ctx.save();
      
      // Flip horizontally for front camera (mirror effect)
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      
      // Draw the video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Restore context state
      ctx.restore();
      
      console.log('✅ Image drawn to canvas');
      
      // Convert canvas to image data
      const photoData = canvas.toDataURL('image/jpeg', 0.9);
      console.log('📸 Photo data generated, length:', photoData.length);
      
      if (photoData && photoData.length > 100) {
        setCapturedPhoto(photoData);
        stopCamera();
        console.log('✅ Photo captured and set successfully!');
      } else {
        console.error('❌ Failed to capture photo data');
        alert('Failed to capture photo. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error during capture:', error);
      alert('Error capturing photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const usePhoto = () => {
    if (capturedPhoto) {
      setFormData(prev => ({ ...prev, avatar: capturedPhoto }));
      setUserData(prev => ({ ...prev, avatar: capturedPhoto }));
      handleDialogClose();
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-amber-50/50 to-amber-100/30">
      {/* Navbar */}
  <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-12 max-w-7xl">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-2">
              Profile Settings
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">Manage your personal information and preferences</p>
          </div>

          <div className="space-y-6">
            {/* Profile Picture Card */}
            <Card className="border-2 hover:border-primary/20 transition-all duration-300 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Camera className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>Upload or capture your profile photo</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative group">
                    <Avatar className="w-32 h-32 ring-4 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40">
                      {formData.avatar ? (
                        <AvatarImage src={formData.avatar} alt={formData.name} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold text-4xl">
                          {formData.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <button
                      onClick={handleAvatarClick}
                      className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-bold text-xl text-foreground mb-1">{userData.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{userData.jobTitle}</p>
                    <Button
                      onClick={handleAvatarClick}
                      variant="outline"
                      className="border-2 hover:border-primary hover:bg-primary/5"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Change Photo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avatar Upload/Capture Dialog */}
            <Dialog open={isAvatarDialogOpen} onOpenChange={handleDialogClose}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-primary" />
                    Update Profile Picture
                  </DialogTitle>
                  <DialogDescription>
                    Choose to upload a photo or take one with your camera
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Initial Options */}
                  {!showCamera && !capturedPhoto && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Upload Option */}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary/30 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-300 group"
                        >
                          <Upload className="w-12 h-12 text-primary mb-3 group-hover:scale-110 transition-transform" />
                          <span className="font-semibold text-sm">Upload Photo</span>
                          <span className="text-xs text-muted-foreground mt-1">From your gallery</span>
                        </button>

                        {/* Camera Capture Option */}
                        <button
                          onClick={startCamera}
                          className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-accent/30 rounded-lg hover:border-accent hover:bg-accent/5 transition-all duration-300 group"
                        >
                          <Camera className="w-12 h-12 text-accent mb-3 group-hover:scale-110 transition-transform" />
                          <span className="font-semibold text-sm">Capture Photo</span>
                          <span className="text-xs text-muted-foreground mt-1">Live camera</span>
                        </button>
                      </div>

                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      
                      <p className="text-xs text-center text-muted-foreground">
                        Upload from gallery or capture a live photo
                      </p>
                    </div>
                  )}

                  {/* Live Camera View */}
                  {showCamera && !capturedPhoto && (
                    <div className="space-y-4">
                      <div className="relative rounded-lg overflow-hidden bg-black shadow-2xl min-h-[400px] flex items-center justify-center">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full min-h-[400px] object-cover transform scale-x-[-1]"
                          style={{ maxHeight: '600px' }}
                        />
                        {/* Live Indicator */}
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg z-20">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                          LIVE
                        </div>
                        
                        {/* Camera Frame Guide */}
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute inset-8 border-2 border-white/30 rounded-lg"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/50 rounded-full"></div>
                        </div>
                        
                        {/* Instructions Overlay */}
                        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                          Position your face in the circle
                        </div>
                        
                        {/* Circular Capture Button Overlay */}
                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              console.log('Circular button clicked');
                              capturePhoto();
                            }}
                            className="w-20 h-20 rounded-full bg-white border-4 border-primary shadow-2xl hover:scale-110 active:scale-95 transition-transform duration-200 flex items-center justify-center group cursor-pointer"
                          >
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                              <Camera className="w-8 h-8 text-white" />
                            </div>
                          </button>
                        </div>
                      </div>
                      
                      {/* Bottom Action Buttons */}
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            console.log('Bottom button clicked');
                            capturePhoto();
                          }}
                          size="lg"
                          className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 active:opacity-80 shadow-lg h-12 text-base font-semibold"
                        >
                          <Camera className="w-5 h-5 mr-2" />
                          Capture Photo
                        </Button>
                        <Button
                          onClick={() => {
                            stopCamera();
                            setShowCamera(false);
                          }}
                          variant="outline"
                          size="lg"
                          className="border-2 hover:bg-red-50 hover:border-red-500 hover:text-red-600 h-12"
                        >
                          Cancel
                        </Button>
                      </div>
                      <p className="text-sm text-center text-muted-foreground font-medium">
                        📸 Click the camera button to capture your photo
                      </p>
                    </div>
                  )}

                  {/* Photo Preview */}
                  {capturedPhoto && (
                    <div className="space-y-4">
                      <div className="relative rounded-lg overflow-hidden border-2 border-primary/20">
                        <img src={capturedPhoto} alt="Captured" className="w-full h-auto" />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={usePhoto}
                          className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Use This Photo
                        </Button>
                        <Button
                          onClick={retakePhoto}
                          variant="outline"
                          className="border-2"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Retake
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Hidden canvas for photo capture */}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              </DialogContent>
            </Dialog>

            {/* Personal Information Card */}
            <Card className="border-2 hover:border-primary/20 transition-all duration-300 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your personal details</CardDescription>
                    </div>
                  </div>
                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditing}
                      className={`h-12 border-2 ${
                        isEditing ? 'focus:border-primary' : 'bg-muted/30 cursor-not-allowed'
                      } transition-all duration-300`}
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className={`h-12 border-2 ${
                        isEditing ? 'focus:border-primary' : 'bg-muted/30 cursor-not-allowed'
                      } transition-all duration-300`}
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                {/* Job Title */}
                <div className="space-y-2">
                  <Label htmlFor="jobTitle" className="text-sm font-semibold">
                    Job Title
                  </Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    disabled={!isEditing}
                    className={`h-12 border-2 ${
                      isEditing ? 'focus:border-primary' : 'bg-muted/30 cursor-not-allowed'
                    } transition-all duration-300`}
                    placeholder="Enter your job title"
                  />
                </div>

                {/* Description/Bio */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold">
                    About Me
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={!isEditing}
                    className={`min-h-[140px] border-2 ${
                      isEditing ? 'focus:border-primary' : 'bg-muted/30 cursor-not-allowed'
                    } transition-all duration-300 resize-none`}
                    placeholder="Tell us about yourself, your skills, and experience..."
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <FileText className="w-3 h-3" />
                    This description will be visible to your team members
                  </p>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-border/30">
                    <Button
                      onClick={handleSave}
                      className="w-full sm:flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="w-full sm:flex-1 border-2 hover:bg-muted/50 transition-all duration-300"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Statistics */}
            <Card className="border-2 hover:border-primary/20 transition-all duration-300 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-green-500/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Briefcase className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Account Statistics</CardTitle>
                    <CardDescription>Your activity overview</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Active Projects Card */}
                  <button
                    onClick={() => {
                      setSelectedStatType('projects');
                      setShowStatsDialog(true);
                    }}
                    className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg cursor-pointer text-left group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-3xl font-bold text-foreground">{mockActiveProjects.length}</div>
                      <FolderKanban className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-sm text-muted-foreground font-semibold">Active Projects</p>
                    <p className="text-xs text-primary mt-1">Click to view details →</p>
                  </button>

                  {/* Completed Tasks Card */}
                  <button
                    onClick={() => {
                      setSelectedStatType('tasks');
                      setShowStatsDialog(true);
                    }}
                    className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-6 border-2 border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg cursor-pointer text-left group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-3xl font-bold text-foreground">{mockCompletedTasks.length}</div>
                      <CheckCircle2 className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-sm text-muted-foreground font-semibold">Completed Tasks</p>
                    <p className="text-xs text-green-600 mt-1">Click to view details →</p>
                  </button>

                  {/* Team Members Card */}
                  <button
                    onClick={() => {
                      setSelectedStatType('members');
                      setShowStatsDialog(true);
                    }}
                    className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-6 border-2 border-accent/20 hover:border-accent/40 transition-all duration-300 hover:shadow-lg cursor-pointer text-left group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-3xl font-bold text-foreground">{mockTeamMembers.length}</div>
                      <UsersIcon className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-sm text-muted-foreground font-semibold">Team Members</p>
                    <p className="text-xs text-accent mt-1">Click to view details →</p>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Detail Dialog */}
            <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
              <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {selectedStatType === 'projects' && <FolderKanban className="w-5 h-5 text-primary" />}
                    {selectedStatType === 'tasks' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                    {selectedStatType === 'members' && <UsersIcon className="w-5 h-5 text-accent" />}
                    {selectedStatType === 'projects' && 'Active Projects'}
                    {selectedStatType === 'tasks' && 'Completed Tasks'}
                    {selectedStatType === 'members' && 'Team Members'}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedStatType === 'projects' && 'View all your active projects and their progress'}
                    {selectedStatType === 'tasks' && 'View all your recently completed tasks'}
                    {selectedStatType === 'members' && 'View all team members you collaborate with'}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 mt-4">
                  {/* Active Projects List */}
                  {selectedStatType === 'projects' && mockActiveProjects.map((project) => (
                    <div key={project.id} className="p-4 border-2 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{project.name}</h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            Due: {project.dueDate}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          {project.status}
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold text-primary">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Completed Tasks List */}
                  {selectedStatType === 'tasks' && mockCompletedTasks.map((task) => (
                    <div key={task.id} className="p-4 border-2 rounded-lg hover:border-green-500/50 hover:bg-green-50 transition-all">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{task.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{task.project}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                            <Clock className="w-3 h-3" />
                            Completed: {task.completedDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Team Members List */}
                  {selectedStatType === 'members' && mockTeamMembers.map((member) => (
                    <div key={member.id} className="p-4 border-2 rounded-lg hover:border-accent/50 hover:bg-accent/5 transition-all">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 ring-2 ring-accent/20">
                          {member.avatar ? (
                            <AvatarImage src={member.avatar} alt={member.name} />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-accent to-primary text-white font-semibold">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{member.name}</h4>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                          <p className="text-xs text-accent mt-1">
                            {member.projects} shared project{member.projects !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
