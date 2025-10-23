import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Layers, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate sending reset email
    // In production, this would call your backend API
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

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
          <p className="text-executive mt-3">Reset Your Password</p>
        </div>

        <Card className="premium-card border-0 bg-gradient-to-br from-card via-card to-card/90 shadow-premium">
          <CardHeader className="text-center pb-6">
            {!isSubmitted ? (
              <>
                <CardTitle className="heading-premium">Forgot Password?</CardTitle>
                <CardDescription className="text-executive">
                  Enter your email address and we'll send you a link to reset your password.
                </CardDescription>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-success" />
                  </div>
                </div>
                <CardTitle className="heading-premium">Check Your Email</CardTitle>
                <CardDescription className="text-executive">
                  We've sent a password reset link to {email}
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="px-8 pb-8">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="reset-email" className="text-sm font-semibold text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="executive@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 border-border/50 focus:border-primary/50 transition-all duration-300"
                    required
                  />
                </div>
                <p className="text-xs text-foreground/60">
                  You'll receive an email with instructions to reset your password. The link will expire in 1 hour for security.
                </p>
                <Button type="submit" className="btn-executive w-full h-12" disabled={isLoading || !email}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium text-foreground">What happens next:</p>
                  <ul className="space-y-2 text-sm text-foreground/70">
                    <li className="flex items-start gap-3">
                      <span className="text-primary font-bold">1.</span>
                      <span>Check your email (including spam folder)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary font-bold">2.</span>
                      <span>Click the reset link in the email</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary font-bold">3.</span>
                      <span>Create a new password</span>
                    </li>
                  </ul>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => navigate("/auth")}
                  className="w-full h-12 border-border/50 hover:bg-muted/50 transition-all duration-300"
                >
                  Return to Login
                </Button>

                <div className="text-center">
                  <p className="text-sm text-foreground/60">
                    Didn't receive the email?{" "}
                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setEmail("");
                      }}
                      className="text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Try again
                    </button>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
