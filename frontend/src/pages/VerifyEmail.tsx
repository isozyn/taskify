import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckSquare, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("No verification token provided");
        return;
      }

      try {
        const response = await api.verifyEmail(token) as any;
        setStatus("success");
        setMessage(response.message || "Email verified successfully!");
        
        toast({
          title: "Success",
          description: "Your email has been verified. Redirecting to dashboard...",
        });

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "Failed to verify email");
        
        toast({
          title: "Verification Failed",
          description: error.message || "Invalid or expired verification link",
          variant: "destructive",
        });
      }
    };

    verifyEmail();
  }, [token, navigate, toast]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-16 sm:py-20 mt-16">
        <div className="w-full max-w-[420px] text-center">
          {status === "loading" && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[#0052CC] animate-spin" />
                </div>
              </div>
              <h1 className="text-2xl font-normal text-foreground mb-3">Verifying your email...</h1>
              <p className="text-muted-foreground">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-normal text-foreground mb-3">Email verified!</h1>
              <p className="text-muted-foreground mb-6">
                {message}
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting you to the dashboard...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <h1 className="text-2xl font-normal text-foreground mb-3">Verification failed</h1>
              <p className="text-muted-foreground mb-8">
                {message}
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/auth")}
                  className="w-full h-10 bg-[#0052CC] hover:bg-[#0065FF] text-white text-sm font-medium rounded-md"
                >
                  Go to Login
                </Button>
                <Button
                  onClick={() => navigate("/")}
                  variant="outline"
                  className="w-full h-10 text-sm font-medium border-border/60 hover:bg-accent/50 rounded-md"
                >
                  Back to Home
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
