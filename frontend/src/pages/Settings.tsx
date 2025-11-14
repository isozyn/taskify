import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useTheme } from "@/contexts/ThemeContext";
import { api, CalendarSyncStatus } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ExternalLink,
  Mail,
  Lock,
  Palette
} from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<CalendarSyncStatus>({
    calendarSyncEnabled: false,
    calendarConnected: false,
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch calendar sync status
  useEffect(() => {
    fetchSyncStatus();
  }, []);

  const fetchSyncStatus = async () => {
    try {
      setIsLoading(true);
      const response: any = await api.getCalendarSyncStatus();
      setSyncStatus(response);
    } catch (error: any) {
      console.error("Failed to fetch sync status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSync = async (enabled: boolean) => {
    if (!syncStatus.calendarConnected) {
      toast({
        title: "Google Calendar Not Connected",
        description: "Please sign in with Google to enable calendar sync",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSyncing(true);
      if (enabled) {
        await api.enableCalendarSync();
        toast({
          title: "Calendar Sync Enabled",
          description: "Your tasks will now sync to Google Calendar",
        });
      } else {
        await api.disableCalendarSync();
        toast({
          title: "Calendar Sync Disabled",
          description: "Tasks will no longer sync to Google Calendar",
        });
      }
      setSyncStatus({ ...syncStatus, calendarSyncEnabled: enabled });
    } catch (error: any) {
      console.error("Failed to toggle sync:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to toggle calendar sync",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const response: any = await api.googleAuth();
      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error('No OAuth URL received');
      }
    } catch (error: any) {
      console.error('Failed to initiate Google OAuth:', error);
      toast({
        title: "Error",
        description: "Failed to connect to Google Calendar. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="w-4 h-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="w-4 h-4" />
              Appearance
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={user?.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue={user?.username} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex gap-2">
                    <Input id="email" type="email" defaultValue={user?.email} />
                    {user?.isEmailVerified && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Google Calendar Integration
                </CardTitle>
                <CardDescription>
                  Automatically sync your tasks to Google Calendar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
                  </div>
                ) : (
                  <>
                    {/* Connection Status */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3">
                        {syncStatus.calendarConnected ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-slate-400" />
                        )}
                        <div>
                          <p className="font-medium text-slate-900">
                            {syncStatus.calendarConnected
                              ? "Google Calendar Connected"
                              : "Google Calendar Not Connected"}
                          </p>
                          <p className="text-sm text-slate-500">
                            {syncStatus.calendarConnected
                              ? "Your account is linked to Google Calendar"
                              : "Connect your Google account to enable sync"}
                          </p>
                        </div>
                      </div>
                      {syncStatus.calendarConnected ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Connected
                        </Badge>
                      ) : (
                        <Button onClick={handleConnectGoogle} size="sm" className="gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Connect Google
                        </Button>
                      )}
                    </div>

                    {/* Sync Toggle */}
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">
                          Automatic Calendar Sync
                        </h3>
                        <p className="text-sm text-slate-500">
                          When enabled, tasks will automatically sync to your Google Calendar
                        </p>
                      </div>
                      <Switch
                        checked={syncStatus.calendarSyncEnabled}
                        onCheckedChange={handleToggleSync}
                        disabled={!syncStatus.calendarConnected || isSyncing}
                      />
                    </div>

                    {/* Sync Status Info */}
                    {syncStatus.calendarSyncEnabled && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-blue-900 mb-1">
                              Calendar Sync Active
                            </p>
                            <p className="text-sm text-blue-700">
                              New tasks and updates will automatically appear in your Google Calendar.
                              Tasks are color-coded by priority.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Help Text */}
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>• Tasks with start and end dates will be synced as calendar events</p>
                      <p>• Project timelines will be synced as all-day events</p>
                      <p>• Updates to tasks and projects will automatically update the calendar</p>
                      <p>• Deleting a task will remove it from your calendar</p>
                      <p>• Events are color-coded: Red (Urgent), Blue (High), Yellow (Medium), Green (Low)</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-slate-900">Email Notifications</p>
                    <p className="text-sm text-slate-500">Receive email updates about your tasks</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-slate-900">Task Assignments</p>
                    <p className="text-sm text-slate-500">Get notified when assigned to a task</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-slate-900">Task Comments</p>
                    <p className="text-sm text-slate-500">Notifications for comments on your tasks</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-slate-900">Project Updates</p>
                    <p className="text-sm text-slate-500">Updates about projects you're part of</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <div className="flex justify-end pt-4">
                  <Button>Update Password</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">2FA Status</p>
                    <p className="text-sm text-slate-500">Currently disabled</p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Customize the appearance of your workspace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setTheme("light")}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:scale-105 ${
                      theme === "light" ? "border-blue-600 shadow-lg" : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <div className="w-full h-20 bg-white border border-slate-200 rounded mb-2 flex items-center justify-center">
                      <div className="text-slate-400 text-xs">☀️</div>
                    </div>
                    <p className="text-sm font-medium text-center">Light</p>
                    {theme === "light" && (
                      <div className="mt-2 flex justify-center">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setTheme("dark")}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:scale-105 ${
                      theme === "dark" ? "border-blue-600 shadow-lg" : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <div className="w-full h-20 bg-slate-900 rounded mb-2 flex items-center justify-center">
                      <div className="text-slate-400 text-xs">🌙</div>
                    </div>
                    <p className="text-sm font-medium text-center">Dark</p>
                    {theme === "dark" && (
                      <div className="mt-2 flex justify-center">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setTheme("auto")}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:scale-105 ${
                      theme === "auto" ? "border-blue-600 shadow-lg" : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <div className="w-full h-20 bg-gradient-to-br from-white via-slate-400 to-slate-900 rounded mb-2 flex items-center justify-center">
                      <div className="text-white text-xs">⚙️</div>
                    </div>
                    <p className="text-sm font-medium text-center">Auto</p>
                    {theme === "auto" && (
                      <div className="mt-2 flex justify-center">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500 text-center pt-2">
                  {theme === "auto" 
                    ? "Theme will automatically match your system preferences" 
                    : `Currently using ${theme} theme`}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
