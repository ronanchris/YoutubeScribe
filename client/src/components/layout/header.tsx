import { User, LogOut, Loader2, Menu, Home, History, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
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
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Don't show header on auth page
  if (location === "/auth") {
    return null;
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <a className="text-xl font-bold text-slate-800 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary mr-2"
            >
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
              <line x1="10" y1="2" x2="10" y2="22" />
              <line x1="10" y1="12" x2="22" y2="12" />
              <path d="M14 6l2 2l-2 2" />
              <path d="M14 18l2-2l-2-2" />
              <path d="M20 14l-2 2l-2-2" />
              <path d="M20 8l-2-2l-2 2" />
            </svg>
            <span className={isMobile ? "sr-only" : ""}>YTSummarizer</span>
          </a>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="flex gap-4 items-center">
            <Link href="/">
              <a className={`text-sm font-medium ${location === "/" ? "text-primary" : "text-slate-700 hover:text-primary"}`}>
                Home
              </a>
            </Link>
            <Link href="/history">
              <a className={`text-sm font-medium ${location === "/history" ? "text-primary" : "text-slate-700 hover:text-primary"}`}>
                History
              </a>
            </Link>
            {user?.isAdmin && (
              <Link href="/admin">
                <a className={`text-sm font-medium ${location === "/admin" ? "text-primary" : "text-slate-700 hover:text-primary"}`}>
                  Admin
                </a>
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
                  <span className="text-sm font-medium max-w-[80px] sm:max-w-[100px] truncate hidden sm:inline">
                    {user.username}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive"
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
              className="ml-2" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobile && isMobileMenuOpen && (
        <div className="bg-white border-t border-slate-100 py-2 shadow-md">
          <div className="container mx-auto px-4">
            <nav className="flex flex-col space-y-2">
              <Link href="/">
                <a 
                  className={`flex items-center text-sm font-medium p-2 rounded-md ${
                    location === "/" ? "bg-primary/10 text-primary" : "text-slate-700 hover:bg-slate-100"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home className="h-5 w-5 mr-2" />
                  Home
                </a>
              </Link>
              <Link href="/history">
                <a 
                  className={`flex items-center text-sm font-medium p-2 rounded-md ${
                    location === "/history" ? "bg-primary/10 text-primary" : "text-slate-700 hover:bg-slate-100"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <History className="h-5 w-5 mr-2" />
                  History
                </a>
              </Link>
              {user?.isAdmin && (
                <Link href="/admin">
                  <a 
                    className={`flex items-center text-sm font-medium p-2 rounded-md ${
                      location === "/admin" ? "bg-primary/10 text-primary" : "text-slate-700 hover:bg-slate-100"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5 mr-2" />
                    Admin
                  </a>
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
