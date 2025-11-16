import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import { Camera, Save, Mail, Briefcase, FileText, User, ArrowLeft, Upload, Video, BarChart3 } from "lucide-react";
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
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  };

  const handleCancel = () => {
    setFormData(userData);
    setIsEditing(false);
  };

  const handleAvatarUpload = () => {
    setIsAvatarDialogOpen(true);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
        setIsCameraActive(true);
      }
    } catch (error) {
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const startCountdown = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      // Check if video is ready
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        alert("Camera is still loading. Please wait a moment and try again.");
        return;
      }
      
      setIsCapturing(true);
      setCountdown(3);
      
      let count = 3;
      const timer = setInterval(() => {
        count--;
        if (count > 0) {
          setCountdown(count);
        } else {
          clearInterval(timer);
          setCountdown(null);
          capturePhoto();
        }
      }, 1000);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/png');
        setCapturedImage(imageData);
        setIsCapturing(false);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveAvatar = () => {
    if (capturedImage) {
      setFormData(prev => ({ ...prev, avatar: capturedImage }));
      setUserData(prev => ({ ...prev, avatar: capturedImage }));
      setCapturedImage(null);
      setIsAvatarDialogOpen(false);
      // TODO: Upload to backend
    }
  };

  const closeAvatarDialog = () => {
    stopCamera();
    setCapturedImage(null);
    setIsAvatarDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 overflow-x-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-8 sm:pt-28 sm:pb-12 max-w-full">
        <div className="max-w-5xl mx-auto w-full">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 hover:bg-white/80 hover:shadow-sm transition-all group text-slate-700 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </Button>

          {/* Header Section */}
          <div className="mb-8 sm:mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full"></div>
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Profile Settings
              </h2>
            </div>
            <p className="text-slate-600 text-sm sm:text-base ml-7">Manage your personal information and preferences</p>
          </div>

          <div className="space-y-6">
            {/* Profile Picture Card */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
              <CardContent className="pt-8 pb-8">
                <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-300"></div>
                    <Avatar className="relative w-28 h-28 sm:w-32 sm:h-32 ring-4 ring-white shadow-xl">
                      {formData.avatar ? (
                        <AvatarImage src={formData.avatar} alt={formData.name} className="object-cover" />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-4xl">
                          {formData.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <button
                      onClick={handleAvatarUpload}
                      className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group"
                    >
                      <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                  <div className="flex-1 text-center sm:text-left w-full">
                    <h3 className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-1">
                      {userData.name}
                    </h3>
                    <p className="text-sm sm:text-base text-indigo-600 font-medium mb-3">{userData.jobTitle}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-500">
                      <Camera className="w-4 h-4" />
                      <span>Click the camera icon to update your photo</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information Card */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-bold text-slate-900">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      Personal Information
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm mt-2 ml-13">Update your personal details</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6 sm:space-y-8 pt-8">
                {/* Name */}
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    className={`h-12 sm:h-14 text-base border-2 rounded-xl ${
                      isEditing 
                        ? 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white' 
                        : 'bg-slate-50 border-slate-100 cursor-not-allowed text-slate-600'
                    } transition-all duration-300`}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email */}
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-indigo-600" />
                    </div>
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    className={`h-12 sm:h-14 text-base border-2 rounded-xl ${
                      isEditing 
                        ? 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white' 
                        : 'bg-slate-50 border-slate-100 cursor-not-allowed text-slate-600'
                    } transition-all duration-300`}
                    placeholder="Enter your email address"
                  />
                </div>

                {/* Job Title */}
                <div className="space-y-3">
                  <Label htmlFor="jobTitle" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-purple-600" />
                    </div>
                    Job Title
                  </Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    disabled={!isEditing}
                    className={`h-12 sm:h-14 text-base border-2 rounded-xl ${
                      isEditing 
                        ? 'border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 bg-white' 
                        : 'bg-slate-50 border-slate-100 cursor-not-allowed text-slate-600'
                    } transition-all duration-300`}
                    placeholder="Enter your job title"
                  />
                </div>

                {/* Description/Bio */}
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={!isEditing}
                    className={`min-h-[120px] sm:min-h-[140px] text-base border-2 rounded-xl ${
                      isEditing 
                        ? 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white' 
                        : 'bg-slate-50 border-slate-100 cursor-not-allowed text-slate-600'
                    } transition-all duration-300 resize-none`}
                    placeholder="Tell us about yourself, your skills, and experience..."
                  />
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t-2 border-slate-100">
                    <Button
                      onClick={handleSave}
                      className="gap-2 w-full sm:flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="w-full sm:flex-1 h-12 font-semibold border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Statistics */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/30">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-bold text-slate-900">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  Account Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div 
                    className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border-2 border-blue-200 cursor-pointer hover:shadow-xl hover:scale-105 hover:border-blue-400 transition-all duration-300"
                    onClick={() => navigate('/dashboard')}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative">
                      <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">3</div>
                      <p className="text-sm font-semibold text-blue-700">Active Projects</p>
                    </div>
                  </div>
                  <div 
                    className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 border-2 border-green-200 cursor-pointer hover:shadow-xl hover:scale-105 hover:border-green-400 transition-all duration-300"
                    onClick={() => navigate('/dashboard')}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative">
                      <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-2">12</div>
                      <p className="text-sm font-semibold text-green-700">Completed Tasks</p>
                    </div>
                  </div>
                  <div 
                    className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-5 border-2 border-purple-200 cursor-pointer hover:shadow-xl hover:scale-105 hover:border-purple-400 transition-all duration-300"
                    onClick={() => navigate('/dashboard')}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative">
                      <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">5</div>
                      <p className="text-sm font-semibold text-purple-700">Team Members</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Avatar Upload/Capture Dialog */}
      <Dialog open={isAvatarDialogOpen} onOpenChange={closeAvatarDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
            <DialogDescription>
              Capture a photo using your camera or upload an image file
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!isCameraActive && !capturedImage && (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={startCamera}
                  className="h-24 flex flex-col gap-2"
                  variant="outline"
                >
                  <Video className="w-8 h-8" />
                  <span>Use Camera</span>
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="h-24 flex flex-col gap-2"
                  variant="outline"
                >
                  <Upload className="w-8 h-8" />
                  <span>Upload File</span>
                </Button>
              </div>
            )}

            {isCameraActive && (
              <div className="space-y-3">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full rounded-lg border-2 border-border bg-black"
                    style={{ maxHeight: '400px' }}
                  />
                  
                  {/* Countdown Overlay */}
                  {countdown !== null && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
                      <div className="text-white text-6xl font-bold animate-pulse">
                        {countdown}
                      </div>
                      <p className="text-white text-lg mt-4 font-semibold">
                        Stand still...
                      </p>
                    </div>
                  )}
                  
                  {/* Instructions */}
                  {!isCapturing && (
                    <div className="absolute top-3 left-3 right-3 bg-black/70 text-white text-sm p-2 rounded-lg text-center">
                      Position yourself in the frame and click "Capture Photo"
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={startCountdown} 
                    className="flex-1"
                    disabled={isCapturing}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {isCapturing ? "Capturing..." : "Capture Photo"}
                  </Button>
                  <Button 
                    onClick={stopCamera} 
                    variant="outline"
                    disabled={isCapturing}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {capturedImage && (
              <div className="space-y-3">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full rounded-lg border-2 border-border"
                />
                <div className="flex gap-2">
                  <Button onClick={saveAvatar} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Save Photo
                  </Button>
                  <Button
                    onClick={() => setCapturedImage(null)}
                    variant="outline"
                  >
                    Retake
                  </Button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
