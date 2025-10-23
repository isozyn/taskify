import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Layers, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

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

  // Simulate token validation
  // In production, you'd validate the token with your backend
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

    setIsLoading(true);
    
    // Simulate resetting password
    // In production, this would call your backend API with the token and new password
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-amber-50/50 to-amber-100/30 p-6 relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 flex items-center gap-2 hover:bg-primary/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back to Home</span>
        </Button>

        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-destructive/10 mb-6">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">Invalid Reset Link</h1>
            <p className="text-foreground/70">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => navigate("/forgot-password")}
              className="btn-executive flex-1 h-12"
            >
              Request New Link
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/auth")}
              className="flex-1 h-12 border-border/50 hover:bg-muted/50"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-amber-50/50 to-amber-100/30 p-6 relative">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/auth")}
        className="absolute top-6 left-6 flex items-center gap-2 hover:bg-primary/10 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-medium">Back to Login</span>
      </Button>

      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 mb-6 shadow-premium">
            <Layers className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="heading-executive bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Taskify
          </h1>
          <p className="text-executive mt-3">Create New Password</p>
        </div>

        <Card className="premium-card border-0 bg-gradient-to-br from-card via-card to-card/90 shadow-premium">
          <CardHeader className="text-center pb-6">
            {!isSubmitted ? (
              <>
                <CardTitle className="heading-premium">Reset Password</CardTitle>
                <CardDescription className="text-executive">
                  Enter a new password for your account
                </CardDescription>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-success" />
                  </div>
                </div>
                <CardTitle className="heading-premium">Password Reset Successful</CardTitle>
                <CardDescription className="text-executive">
                  Your password has been successfully reset
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="px-8 pb-8">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive font-medium">{error}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="new-password" className="text-sm font-semibold text-foreground">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 border-border/50 focus:border-primary/50 transition-all duration-300 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="confirm-new-password" className="text-sm font-semibold text-foreground">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-new-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 border-border/50 focus:border-primary/50 transition-all duration-300 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 space-y-2">
                  <p className="text-xs font-semibold text-foreground">Password requirements:</p>
                  <ul className="space-y-1 text-xs text-foreground/70">
                    <li className="flex items-center gap-2">
                      <span className={password.length >= 8 ? "text-success" : "text-foreground/50"}>✓</span>
                      At least 8 characters
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={/[A-Z]/.test(password) ? "text-success" : "text-foreground/50"}>✓</span>
                      At least one uppercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={/[0-9]/.test(password) ? "text-success" : "text-foreground/50"}>✓</span>
                      At least one number
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={password === confirmPassword && password.length > 0 ? "text-success" : "text-foreground/50"}>✓</span>
                      Passwords match
                    </li>
                  </ul>
                </div>

                <Button type="submit" className="btn-executive w-full h-12" disabled={isLoading}>
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-success/5 border border-success/10 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium text-foreground">Your password has been updated successfully!</p>
                  <p className="text-sm text-foreground/70">
                    You can now log in with your new password.
                  </p>
                </div>

                <Button
                  onClick={() => navigate("/auth")}
                  className="btn-executive w-full h-12"
                >
                  Back to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
