import { useState, useEffect } from "react";
import { SummaryWithScreenshots } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface TranscriptExporterProps {
  summary: SummaryWithScreenshots;
}

export default function TranscriptExporter({ summary }: TranscriptExporterProps) {
  const [isExporting, setIsExporting] = useState(false);

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

  return (
    <Button
      variant="outline"
      size="sm"
      className="ml-2"
      onClick={downloadTranscript}
      disabled={isExporting || !summary.transcript}
    >
      <Download className="h-4 w-4 mr-2" />
      {isExporting ? "Downloading..." : "Download Transcript"}
    </Button>
  );
}