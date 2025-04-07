import { useState } from "react";
import type { SummaryWithScreenshots } from "../types";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import axios from "axios";

interface TranscriptExporterProps {
  summary: SummaryWithScreenshots;
  onSummaryUpdate?: (updatedSummary: SummaryWithScreenshots) => void;
}

export default function TranscriptExporter({ summary, onSummaryUpdate }: TranscriptExporterProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const downloadTranscript = () => {
    if (!summary.transcript) return;
    
    setIsExporting(true);
    
    try {
      // Create a download link
      const element = document.createElement("a");
      const file = new Blob([summary.transcript], {type: 'text/markdown'});
      element.href = URL.createObjectURL(file);
      element.download = `transcript-${summary.videoId}.md`;
      document.body.appendChild(element);
      
      // Click to trigger download
      element.click();
      
      // Clean up
      document.body.removeChild(element);
      setIsExporting(false);
    } catch (error) {
      console.error("Failed to download transcript:", error);
      setIsExporting(false);
    }
  };

  const refreshTranscript = async () => {
    if (!summary.id) return;
    
    setIsRefreshing(true);
    
    try {
      // Call the API endpoint with refresh=true query parameter
      const response = await axios.post(`/api/summaries/${summary.id}/fetch-transcript?refresh=true`);
      
      // Update the summary with the new transcript
      if (response.data && onSummaryUpdate) {
        onSummaryUpdate(response.data);
      }
      
      setIsRefreshing(false);
    } catch (error) {
      console.error("Failed to refresh transcript:", error);
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex gap-2 justify-end">
      <Button
        variant="outline"
        size="sm"
        onClick={refreshTranscript}
        disabled={isRefreshing}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? "Refreshing..." : "Refresh Transcript"}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={downloadTranscript}
        disabled={isExporting || !summary.transcript}
      >
        <Download className="h-4 w-4 mr-2" />
        {isExporting ? "Downloading..." : "Download Transcript"}
      </Button>
    </div>
  );
}