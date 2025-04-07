import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import UrlForm from "@/components/url-form";
import SummaryResults from "@/components/summary-results";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSummary, getSummary } from "@/lib/api";
import type { SummaryWithScreenshots } from "../types";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<SummaryWithScreenshots | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  
  // Parse URL query parameters to get summary ID and screenshot flag
  const params = new URLSearchParams(window.location.search);
  const summaryId = params.get('id') ? parseInt(params.get('id')!, 10) : null;
  const showScreenshots = params.get('screenshots') === 'add';
  
  // Query to fetch existing summary if ID is provided
  const { data: existingSummary, isLoading: isLoadingExisting } = useQuery({
    queryKey: ['/api/summaries', summaryId],
    queryFn: () => getSummary(summaryId!),
    enabled: summaryId !== null
  });

  // Update summary state when query data changes
  useEffect(() => {
    if (existingSummary) {
      setSummary(existingSummary);
    }
  }, [existingSummary]);

  const summaryMutation = useMutation({
    mutationFn: createSummary,
    onMutate: () => {
      setIsLoading(true);
      setSummary(null);
      // Clear the id parameter from URL when creating a new summary
      if (summaryId) {
        setLocation('/', { replace: true });
      }
    },
    onSuccess: (data) => {
      setSummary(data);
      toast({
        title: "Summary generated!",
        description: "Your video summary is ready.",
      });
      // Invalidate summaries query to update history
      queryClient.invalidateQueries({ queryKey: ['/api/summaries'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate summary",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const handleSubmit = async (url: string) => {
    summaryMutation.mutate({ url });
  };

  return (
    <main className="container mx-auto px-4 py-6 pb-12">
      <div className="mb-6 border-b border-slate-200">
        <div className="flex -mb-px">
          <Link href="/"
            className="px-4 py-2 font-medium text-sm text-primary border-b-2 border-primary"
          >
            New Summary
          </Link>
          <Link href="/history"
            className="px-4 py-2 font-medium text-sm text-slate-500 hover:text-slate-700"
          >
            History
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {!summaryId && <UrlForm onSubmit={handleSubmit} />}

        {(isLoading || isLoadingExisting) && (
          <Card className="bg-white shadow-sm border border-slate-200">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-slate-600 font-medium">
                  {isLoadingExisting ? "Loading summary..." : "Processing video content..."}
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  {isLoadingExisting 
                    ? "Retrieving your saved summary" 
                    : "This may take a few moments depending on video length"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {summary && <SummaryResults summary={summary} initialShowScrubber={showScreenshots} />}
        
        {/* Show a "New Summary" button when viewing an existing summary */}
        {summaryId && summary && !isLoadingExisting && (
          <div className="flex justify-center mt-6">
            <Link href="/"
              className="bg-primary text-white px-5 py-3 rounded-md hover:bg-blue-700 transition-colors inline-block font-medium text-center shadow-sm"
            >
              Create New Summary
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
