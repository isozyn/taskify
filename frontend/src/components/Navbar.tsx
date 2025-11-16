
import { CheckSquare } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { ProfileDropdown } from "@/components/ProfileDropdown";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useUser();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-200">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")}>
            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-[#0052CC] to-[#0065FF] flex items-center justify-center shadow-sm">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Taskify</span>
          </div>

          {/* Spacer for centering */}
          <div className="flex-1"></div>


          {/* Right Side - Authenticated or Guest */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:inline-block text-sm font-medium text-slate-700">
                  Welcome, <span className="text-[#0052CC] font-semibold">{user?.name || user?.username}</span>
                </span>
                <ProfileDropdown />
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/auth")}
                  className="text-sm font-medium hidden sm:inline-flex text-slate-700 hover:text-slate-900 hover:bg-slate-100/80"
                >
                  Sign in
                </Button>
                <Button 
                  onClick={() => navigate("/auth")} 
                  className="bg-[#0052CC] hover:bg-[#0065FF] text-white text-sm font-medium px-4 h-9 rounded-md shadow-sm"
                >
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>


    </nav>
  );
};

export default Navbar;
