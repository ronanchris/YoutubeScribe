import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, ThumbsUp } from "lucide-react";
import { SummaryWithScreenshots } from "@shared/schema";

interface InteractiveTranscriptProps {
  transcript: string;
  onHighlightAdd: (highlightedText: string) => void;
}

export default function InteractiveTranscript({ 
  transcript, 
  onHighlightAdd 
}: InteractiveTranscriptProps) {
  const { toast } = useToast();
  const [selection, setSelection] = useState<string>("");
  const [selectionCoords, setSelectionCoords] = useState<{ x: number, y: number } | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  
  // Handle text selection
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.toString().trim() === "") {
      setSelection("");
      setSelectionCoords(null);
      return;
    }
    
    const selectedText = selection.toString().trim();
    setSelection(selectedText);
    
    // Get position for the floating button
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Set position for the floating button - relative to the transcript container
    if (transcriptRef.current) {
      const containerRect = transcriptRef.current.getBoundingClientRect();
      setSelectionCoords({
        x: rect.right - containerRect.left - 60, // Position slightly to the left of end of selection
        y: rect.top - containerRect.top - 30     // Position above the selection
      });
    }
  };
  
  // Add selected text to key points
  const addHighlightToKeyPoints = () => {
    if (selection) {
      onHighlightAdd(selection);
      toast({
        title: "Added to Key Points",
        description: "The highlighted text has been added to the key points.",
      });
      // Clear selection after adding
      window.getSelection()?.removeAllRanges();
      setSelection("");
      setSelectionCoords(null);
    }
  };
  
  // Clear selection when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (transcriptRef.current && !transcriptRef.current.contains(event.target as Node)) {
        setSelection("");
        setSelectionCoords(null);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Format transcript for better readability
  const formattedTranscript = transcript
    .split(/(\s{4,}|\n+)/)
    .filter(Boolean)
    .map((section, index) => {
      // Check if this section is just whitespace or newlines
      if (/^[\s\n]+$/.test(section)) {
        return <span key={index} className="block h-4" />;
      }
      return <span key={index}>{section}</span>;
    });
  
  return (
    <div className="relative mt-2">
      <div 
        ref={transcriptRef}
        className="text-sm text-slate-600 p-4 bg-white border border-slate-200 rounded-md max-h-[400px] overflow-y-auto"
        onMouseUp={handleTextSelection}
        onTouchEnd={handleTextSelection}
        style={{ position: "relative" }}
      >
        {formattedTranscript}
      </div>
      
      {/* Floating add button when text is selected */}
      {selection && selectionCoords && (
        <Button
          size="sm"
          className="absolute flex items-center bg-primary z-10 rounded-full shadow-md"
          style={{
            left: `${selectionCoords.x}px`,
            top: `${selectionCoords.y}px`,
          }}
          onClick={addHighlightToKeyPoints}
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Add
        </Button>
      )}
      
      <div className="text-xs text-slate-500 mt-2 italic">
        Highlight any text above to add it to the Key Points
      </div>
    </div>
  );
}

// Component to use the interactive transcript in the context of a summary
export function TranscriptHighlighter({
  summary,
  onSummaryUpdate
}: {
  summary: SummaryWithScreenshots;
  onSummaryUpdate: (updatedSummary: SummaryWithScreenshots) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  
  // Handle adding a highlighted section to key points
  const handleAddHighlight = (highlightedText: string) => {
    const updatedKeyPoints = [...summary.keyPoints, highlightedText];
    
    // Create updated summary object
    const updatedSummary = {
      ...summary,
      keyPoints: updatedKeyPoints
    };
    
    // Update the parent component
    onSummaryUpdate(updatedSummary);
    
    toast({
      title: "Key Point Added",
      description: "Your highlighted selection has been added to the key points.",
    });
  };
  
  return (
    <div className="border border-slate-200 rounded-md overflow-hidden">
      <div className="bg-slate-50 p-3 flex justify-between items-center">
        <h4 className="text-sm font-medium text-slate-700">Interactive Transcript</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Hide Transcript" : "Show Transcript"}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="border-t border-slate-200">
          <InteractiveTranscript
            transcript={summary.transcript}
            onHighlightAdd={handleAddHighlight}
          />
        </div>
      )}
    </div>
  );
}