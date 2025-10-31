import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckSquare, ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, type MessageResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await api.forgotPassword(email) as MessageResponse;
      setIsSubmitted(true);
      toast({
        title: "Success",
        description: response.message || "Password reset link sent to your email",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset link",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-normal text-foreground mb-2">Forgot your password?</h1>
                <p className="text-muted-foreground">
                  No worries! Enter your email and we'll send you a link to reset it.
                </p>
              </div>

              <div className="bg-card border border-border/50 rounded-md p-6 mb-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-sm font-normal text-foreground">
                      Email address
                    </Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-9 text-sm border-border/60 focus-visible:ring-2 focus-visible:ring-[#0052CC]/20 focus-visible:border-[#0052CC] rounded-md"
                      required
                    />
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    We'll send you an email with a secure link to reset your password. The link will expire in 1 hour for your security.
                  </p>

                  <Button 
                    type="submit" 
                    className="w-full h-10 bg-[#0052CC] hover:bg-[#0065FF] text-white text-sm font-medium rounded-md shadow-sm mt-6"
                    disabled={isLoading || !email}
                  >
                    {isLoading ? "Sending..." : "Send reset link"}
                  </Button>
                </form>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <button
                    onClick={() => navigate("/auth")}
                    className="text-[#0052CC] hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </p>
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
                <h1 className="text-3xl font-normal text-foreground mb-2">Check your email</h1>
                <p className="text-muted-foreground">
                  We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>

              <div className="bg-card border border-border/50 rounded-md p-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-3">What to do next:</p>
                    <ol className="space-y-3">
                      <li className="flex gap-3 text-sm">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0052CC]/10 text-[#0052CC] flex items-center justify-center text-xs font-medium">1</span>
                        <span className="text-muted-foreground">Check your email inbox (including spam)</span>
                      </li>
                      <li className="flex gap-3 text-sm">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0052CC]/10 text-[#0052CC] flex items-center justify-center text-xs font-medium">2</span>
                        <span className="text-muted-foreground">Click the password reset link</span>
                      </li>
                      <li className="flex gap-3 text-sm">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0052CC]/10 text-[#0052CC] flex items-center justify-center text-xs font-medium">3</span>
                        <span className="text-muted-foreground">Create a new password</span>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate("/auth")}
                className="w-full h-10 bg-[#0052CC] hover:bg-[#0065FF] text-white text-sm font-medium rounded-md shadow-sm mb-3"
              >
                Back to sign in
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email?{" "}
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail("");
                    }}
                    className="text-[#0052CC] hover:underline font-medium"
                  >
                    Try again
                  </button>
                </p>
              </div>
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

export default ForgotPassword;
