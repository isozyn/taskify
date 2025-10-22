import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Layers } from "lucide-react";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Auth logic will be implemented with backend API
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Auth logic will be implemented with backend API
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-amber-50/50 to-amber-100/30 p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 mb-6 shadow-premium">
            <Layers className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="heading-executive bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            CollabTrack
          </h1>
          <p className="text-executive mt-3">Executive Project Management Suite</p>
        </div>

        <Card className="premium-card border-0 bg-gradient-to-br from-card via-card to-card/90 shadow-premium">
          <CardHeader className="text-center pb-6">
            <CardTitle className="heading-premium">Welcome Back</CardTitle>
            <CardDescription className="text-executive">Access your executive dashboard</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="glass-effect border-0 p-1 mb-8 shadow-md">
                <TabsTrigger 
                  value="login"
                  className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  Create Account
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="login-email" className="text-sm font-semibold text-foreground">Email Address</Label>
                    <Input 
                      id="login-email" 
                      type="email" 
                      placeholder="executive@company.com" 
                      className="h-12 border-border/50 focus:border-primary/50 transition-all duration-300"
                      required 
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="login-password" className="text-sm font-semibold text-foreground">Password</Label>
                    <Input 
                      id="login-password" 
                      type="password" 
                      placeholder="••••••••" 
                      className="h-12 border-border/50 focus:border-primary/50 transition-all duration-300"
                      required 
                    />
                  </div>
                  <Button type="submit" className="btn-executive w-full h-12" disabled={isLoading}>
                    {isLoading ? "Authenticating..." : "Access Dashboard"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="signup-name" className="text-sm font-semibold text-foreground">Full Name</Label>
                    <Input 
                      id="signup-name" 
                      type="text" 
                      placeholder="John Executive" 
                      className="h-12 border-border/50 focus:border-primary/50 transition-all duration-300"
                      required 
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="signup-email" className="text-sm font-semibold text-foreground">Email Address</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="executive@company.com" 
                      className="h-12 border-border/50 focus:border-primary/50 transition-all duration-300"
                      required 
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="signup-password" className="text-sm font-semibold text-foreground">Password</Label>
                    <Input 
                      id="signup-password" 
                      type="password" 
                      placeholder="••••••••" 
                      className="h-12 border-border/50 focus:border-primary/50 transition-all duration-300"
                      required 
                    />
                  </div>
                  <Button type="submit" className="btn-executive w-full h-12" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create Executive Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
