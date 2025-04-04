import { User, LogOut, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
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

  // Don't show header on auth page
  if (location === "/auth") {
    return null;
  }

  return (
    <header className="bg-white shadow-sm">
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
            YTSummarizer
          </a>
        </Link>

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

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative flex items-center gap-2">
                <User className="h-5 w-5" />
                <span className="text-sm font-medium max-w-[100px] truncate">
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
      </div>
    </header>
  );
}
