import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, ArrowLeft, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const CheckEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Get email from navigation state
  const email = location.state?.email || "your email";

  useEffect(() => {
    // If no email in state, redirect to auth
    if (!location.state?.email) {
      navigate("/auth");
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    try {
      // You'll need to implement a resend endpoint in your backend
      // For now, this is a placeholder
      toast({
        title: "Email sent",
        description: "Verification email has been resent. Please check your inbox.",
      });
      setResendCooldown(60); // 60 second cooldown
    } catch (error: any) {
      toast({
        title: "Failed to resend",
        description: error.message || "Failed to resend verification email",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-10">
        <button
          onClick={() => navigate("/auth")}
          className="flex items-center gap-2 text-[#0052CC] hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Login</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-16 sm:py-20">
        <div className="w-full max-w-[420px] text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0052CC] to-[#0065FF] flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-foreground mb-3">
            Check your email
          </h1>

          {/* Description */}
          <p className="text-muted-foreground mb-8">
            We've sent a verification link to <span className="font-medium text-foreground">{email}</span>.
            Click the link in the email to verify your account and get started.
          </p>

          {/* Resend Button */}
          <div className="bg-card border border-border/50 rounded-md p-4 mb-4">
            <p className="text-sm text-muted-foreground mb-3">
              Didn't receive the email? Check your spam folder or request a new one.
            </p>
            <Button
              onClick={handleResendEmail}
              disabled={isResending || resendCooldown > 0}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                "Sending..."
              ) : resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                "Resend verification email"
              )}
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-sm text-muted-foreground">
            Already verified?{" "}
            <button
              onClick={() => navigate("/auth")}
              className="text-[#0052CC] hover:underline font-medium"
            >
              Sign in
            </button>
          </p>

          {/* Use Different Account */}
          <p className="text-sm text-muted-foreground mt-3">
            Want to use a different account?{" "}
            <button
              onClick={() => navigate("/auth", { state: { mode: "register" } })}
              className="text-[#0052CC] hover:underline font-medium"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckEmail;
