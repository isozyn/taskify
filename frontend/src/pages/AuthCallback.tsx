import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CheckSquare, Loader2, AlertCircle } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { setUser } = useUser();
  const { toast } = useToast();
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent running multiple times
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      try {
        // Get tokens from URL hash (after #)
        const hash = window.location.hash.substring(1);
        console.log("[AuthCallback] URL hash:", hash ? "Present" : "Missing");
        
        const params = new URLSearchParams(hash);
        
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        
        console.log("[AuthCallback] Processing OAuth callback");
        console.log("[AuthCallback] Has access token:", !!accessToken);
        console.log("[AuthCallback] Has refresh token:", !!refreshToken);
        console.log("[AuthCallback] Full URL:", window.location.href);

        if (!accessToken || !refreshToken) {
          console.error("[AuthCallback] Missing tokens in URL hash");
          throw new Error('No authentication tokens received from Google');
        }

        // Store tokens in localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        console.log("[AuthCallback] Tokens stored in localStorage");
        console.log("[AuthCallback] Access token length:", accessToken.length);
        console.log("[AuthCallback] Refresh token length:", refreshToken.length);

        // Fetch user data using the access token
        try {
          const response = await api.getCurrentUser();
          
          if (response.user) {
            setUser(response.user);
            console.log("[AuthCallback] User data loaded:", response.user.email);
            
            setStatus("success");
            
            toast({
              title: "Welcome!",
              description: "Successfully signed in with Google",
            });

            // Redirect to dashboard after a brief delay
            setTimeout(() => {
              navigate("/dashboard", { replace: true });
            }, 1000);
          } else {
            throw new Error('Failed to load user data');
          }
        } catch (userError: any) {
          console.error("[AuthCallback] Failed to fetch user:", userError);
          throw new Error('Failed to load user profile');
        }
      } catch (error: any) {
        console.error("[AuthCallback] Error:", error);
        setStatus("error");
        setErrorMessage(error.message || "Authentication failed");
        
        toast({
          title: "Authentication Failed",
          description: error.message || "Failed to complete Google sign in",
          variant: "destructive",
        });

        // Redirect to auth page after delay
        setTimeout(() => {
          navigate("/auth?error=google_auth_failed", { replace: true });
        }, 3000);
      }
    };

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border/50 rounded-lg p-8 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0052CC] to-[#0065FF] flex items-center justify-center">
              <CheckSquare className="w-8 h-8 text-white" />
            </div>
          </div>

          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 animate-spin text-[#0052CC] mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Completing sign in...</h2>
              <p className="text-muted-foreground text-sm">
                Please wait while we set up your account
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-green-600 dark:text-green-400">
                Success!
              </h2>
              <p className="text-muted-foreground text-sm">
                Redirecting to your dashboard...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-red-600 dark:text-red-400">
                Authentication Failed
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                {errorMessage}
              </p>
              <p className="text-xs text-muted-foreground">
                Redirecting to sign in page...
              </p>
            </>
          )}
        </div>

        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-muted rounded-lg text-xs font-mono">
            <div className="font-semibold mb-2">Debug Info:</div>
            <div>Status: {status}</div>
            <div>Hash: {window.location.hash ? 'Present' : 'Missing'}</div>
            <div>Access Token: {localStorage.getItem('accessToken') ? 'Stored' : 'Missing'}</div>
            <div>Refresh Token: {localStorage.getItem('refreshToken') ? 'Stored' : 'Missing'}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
