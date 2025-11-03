import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckSquare, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, type AuthResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser } = useUser();

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await api.login({
        email: loginEmail,
        password: loginPassword,
        rememberMe: true,
      }) as AuthResponse;

      toast({
        title: "Success",
        description: response.message || "Logged in successfully",
      });

      // Store user data in context (tokens are in HttpOnly cookies)
      if (response.user) {
        setUser(response.user);
      }

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await api.register({
        name: signupName,
        username: signupUsername,
        email: signupEmail,
        password: signupPassword,
      }) as AuthResponse;

      toast({
        title: "Success",
        description: response.message || "Account created successfully. Please check your email to verify your account.",
      });

      // Redirect to check email page with email in state
      navigate("/check-email", { state: { email: signupEmail } });
    } catch (error: any) {
      const errorMessage = error.errors?.length 
        ? error.errors.map((e: any) => e.msg).join(", ")
        : error.message || "Failed to create account";
      
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button - Login Page (Blue) */}
      <div className="fixed top-4 left-4 z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#0052CC] hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-16 sm:py-20">
        <div className="w-full max-w-[340px]">
          {!isSignup ? (
            // Login Form
            <div>
              {/* Logo */}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0052CC] to-[#0065FF] flex items-center justify-center">
                  <CheckSquare className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-light text-center mb-4">Sign in to Taskify</h1>

              {/* Form Card */}
              <div className="bg-card border border-border/50 rounded-md p-4 mb-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-normal">
                      Username or email address
                    </Label>
                    <Input 
                      id="login-email" 
                      type="text" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="h-8 text-sm border-border/60 focus-visible:ring-1 focus-visible:ring-[#0052CC] focus-visible:border-[#0052CC] rounded-md"
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password" className="text-sm font-normal">
                        Password
                      </Label>
                      <button
                        type="button"
                        onClick={() => navigate("/forgot-password")}
                        className="text-xs text-[#0052CC] hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <Input 
                      id="login-password" 
                      type="password" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="h-8 text-sm border-border/60 focus-visible:ring-1 focus-visible:ring-[#0052CC] focus-visible:border-[#0052CC] rounded-md"
                      required 
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-8 bg-[#1a7f37] hover:bg-[#1a7f37]/90 text-white text-sm font-medium rounded-md shadow-sm"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </div>

              {/* Divider */}
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="space-y-3 mb-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-8 text-sm text-center font-medium border-border/60 hover:bg-accent/50 rounded-md"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
                
                {/* <Button
                  type="button"
                  variant="outline"
                  className="w-full h-8 text-sm font-medium border-border/60 hover:bg-accent/50 rounded-md"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Continue with Apple
                </Button> */}
              </div>

              {/* Sign up link */}
              <div className="border border-border/50 rounded-md p-4 text-center">
                <p className="text-sm">
                  New to Taskify?{" "}
                  <button
                    onClick={() => setIsSignup(true)}
                    className="text-[#0052CC] hover:underline font-medium"
                  >
                    Create an account
                  </button>
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Signup Page - Split Screen Layout */}
      {isSignup && (
        <div className="fixed inset-0 bg-background z-50">
          {/* Back Button - Signup Page (White) */}
          <div className="absolute top-4 left-4 z-20">
            <button
              onClick={() => setIsSignup(false)}
              className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>

          <div className="flex h-screen">
            {/* Left Side - Gradient Background */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0a0c10] via-[#1a1f35] to-[#0f1729] relative overflow-hidden items-center justify-center p-12">
              {/* Decorative stars/dots */}
              <div className="absolute inset-0">
                <div className="absolute top-20 left-20 w-1 h-1 bg-white/30 rounded-full"></div>
                <div className="absolute top-40 left-40 w-1 h-1 bg-white/40 rounded-full"></div>
                <div className="absolute top-60 right-40 w-1 h-1 bg-white/20 rounded-full"></div>
                <div className="absolute bottom-40 left-60 w-1 h-1 bg-white/30 rounded-full"></div>
                <div className="absolute bottom-60 right-20 w-1 h-1 bg-white/40 rounded-full"></div>
                <div className="absolute top-1/3 left-1/4 w-1 h-1 bg-white/50 rounded-full"></div>
                <div className="absolute top-1/4 right-1/3 w-0.5 h-0.5 bg-white/30 rounded-full"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 text-white max-w-md">
                <h2 className="text-3xl font-light mb-4">Create your free account</h2>
                <p className="text-white/70 mb-6">
                  Explore Taskify's core features for individuals and organizations.
                </p>
                
                {/* Animated circles/shapes like GitHub */}
                <div className="relative h-64 mt-12">
                  <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/40 to-pink-500/40 blur-2xl"></div>
                  <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/40 to-cyan-500/40 blur-2xl"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 blur-3xl"></div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 overflow-y-auto">
              <div className="w-full max-w-md pt-16">
                <h1 className="text-2xl font-normal mb-2 text-foreground">Sign up for Taskify</h1>

                {/* Social Signup */}
                <div className="space-y-2 mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 text-sm font-medium border-border/60 hover:bg-accent/50 rounded-md justify-center px-4"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>
                  
            
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-background px-3 text-muted-foreground font-medium">or</span>
                  </div>
                </div>

                {/* Signup Form */}
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-normal text-foreground">
                      Name<span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="signup-name" 
                      type="text"
                      placeholder="Full Name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="h-9 text-sm border-border/60 focus-visible:ring-2 focus-visible:ring-[#0052CC]/20 focus-visible:border-[#0052CC] rounded-md"
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-normal text-foreground">
                      Email<span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="signup-email" 
                      type="email"
                      placeholder="Email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="h-9 text-sm border-border/60 focus-visible:ring-2 focus-visible:ring-[#0052CC]/20 focus-visible:border-[#0052CC] rounded-md"
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="text-sm font-normal text-foreground">
                      Username<span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="signup-username" 
                      type="text"
                      placeholder="Username"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      className="h-9 text-sm border-border/60 focus-visible:ring-2 focus-visible:ring-[#0052CC]/20 focus-visible:border-[#0052CC] rounded-md"
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-normal text-foreground">
                      Password<span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="signup-password" 
                      type="password"
                      placeholder="Password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="h-9 text-sm border-border/60 focus-visible:ring-2 focus-visible:ring-[#0052CC]/20 focus-visible:border-[#0052CC] rounded-md"
                      required 
                    />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Password must be at least 8 characters with one uppercase, one lowercase, and one number.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      By creating an account, you agree to the{" "}
                      <a href="#" className="text-[#0052CC] hover:underline">
                        Terms of Service
                      </a>
                      . For more information about Taskify's privacy practices, see the{" "}
                      <a href="#" className="text-[#0052CC] hover:underline">
                        Privacy Statement
                      </a>
                      . We'll occasionally send you account-related emails.
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-10 bg-[#1a1f35] hover:bg-[#1a1f35]/90 text-white text-sm font-medium rounded-md shadow-sm mt-4"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create account"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer - Only show when not in signup mode */}
      {!isSignup && (
        <footer className="border-t border-border/40 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <a href="#" className="hover:text-[#0052CC] hover:underline">Terms</a>
              <a href="#" className="hover:text-[#0052CC] hover:underline">Privacy</a>
              <a href="#" className="hover:text-[#0052CC] hover:underline">Security</a>
              <a href="#" className="hover:text-[#0052CC] hover:underline">Contact</a>
              <a href="#" className="hover:text-[#0052CC] hover:underline">Docs</a>
            </div>
            <div className="text-center mt-2">
              <p className="text-xs text-muted-foreground">© 2025 Taskify, Inc.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Auth;
