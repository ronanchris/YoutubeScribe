import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import UrlForm from "@/components/url-form";
import SummaryResults from "@/components/summary-results";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSummary } from "@/lib/api";
import { SummaryWithScreenshots } from "@shared/schema";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<SummaryWithScreenshots | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const summaryMutation = useMutation({
    mutationFn: createSummary,
    onMutate: () => {
      setIsLoading(true);
      setSummary(null);
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
    <main className="container mx-auto px-4 py-6">
      <div className="mb-6 border-b border-slate-200">
        <div className="flex -mb-px">
          <button
            className="px-4 py-2 font-medium text-sm text-primary border-b-2 border-primary"
          >
            New Summary
          </button>
          <button
            className="px-4 py-2 font-medium text-sm text-slate-500 hover:text-slate-700"
            onClick={() => setLocation("/history")}
          >
            History
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <UrlForm onSubmit={handleSubmit} />

        {isLoading && (
          <Card className="bg-white shadow-sm border border-slate-200">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-slate-600 font-medium">Processing video content...</p>
                <p className="text-sm text-slate-500 mt-2">This may take a few moments depending on video length</p>
              </div>
            </CardContent>
          </Card>
        )}

        {summary && <SummaryResults summary={summary} />}
      </div>
    </main>
  );
}
