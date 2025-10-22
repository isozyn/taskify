import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus, Activity } from "lucide-react";

interface ProjectSettingsProps {
  project: any;
}

const ProjectSettings = ({ project }: ProjectSettingsProps) => {
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
        <TabsTrigger value="activity">Activity Log</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Update your project information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input id="project-name" defaultValue={project.name} />
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
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Manage who has access to this project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Enter email address..." />
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite
              </Button>
            </div>

            <div className="space-y-3">
              {project.members.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">member@example.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Member</Badge>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
