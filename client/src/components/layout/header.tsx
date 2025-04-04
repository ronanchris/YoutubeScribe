import { User } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-800 flex items-center">
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
        </h1>
        <div className="flex items-center">
          <User className="h-5 w-5 text-slate-500 mr-2" />
          <span className="text-sm font-medium text-slate-700">Personal Workspace</span>
        </div>
      </div>
    </header>
  );
}
