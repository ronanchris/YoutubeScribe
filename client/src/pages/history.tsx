import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getSummaries, getAllSummaries, getNonAdminSummaries } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import HistoryCard from "@/components/history-card";
import { Search, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function History() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("my-summaries");
  const { user } = useAuth() || { user: null };
  const isAdmin = user?.isAdmin || false;
  
  // Use different API calls based on user role
  const { data: standardSummaries, isLoading: isLoadingStandard, error: standardError, refetch: refetchStandard } = useQuery({
    queryKey: ['/api/summaries'],
    queryFn: getSummaries,
    // Force a refresh when component mounts to ensure latest data
    refetchOnMount: true
  });
  
  // Admin users also get all summaries for the "All Users" tab
  const { data: adminSummaries, isLoading: isLoadingAdmin, error: adminError, refetch: refetchAdmin } = useQuery({
    queryKey: ['/api/admin/summaries'],
    queryFn: getAllSummaries,
    enabled: isAdmin, // Only run this query for admin users
    // Force a refresh when component mounts to ensure latest data
    refetchOnMount: true
  });
  
  // Get non-admin user summaries for the "Other Users" tab
  const { data: nonAdminSummaries, isLoading: isLoadingNonAdmin, error: nonAdminError, refetch: refetchNonAdmin } = useQuery({
    queryKey: ['/api/admin/summaries/non-admin'],
    queryFn: getNonAdminSummaries,
    enabled: isAdmin, // Only run this query for admin users
    // Force a refresh when component mounts to ensure latest data
    refetchOnMount: true
  });
  
  // Effect to refetch data when component mounts
  useEffect(() => {
    // Force a refresh of the appropriate data
    refetchStandard();
    if (isAdmin) {
      refetchAdmin();
      refetchNonAdmin();
    }
  }, [refetchStandard, refetchAdmin, refetchNonAdmin, isAdmin]);
  
  // Determine which summaries to display based on active tab and user role
  let summaries = standardSummaries;
  let isLoading = isLoadingStandard;
  let error = standardError;
  
  if (isAdmin) {
    if (activeTab === "my-summaries") {
      // Filter admin summaries to only show the current admin's summaries
      summaries = adminSummaries?.filter(s => s.userId === user?.id);
      isLoading = isLoadingAdmin;
      error = adminError;
    } else if (activeTab === "other-users") {
      summaries = nonAdminSummaries;
      isLoading = isLoadingNonAdmin;
      error = nonAdminError;
    } else if (activeTab === "all-summaries") {
      summaries = adminSummaries;
      isLoading = isLoadingAdmin;
      error = adminError;
    }
  }
  
  // Debug logging
  console.log("User is admin:", isAdmin);
  console.log("Active tab:", activeTab);
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
      <div className="mb-6 border-b border-slate-200 overflow-x-auto">
        <div className="flex -mb-px">
          <button
            className="px-4 py-2 font-medium text-sm text-slate-500 hover:text-slate-700 whitespace-nowrap"
            onClick={() => setLocation("/")}
          >
            New Summary
          </button>
          <button
            className="px-4 py-2 font-medium text-sm text-primary border-b-2 border-primary whitespace-nowrap"
          >
            History
          </button>
        </div>
      </div>

      <Card className="bg-white shadow-sm border border-slate-200 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold text-slate-800">
              {isAdmin ? 'Summaries (Admin View)' : 'Your Summary History'}
            </h2>
            <div className="relative w-full sm:w-auto">
              <Input
                type="text"
                placeholder="Search history..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="h-4 w-4 text-slate-400 absolute left-2 top-3" />
            </div>
          </div>
          
          {isAdmin ? (
            <Tabs defaultValue="my-summaries" className="mb-4" onValueChange={setActiveTab} value={activeTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="my-summaries">My Summaries</TabsTrigger>
                <TabsTrigger value="other-users">Other Users</TabsTrigger>
                <TabsTrigger value="all-summaries">All Summaries</TabsTrigger>
              </TabsList>
              
              <TabsContent value="my-summaries" className="pt-4">
                <h3 className="text-sm font-medium text-slate-500 mb-3">
                  Your personal summaries
                </h3>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              </TabsContent>
              
              <TabsContent value="other-users" className="pt-4">
                <h3 className="text-sm font-medium text-slate-500 mb-3">
                  Summaries created by non-admin users
                </h3>
                {isLoading ? (
                  <div className="py-10 text-center">
                    <div className="animate-spin inline-block h-8 w-8 border-b-2 border-primary mb-2"></div>
                    <p className="text-slate-600">Loading summaries...</p>
                  </div>
                ) : error ? (
                  <div className="py-10 text-center text-red-500">
                    Failed to load summaries. Please try again.
                  </div>
                ) : filteredSummaries && filteredSummaries.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSummaries.map((summary) => (
                      <HistoryCard key={summary.id} summary={summary} />
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center text-slate-500">
                    {searchTerm ? (
                      <p>No summaries match your search.</p>
                    ) : (
                      <p>No summaries from non-admin users yet.</p>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="all-summaries" className="pt-4">
                <h3 className="text-sm font-medium text-slate-500 mb-3">
                  All summaries from all users
                </h3>
                {isLoading ? (
                  <div className="py-10 text-center">
                    <div className="animate-spin inline-block h-8 w-8 border-b-2 border-primary mb-2"></div>
                    <p className="text-slate-600">Loading summaries...</p>
                  </div>
                ) : error ? (
                  <div className="py-10 text-center text-red-500">
                    Failed to load summaries. Please try again.
                  </div>
                ) : filteredSummaries && filteredSummaries.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSummaries.map((summary) => (
                      <HistoryCard key={summary.id} summary={summary} />
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center text-slate-500">
                    {searchTerm ? (
                      <p>No summaries match your search.</p>
                    ) : (
                      <p>No summaries yet.</p>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            // Regular user view - no tabs
            <>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            </>
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