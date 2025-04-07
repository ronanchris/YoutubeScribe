import { User, LogOut, Loader2, Menu, X, Home, History, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useRef } from "react";
import rcLogoPath from "../../assets/rc-logo.svg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on location change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Add click outside to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && 
          !event.target?.toString().includes('Button')) {
        setIsMobileMenuOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuRef]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  // Don't show header on auth page
  if (location === "/auth") {
    return null;
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/"
          className="text-xl font-bold text-slate-800 flex items-center cursor-pointer"
        >
          <img 
            src={rcLogoPath} 
            alt="RC Logo" 
            className="h-8 w-auto mr-2"
          />
          <span className={isMobile ? "sr-only" : ""}>YTSummarizer</span>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="flex gap-4 items-center">
            <Link href="/"
              className={`text-sm font-medium cursor-pointer ${location === "/" ? "text-primary" : "text-slate-700 hover:text-primary"}`}
            >
              Home
            </Link>
            <Link href="/history"
              className={`text-sm font-medium cursor-pointer ${location === "/history" ? "text-primary" : "text-slate-700 hover:text-primary"}`}
            >
              History
            </Link>
            {user?.isAdmin && (
              <Link href="/admin"
                className={`text-sm font-medium cursor-pointer ${location === "/admin" ? "text-primary" : "text-slate-700 hover:text-primary"}`}
              >
                Admin
              </Link>
            )}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {/* User Menu Dropdown */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative flex items-center gap-2 px-2 sm:px-4">
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium max-w-[80px] sm:max-w-[150px] truncate hidden sm:inline">
                    {user.username}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-center">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive justify-center"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-2 focus:outline-none" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobile && (
        <div 
          ref={mobileMenuRef}
          className={`absolute top-full left-0 right-0 bg-white border-t border-slate-100 py-3 shadow-md transform transition-transform duration-200 ease-in-out ${
            isMobileMenuOpen ? "translate-y-0" : "-translate-y-full h-0 py-0 overflow-hidden opacity-0"
          } z-40`}
        >
          <div className="container mx-auto px-4">
            <nav className="flex flex-col space-y-3">
              <Link href="/" 
                className={`flex items-center text-sm font-medium p-3 rounded-md cursor-pointer ${
                  location === "/" ? "bg-primary/10 text-primary" : "text-slate-700 hover:bg-slate-100"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="h-5 w-5 mr-3" />
                Home
              </Link>
              <Link href="/history" 
                className={`flex items-center text-sm font-medium p-3 rounded-md cursor-pointer ${
                  location === "/history" ? "bg-primary/10 text-primary" : "text-slate-700 hover:bg-slate-100"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <History className="h-5 w-5 mr-3" />
                History
              </Link>
              {user?.isAdmin && (
                <Link href="/admin" 
                  className={`flex items-center text-sm font-medium p-3 rounded-md cursor-pointer ${
                    location === "/admin" ? "bg-primary/10 text-primary" : "text-slate-700 hover:bg-slate-100"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="h-5 w-5 mr-3" />
                  Admin
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
