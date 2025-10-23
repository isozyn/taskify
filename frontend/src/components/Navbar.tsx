import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Layers, User, LogOut, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  showBackButton?: boolean;
  backButtonPath?: string;
  subtitle?: string;
}

const Navbar = ({ showBackButton = false, backButtonPath = "/dashboard", subtitle = "Executive Project Management" }: NavbarProps) => {
  const navigate = useNavigate();

  // Mock user data - will be replaced with real data from backend/context
  const currentUser = {
    name: "John Doe",
    email: "john.doe@company.com",
    initials: "JD"
  };

  return (
    <header className="glass-effect border-b border-border/30 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(backButtonPath)}
                className="w-10 h-10 rounded-lg hover:bg-muted/50 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center shadow-lg">
              <Layers className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Taskify</h1>
              <p className="text-sm text-muted-foreground font-medium">{subtitle}</p>
            </div>
          </div>
          
          {/* User Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-10 w-10 rounded-full ring-2 ring-border/50 hover:ring-primary/50 transition-all duration-300"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                    {currentUser.initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 glass-effect" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer focus:bg-primary/10"
                onClick={() => navigate("/profile")}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer focus:bg-destructive/10 text-destructive focus:text-destructive"
                onClick={() => navigate("/auth")}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
