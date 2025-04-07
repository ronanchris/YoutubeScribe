import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, ThumbsUp } from "lucide-react";
import type { SummaryWithScreenshots } from "@/types";
import { updateSummary } from "@/lib/api";

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
  
  // Format transcript for better readability by breaking into paragraphs
  const formattedTranscript = useMemo(() => {
    // First attempt to detect natural paragraphs based on pauses, periods, and newlines
    const paragraphs: string[] = [];
    let currentParagraph = "";
    
    // Split by spaces to process word by word
    const words = transcript.split(/\s+/);
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      currentParagraph += word + " ";
      
      // Check if we should end a paragraph:
      // 1. If the word ends with a period, question mark, or exclamation mark
      // 2. If we've accumulated enough words for a reasonable paragraph (15-20 words)
      // 3. If there are explicit pauses or paragraph breaks in the transcript
      
      const isEndOfSentence = /[.!?]$/.test(word);
      const isParagraphBreak = /^[\n\r]{2,}/.test(word) || /^\s{4,}/.test(word);
      const hasReasonableLength = currentParagraph.split(/\s+/).length >= 18;
      
      if ((isEndOfSentence && hasReasonableLength) || isParagraphBreak || i === words.length - 1) {
        paragraphs.push(currentParagraph.trim());
        currentParagraph = "";
      }
    }
    
    // If there's any remaining content, add it as a paragraph
    if (currentParagraph.trim()) {
      paragraphs.push(currentParagraph.trim());
    }
    
    // If we couldn't determine paragraphs naturally, fallback to simple chunking
    if (paragraphs.length <= 1) {
      // Chunk the text into roughly equal parts
      const totalWords = words.length;
      const wordsPerParagraph = 20; // Target words per paragraph
      
      for (let i = 0; i < totalWords; i += wordsPerParagraph) {
        const chunk = words.slice(i, i + wordsPerParagraph).join(" ");
        if (chunk.trim()) {
          paragraphs.push(chunk.trim());
        }
      }
    }
    
    // Return the formatted paragraphs
    return paragraphs.map((paragraph, index) => (
      <p key={index} className="mb-3">
        {paragraph}
      </p>
    ));
  }, [transcript]);
  
  return (
    <div className="relative mt-2">
      <div 
        ref={transcriptRef}
        className="text-sm text-slate-600 p-6 bg-white border border-slate-200 rounded-md max-h-[600px] md:max-h-[800px] overflow-y-auto"
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
  const [viewMode, setViewMode] = useState<'compact' | 'full'>('compact');
  const { toast } = useToast();
  
  // Handle adding a highlighted section to key points
  const handleAddHighlight = async (highlightedText: string) => {
    const updatedKeyPoints = [...summary.keyPoints, highlightedText];
    
    try {
      // Create updated summary object
      const updatedSummary = {
        ...summary,
        keyPoints: updatedKeyPoints
      };
      
      // First update the UI (optimistic update)
      onSummaryUpdate(updatedSummary);
      
      // Then persist to the database
      const savedSummary = await updateSummary(summary.id, { keyPoints: updatedKeyPoints });
      
      // Update with the response from the server (which should include any other changes)
      onSummaryUpdate(savedSummary);
      
      toast({
        title: "Key Point Added",
        description: "Your highlighted selection has been added to the key points and saved.",
      });
    } catch (error) {
      console.error("Error saving highlighted key point:", error);
      toast({
        title: "Error Saving Key Point",
        description: "There was a problem saving your highlighted text. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Toggle between view modes (compact vs full)
  const toggleViewMode = () => {
    setViewMode(viewMode === 'compact' ? 'full' : 'compact');
  };
  
  return (
    <div className="border border-slate-200 rounded-md overflow-hidden">
      <div className="bg-slate-50 p-3 flex justify-between items-center">
        <h4 className="text-sm font-medium text-slate-700">Interactive Transcript</h4>
        <div className="flex space-x-2">
          {isExpanded && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleViewMode}
            >
              {viewMode === 'compact' ? 'Full View' : 'Compact View'}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Hide Transcript" : "Show Transcript"}
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <div className={`border-t border-slate-200 ${viewMode === 'full' ? 'w-full px-4' : ''}`}>
          <div className={viewMode === 'full' ? 'max-w-4xl mx-auto' : ''}>
            <InteractiveTranscript
              transcript={summary.transcript}
              onHighlightAdd={handleAddHighlight}
            />
          </div>
        </div>
      )}
    </div>
  );
}