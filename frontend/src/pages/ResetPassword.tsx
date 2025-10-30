import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckSquare, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff, Lock } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api, type MessageResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { toast } = useToast();

  // Validate token exists
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
    }
  }, [token]);

  const validatePasswords = () => {
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return false;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }

    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await api.resetPassword(token, password) as MessageResponse;
      setIsSubmitted(true);
      toast({
        title: "Success",
        description: response.message || "Password reset successfully",
      });
    } catch (error: any) {
      const errorMessage = error.message || "Failed to reset password";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // If token is invalid/expired, mark as invalid
      if (errorMessage.includes("Invalid") || errorMessage.includes("expired")) {
        setTokenValid(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="flex items-center justify-center px-4 py-16 sm:py-20 mt-16">
          <div className="w-full max-w-[420px] text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-normal text-foreground mb-3">Link expired or invalid</h1>
            <p className="text-muted-foreground mb-8">
              This password reset link is no longer valid. It may have expired or was already used. Request a new one to reset your password.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => navigate("/forgot-password")}
                className="w-full h-10 bg-[#0052CC] hover:bg-[#0065FF] text-white text-sm font-medium rounded-md shadow-sm"
              >
                Request new link
              </Button>
              <Button
                onClick={() => navigate("/auth")}
                variant="outline"
                className="w-full h-10 text-sm font-medium border-border/60 hover:bg-accent/50 rounded-md"
              >
                Back to login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-16 sm:py-20 mt-16">
        <div className="w-full max-w-[420px]">
          {!isSubmitted ? (
            // Form State
            <div>
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-md bg-gradient-to-br from-[#0052CC] to-[#0065FF] flex items-center justify-center">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-normal text-foreground mb-2">Create new password</h1>
                <p className="text-muted-foreground">
                  Create a strong password for your account. Make sure it's different from your previous password.
                </p>
              </div>

              <div className="bg-card border border-border/50 rounded-md p-6 mb-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 flex gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm font-normal text-foreground">
                      New password
                    </Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-9 text-sm border-border/60 focus-visible:ring-2 focus-visible:ring-[#0052CC]/20 focus-visible:border-[#0052CC] rounded-md pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password" className="text-sm font-normal text-foreground">
                      Confirm password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-new-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-9 text-sm border-border/60 focus-visible:ring-2 focus-visible:ring-[#0052CC]/20 focus-visible:border-[#0052CC] rounded-md pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-muted/50 border border-border/40 rounded-md p-4 space-y-3 mt-6">
                    <p className="text-xs font-semibold text-foreground">Password requirements:</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-xs">
                        <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium ${password.length >= 8 ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}>
                          {password.length >= 8 ? "✓" : "○"}
                        </span>
                        <span className={password.length >= 8 ? "text-foreground" : "text-muted-foreground"}>
                          At least 8 characters
                        </span>
                      </li>
                      <li className="flex items-center gap-2 text-xs">
                        <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium ${/[A-Z]/.test(password) ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}>
                          {/[A-Z]/.test(password) ? "✓" : "○"}
                        </span>
                        <span className={/[A-Z]/.test(password) ? "text-foreground" : "text-muted-foreground"}>
                          At least one uppercase letter
                        </span>
                      </li>
                      <li className="flex items-center gap-2 text-xs">
                        <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium ${/[0-9]/.test(password) ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}>
                          {/[0-9]/.test(password) ? "✓" : "○"}
                        </span>
                        <span className={/[0-9]/.test(password) ? "text-foreground" : "text-muted-foreground"}>
                          At least one number
                        </span>
                      </li>
                      <li className="flex items-center gap-2 text-xs">
                        <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium ${password === confirmPassword && password.length > 0 ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}>
                          {password === confirmPassword && password.length > 0 ? "✓" : "○"}
                        </span>
                        <span className={password === confirmPassword && password.length > 0 ? "text-foreground" : "text-muted-foreground"}>
                          Passwords match
                        </span>
                      </li>
                    </ul>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-10 bg-[#0052CC] hover:bg-[#0065FF] text-white text-sm font-medium rounded-md shadow-sm mt-6"
                    disabled={isLoading}
                  >
                    {isLoading ? "Resetting password..." : "Reset password"}
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            // Success State
            <div>
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h1 className="text-3xl font-normal text-foreground mb-2">Password updated</h1>
                <p className="text-muted-foreground">
                  Your password has been successfully reset. You can now sign in with your new password.
                </p>
              </div>

              <div className="bg-card border border-border/50 rounded-md p-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-foreground">Password changed</p>
                      <p className="text-xs text-muted-foreground">Your old password is no longer valid</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-foreground">Ready to sign in</p>
                      <p className="text-xs text-muted-foreground">Use your new password to log in</p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate("/auth")}
                className="w-full h-10 bg-[#0052CC] hover:bg-[#0065FF] text-white text-sm font-medium rounded-md shadow-sm"
              >
                Back to sign in
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <a href="#" className="hover:text-[#0052CC] hover:underline">Terms</a>
            <a href="#" className="hover:text-[#0052CC] hover:underline">Privacy</a>
            <a href="#" className="hover:text-[#0052CC] hover:underline">Security</a>
            <a href="#" className="hover:text-[#0052CC] hover:underline">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ResetPassword;
