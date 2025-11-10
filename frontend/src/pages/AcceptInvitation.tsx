import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Users, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";

const AcceptInvitation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [invitationDetails, setInvitationDetails] = useState<{
    email: string;
    projectName: string;
  } | null>(null);

  const email = searchParams.get('email');
  const projectName = searchParams.get('project');

  useEffect(() => {
    const checkUserAndInvitation = async () => {
      setIsLoading(true);
      
      if (!email || !projectName) {
        navigate('/');
        return;
      }

      try {
        // Check if user is already logged in
        const userResponse: any = await api.getCurrentUser();
        setCurrentUser(userResponse.user);
        
        // If logged in user email matches invitation email, they can proceed
        if (userResponse.user.email === email) {
          setInvitationDetails({ email, projectName });
        } else {
          // Different user is logged in, they need to logout first
          setInvitationDetails({ email, projectName });
        }
      } catch (error) {
        // User not logged in, show invitation details
        setInvitationDetails({ email, projectName });
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAndInvitation();
  }, [email, projectName, navigate]);

  const handleAcceptInvitation = async () => {
    if (currentUser && currentUser.email === email) {
      // User is logged in with correct email, accept invitation
      try {
        setIsLoading(true);
        const role = searchParams.get('role') || 'MEMBER';
        const result: any = await api.acceptProjectInvitation(projectName!, role);
        
        if (result.success && result.projectId) {
          // Redirect to the project board
          navigate(`/project/${result.projectId}`);
        } else {
          // Fallback to projects page
          navigate('/projects');
        }
      } catch (error: any) {
        console.error('Failed to accept invitation:', error);
        // Still redirect to projects page on error
        navigate('/projects');
      } finally {
        setIsLoading(false);
      }
    } else if (currentUser) {
      // Different user logged in, logout first
      api.logout().then(() => {
        navigate(`/login?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(window.location.href)}`);
      });
    } else {
      // No user logged in, go to login/register
      navigate(`/login?email=${encodeURIComponent(email)}&message=${encodeURIComponent(`You've been invited to join "${projectName}". Please log in or create an account to continue.`)}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-12 mt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Loading invitation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!invitationDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-12 mt-16">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
              <CardDescription>
                This invitation link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/')}>
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-6 py-12 mt-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            You're Invited!
          </h1>
          <p className="text-lg text-slate-600">
            Join your team on Taskify and start collaborating
          </p>
        </div>

        <Card className="border-2 border-slate-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl">
              Join "{invitationDetails.projectName}"
            </CardTitle>
            <CardDescription className="text-base">
              You've been invited to collaborate on this project
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Invitation sent to:</p>
                  <p className="text-slate-900 font-semibold">{invitationDetails.email}</p>
                </div>
              </div>
            </div>

            {currentUser && currentUser.email !== invitationDetails.email && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-800 mb-1">
                      Different Account
                    </p>
                    <p className="text-sm text-yellow-700">
                      You're currently logged in as {currentUser.email}. You'll need to log out and sign in with {invitationDetails.email} to accept this invitation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentUser && currentUser.email === invitationDetails.email && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Ready to join!</p>
                    <p className="text-sm text-green-700">
                      You're logged in with the correct account.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button 
              onClick={handleAcceptInvitation}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
              size="lg"
            >
              {currentUser && currentUser.email === invitationDetails.email ? (
                <>
                  Accept Invitation & Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : currentUser ? (
                <>
                  Switch Account & Accept
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Sign In to Accept Invitation
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <p className="text-xs text-slate-500 text-center">
              By accepting this invitation, you'll gain access to the project and can start collaborating with your team.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AcceptInvitation;