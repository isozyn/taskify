
import { CheckSquare, Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Only show nav links on the landing page
  const isLandingPage = location.pathname === "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-200">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-[#0052CC] to-[#0065FF] flex items-center justify-center shadow-sm">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Taskify</span>
          </div>

          {/* Desktop Navigation - Only on landing page */}
          {isLandingPage && (
            <div className="hidden lg:flex items-center gap-1">
              <button className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
                Products
              </button>
              <button className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
                Solutions
              </button>
              <button className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
                Teams
              </button>
              <button className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
                Resources
              </button>
              <button className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
                Pricing
              </button>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/auth")}
              className="text-sm font-medium hidden sm:inline-flex hover:bg-slate-100"
            >
              Sign in
            </Button>
            <Button 
              onClick={() => navigate("/auth")} 
              className="bg-[#0052CC] hover:bg-[#0065FF] text-white text-sm font-medium px-4 h-9 rounded-md shadow-sm"
            >
              Get it free
            </Button>
            {isLandingPage && (
              <button 
                className="lg:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu - Only on landing page */}
      {isLandingPage && mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-lg">
          <div className="px-4 py-4 space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
              Products
            </button>
            <button className="w-full text-left px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
              Solutions
            </button>
            <button className="w-full text-left px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
              Teams
            </button>
            <button className="w-full text-left px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
              Resources
            </button>
            <button className="w-full text-left px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
              Pricing
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
