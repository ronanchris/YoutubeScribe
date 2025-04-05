import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getSummaries, getAllSummaries } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import HistoryCard from "@/components/history-card";
import { Search, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function History() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth() || { user: null };
  const isAdmin = user?.isAdmin || false;
  
  // Use different API calls based on user role
  const { data: standardSummaries, isLoading: isLoadingStandard, error: standardError } = useQuery({
    queryKey: ['/api/summaries'],
    queryFn: getSummaries,
    enabled: !isAdmin, // Only run this query for non-admin users
  });
  
  // Admin users get all summaries
  const { data: adminSummaries, isLoading: isLoadingAdmin, error: adminError } = useQuery({
    queryKey: ['/api/admin/summaries'],
    queryFn: getAllSummaries,
    enabled: isAdmin, // Only run this query for admin users
  });
  
  // Combine results and loading states
  const summaries = isAdmin ? adminSummaries : standardSummaries;
  const isLoading = isAdmin ? isLoadingAdmin : isLoadingStandard;
  const error = isAdmin ? adminError : standardError;
  
  // Add debug logging for admin status
  console.log("User is admin:", isAdmin);
  console.log("Summaries count:", summaries?.length || 0);

  // Filter summaries based on search term
  const filteredSummaries = summaries?.filter(summary => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      summary.videoTitle.toLowerCase().includes(term) ||
      summary.videoAuthor.toLowerCase().includes(term)
    );
  });

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="mb-6 border-b border-slate-200">
        <div className="flex -mb-px">
          <button
            className="px-4 py-2 font-medium text-sm text-slate-500 hover:text-slate-700"
            onClick={() => setLocation("/")}
          >
            New Summary
          </button>
          <button
            className="px-4 py-2 font-medium text-sm text-primary border-b-2 border-primary"
          >
            History
          </button>
        </div>
      </div>

      <Card className="bg-white shadow-sm border border-slate-200 mb-6">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800">
              {isAdmin ? 'All Summaries (Admin View)' : 'Your Summary History'}
            </h2>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search history..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="h-4 w-4 text-slate-400 absolute left-2 top-3" />
            </div>
          </div>

          {isLoading ? (
            <div className="py-10 text-center">
              <div className="animate-spin inline-block h-8 w-8 border-b-2 border-primary mb-2"></div>
              <p className="text-slate-600">Loading your summaries...</p>
            </div>
          ) : error ? (
            <div className="py-10 text-center text-red-500">
              Failed to load summaries. Please try again.
            </div>
          ) : filteredSummaries && filteredSummaries.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSummaries.map((summary) => (
                <HistoryCard key={summary.id} summary={summary} />
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-500">
              {searchTerm ? (
                <p>No summaries match your search.</p>
              ) : (
                <p>No summaries yet. Create your first summary!</p>
              )}
            </div>
          )}

          {filteredSummaries && filteredSummaries.length > 0 && (
            <div className="mt-4 flex justify-center">
              <Button variant="ghost" className="text-primary hover:text-blue-700">
                <ChevronDown className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Load More</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
