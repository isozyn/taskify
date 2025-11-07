import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Mail, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface InviteMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  projectName: string;
}

interface MemberInvite {
  id: string;
  email: string;
  role: string;
}

export const InviteMembersDialog = ({ open, onOpenChange, projectId, projectName }: InviteMembersDialogProps) => {
  const [members, setMembers] = useState<MemberInvite[]>([
    { id: crypto.randomUUID(), email: "", role: "MEMBER" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{ success: string[]; errors: string[] } | null>(null);
  const { toast } = useToast();

  const addMember = () => {
    setMembers([...members, { id: crypto.randomUUID(), email: "", role: "MEMBER" }]);
  };

  const removeMember = (id: string) => {
    if (members.length > 1) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const updateMember = (id: string, field: 'email' | 'role', value: string) => {
    setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleInvite = async () => {
    // Validate emails
    const validMembers = members.filter(m => m.email.trim() !== "");
    
    if (validMembers.length === 0) {
      toast({
        title: "No emails provided",
        description: "Please enter at least one email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const response: any = await api.inviteProjectMembers(
        projectId,
        validMembers.map(m => ({ email: m.email, role: m.role }))
      );

      setResults(response);

      if (response.success.length > 0) {
        toast({
          title: "Invitations sent",
          description: `Successfully sent ${response.success.length} invitation(s)`,
        });
      }

      if (response.errors.length > 0) {
        toast({
          title: "Some invitations failed",
          description: `${response.errors.length} invitation(s) could not be sent`,
          variant: "destructive"
        });
      }

      // If all successful, close dialog after a delay
      if (response.errors.length === 0) {
        setTimeout(() => {
          onOpenChange(false);
          setMembers([{ id: crypto.randomUUID(), email: "", role: "MEMBER" }]);
          setResults(null);
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: "Failed to send invitations",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setMembers([{ id: crypto.randomUUID(), email: "", role: "MEMBER" }]);
    setResults(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite members to {projectName}
          </DialogTitle>
          <DialogDescription>
            Send invitations to collaborate on this project. They'll receive an email with a link to join.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Member Invites */}
          <div className="space-y-3">
            {members.map((member, index) => (
              <div key={member.id} className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`email-${member.id}`} className="text-sm">
                    Email address {index === 0 && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id={`email-${member.id}`}
                      type="email"
                      placeholder="colleague@example.com"
                      value={member.email}
                      onChange={(e) => updateMember(member.id, 'email', e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="w-[140px] space-y-2">
                  <Label htmlFor={`role-${member.id}`} className="text-sm">
                    Role
                  </Label>
                  <Select
                    value={member.role}
                    onValueChange={(value) => updateMember(member.id, 'role', value)}
                  >
                    <SelectTrigger id={`role-${member.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIEWER">Viewer</SelectItem>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {members.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMember(member.id)}
                    className="hover:bg-red-50 hover:text-red-600 mb-0.5"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Add Another Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addMember}
            className="w-full"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add another member
          </Button>

          {/* Results */}
          {results && (
            <div className="space-y-2 pt-2">
              {results.success.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">Successfully sent</p>
                      <ul className="text-xs text-green-700 mt-1 space-y-0.5">
                        {results.success.map((msg, i) => (
                          <li key={i}>{msg}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {results.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900">Failed to send</p>
                      <ul className="text-xs text-red-700 mt-1 space-y-0.5">
                        {results.errors.map((msg, i) => (
                          <li key={i}>{msg}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleInvite}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Sending..." : "Send invitations"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
