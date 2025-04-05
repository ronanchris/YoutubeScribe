import { useState } from "react";
import { SummaryWithScreenshots, Screenshot } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Bookmark, CheckCheck, Camera, Plus } from "lucide-react";
import ScreenshotsGallery from "./screenshots-gallery";
import VideoFrameScrubber from "./video-frame-scrubber";
import GlossaryTags from "./glossary-tags";

interface SummaryResultsProps {
  summary: SummaryWithScreenshots;
  initialShowScrubber?: boolean;
}

export default function SummaryResults({ summary, initialShowScrubber = false }: SummaryResultsProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showFrameScrubber, setShowFrameScrubber] = useState(initialShowScrubber);
  const [screenshots, setScreenshots] = useState<Screenshot[]>(summary.screenshots);

  // Format structured outline for rendering
  const structuredOutline = summary.structuredOutline as { title: string; items: string[] }[];

  // Copy summary to clipboard as markdown
  const copyToMarkdown = () => {
    try {
      const markdown = generateMarkdown(summary);
      navigator.clipboard.writeText(markdown);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Summary has been copied as markdown",
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "There was an error copying to clipboard",
        variant: "destructive",
      });
    }
  };

  // Save summary to bookmarks (visual feedback only, already saved in database)
  const saveSummary = () => {
    setSaved(true);
    toast({
      title: "Summary saved",
      description: "This summary is now in your history",
    });
  };
  
  // Handle adding new screenshots
  const handleScreenshotAdded = (newScreenshot: Screenshot) => {
    setScreenshots(prev => [...prev, newScreenshot]);
    toast({
      title: "Screenshot added",
      description: "Custom screenshot has been added to this summary",
    });
  };

  return (
    <Card className="bg-white shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{summary.videoTitle}</h2>
          <p className="text-sm text-slate-500">{summary.videoAuthor}</p>
        </div>
        <div className="flex space-x-2">
          <button
            className="text-slate-500 hover:text-primary p-1 rounded-full hover:bg-slate-100 transition-colors"
            title="Copy to Markdown"
            onClick={copyToMarkdown}
          >
            {copied ? <CheckCheck className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
          </button>
          <button
            className={`text-slate-500 hover:text-primary p-1 rounded-full hover:bg-slate-100 transition-colors ${
              saved ? "text-primary" : ""
            }`}
            title="Save to History"
            onClick={saveSummary}
          >
            <Bookmark className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5">
        {/* Summary Content */}
        <div className="md:col-span-3 p-3 sm:p-4 md:border-r border-slate-200">
          <div className="space-y-4">
            <div>
              <h3 className="text-md font-semibold text-slate-700 mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-primary mr-1"
                >
                  <line x1="21" y1="6" x2="3" y2="6" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                  <line x1="17" y1="18" x2="3" y2="18" />
                </svg>
                Key Points
              </h3>
              <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                {summary.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-md font-semibold text-slate-700 mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-primary mr-1"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Summary
              </h3>
              <div className="text-sm text-slate-600 space-y-2">
                {/* Glossary tags for the summary */}
                <GlossaryTags summaryContent={summary.summary} />
                
                {summary.summary.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-md font-semibold text-slate-700 mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-primary mr-1"
                >
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                Structured Outline
              </h3>
              <div className="text-sm text-slate-600">
                <ol className="list-decimal pl-5 space-y-1">
                  {structuredOutline.map((section, index) => (
                    <li key={index}>
                      <span className="font-medium">{section.title}</span>
                      <ul className="list-disc pl-5 mt-1 mb-2">
                        {section.items.map((item, itemIndex) => (
                          <li key={itemIndex}>{item}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Screenshots Gallery */}
        <div className="md:col-span-2 p-3 sm:p-4 bg-slate-50 border-t md:border-t-0 border-slate-200">
          <div className="flex flex-col space-y-3">
            {/* Toggle button for frame scrubber */}
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-semibold text-slate-700 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-primary mr-1"
                >
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                  <line x1="7" y1="2" x2="7" y2="22" />
                  <line x1="17" y1="2" x2="17" y2="22" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <line x1="2" y1="7" x2="7" y2="7" />
                  <line x1="2" y1="17" x2="7" y2="17" />
                  <line x1="17" y1="17" x2="22" y2="17" />
                  <line x1="17" y1="7" x2="22" y2="7" />
                </svg>
                Screenshots ({screenshots.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="text-xs flex items-center gap-1"
                onClick={() => setShowFrameScrubber(!showFrameScrubber)}
              >
                {showFrameScrubber ? "Hide Frame Capture" : "Add Screenshots"}
                {!showFrameScrubber && <Plus className="h-3 w-3" />}
              </Button>
            </div>
            
            {/* Video frame scrubber */}
            {showFrameScrubber && (
              <VideoFrameScrubber
                videoId={summary.videoId}
                videoDuration={summary.videoDuration}
                summaryId={summary.id}
                onScreenshotAdded={handleScreenshotAdded}
              />
            )}
            
            {/* Screenshots gallery */}
            <ScreenshotsGallery screenshots={screenshots} />
          </div>
        </div>
      </div>
    </Card>
  );
}

// Helper function to generate markdown
function generateMarkdown(summary: SummaryWithScreenshots): string {
  const structuredOutline = summary.structuredOutline as { title: string; items: string[] }[];
  
  let markdown = `# ${summary.videoTitle}\n`;
  markdown += `By ${summary.videoAuthor}\n\n`;
  
  markdown += `## Key Points\n`;
  summary.keyPoints.forEach(point => {
    markdown += `- ${point}\n`;
  });
  markdown += '\n';
  
  markdown += `## Summary\n`;
  markdown += `${summary.summary}\n\n`;
  
  markdown += `## Structured Outline\n`;
  structuredOutline.forEach((section, index) => {
    markdown += `${index + 1}. **${section.title}**\n`;
    section.items.forEach(item => {
      markdown += `   - ${item}\n`;
    });
    markdown += '\n';
  });
  
  markdown += `## Key Visuals\n`;
  summary.screenshots.forEach(screenshot => {
    markdown += `- ${screenshot.description} (${formatTimestamp(screenshot.timestamp)})\n`;
  });
  
  markdown += `\nURL: ${summary.videoUrl}\n`;
  
  return markdown;
}

// Helper function to format timestamp
function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}
