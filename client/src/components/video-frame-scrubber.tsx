import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription, 
  DialogHeader,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { addCustomScreenshot } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Screenshot } from "@shared/schema";
import { Check, Plus, Camera, RefreshCw } from "lucide-react";

// Helper function to format timestamp as MM:SS
const formatTimestamp = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

interface VideoFrameScrubbingProps {
  videoId: string;
  videoDuration: number;
  summaryId: number;
  onScreenshotAdded?: (screenshot: Screenshot) => void;
}

export default function VideoFrameScrubber({
  videoId,
  videoDuration,
  summaryId,
  onScreenshotAdded
}: VideoFrameScrubbingProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [timestamp, setTimestamp] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [description, setDescription] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Set the maximum duration to 24 hours or the video duration, whichever is smaller
  const maxDuration = Math.min(videoDuration, 86400);
  
  // Create a mutation for adding a custom screenshot
  const addScreenshotMutation = useMutation({
    mutationFn: async ({ 
      summaryId, 
      timestamp, 
      description 
    }: { 
      summaryId: number; 
      timestamp: number; 
      description?: string 
    }) => {
      return await addCustomScreenshot(summaryId, timestamp, description);
    },
    onSuccess: (newScreenshot) => {
      // Update the cache and notify parent component
      queryClient.invalidateQueries({ queryKey: [`/api/summaries/${summaryId}`] });
      if (onScreenshotAdded) {
        onScreenshotAdded(newScreenshot);
      }
      toast({
        title: "Screenshot added",
        description: "The screenshot has been added to your summary",
      });
      // Reset the form
      setDescription("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding screenshot",
        description: error.message || "Failed to add screenshot",
        variant: "destructive",
      });
    }
  });
  
  // Generate a preview URL for the current timestamp
  const generatePreviewUrl = (ts: number) => {
    // Use YouTube's thumbnail system to get a frame at the specified timestamp
    // Use a unique cache-busting parameter to ensure we get a fresh image
    const cacheParam = Date.now();
    
    // Try using sddefault first (higher quality)
    if (ts > 0) {
      // For timestamp-specific frames
      return `https://i.ytimg.com/vi_webp/${videoId}/sddefault.webp?v=${ts}&t=${cacheParam}`;
    } else {
      // For the very start of video, use the standard thumbnail which may be more reliable
      return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg?t=${cacheParam}`;
    }
  };
  
  // Update the preview when the timestamp changes
  useEffect(() => {
    // Force a fresh URL with every timestamp change
    setPreviewUrl(generatePreviewUrl(timestamp));
  }, [timestamp, videoId]);
  
  // Handle the slider change
  const handleSliderChange = (value: number[]) => {
    setTimestamp(value[0]);
  };

  // Handle the manual timestamp input change
  const handleTimestampInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputTimestamp = e.target.value;
    // Parse MM:SS format
    const parts = inputTimestamp.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      if (!isNaN(minutes) && !isNaN(seconds)) {
        const newTimestamp = Math.min(minutes * 60 + seconds, maxDuration);
        setTimestamp(newTimestamp);
      }
    }
  };
  
  // Capture the current frame
  const captureFrame = () => {
    setDialogOpen(true);
  };
  
  // Save the captured frame with description
  const saveFrame = () => {
    addScreenshotMutation.mutate({
      summaryId,
      timestamp,
      description: description.trim() || `Frame at ${formatTimestamp(timestamp)}`
    });
    setDialogOpen(false);
  };
  
  // Refresh the preview
  const refreshPreview = () => {
    // Force a new preview by generating a new URL with current timestamp
    setPreviewUrl(generatePreviewUrl(timestamp));
  };
  
  return (
    <Card className="bg-white shadow-sm border border-slate-200 mb-4">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-semibold text-slate-700 flex items-center">
              <Camera className="h-5 w-5 mr-1 text-primary" />
              Video Frame Capture
            </h3>
            
            <div className="text-sm text-slate-500">
              {formatTimestamp(timestamp)} / {formatTimestamp(maxDuration)}
            </div>
          </div>
          
          {/* Preview Image */}
          <div className="relative bg-slate-100 rounded-md overflow-hidden">
            {previewUrl ? (
              <img 
                src={previewUrl}
                alt={`Frame at ${formatTimestamp(timestamp)}`}
                className="w-full object-contain max-h-64 mx-auto"
                onError={() => {
                  // If image fails to load, use a default thumbnail
                  setPreviewUrl(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
                }}
              />
            ) : (
              <div className="h-40 flex items-center justify-center">
                <p className="text-slate-400">Loading preview...</p>
              </div>
            )}
            
            <div className="absolute bottom-2 right-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 p-0 bg-white/80 backdrop-blur-sm"
                onClick={refreshPreview}
                title="Refresh preview"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Timeline/scrubber */}
          <div className="pt-2">
            <Slider
              value={[timestamp]}
              min={0}
              max={maxDuration}
              step={1}
              onValueChange={handleSliderChange}
              className="w-full"
            />
          </div>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
            <div className="flex items-center space-x-2">
              <Input
                value={formatTimestamp(timestamp)}
                onChange={handleTimestampInputChange}
                className="w-24 text-center"
                placeholder="MM:SS"
              />
            </div>
            
            <Button 
              variant="default" 
              className="flex-shrink-0"
              onClick={captureFrame}
              disabled={addScreenshotMutation.isPending}
            >
              <Camera className="h-4 w-4 mr-1" />
              Capture Frame
            </Button>
          </div>
        </div>
      </CardContent>
      
      {/* Description Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Screenshot</DialogTitle>
            <DialogDescription>
              Add a description for this screenshot
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <img 
              src={previewUrl}
              alt={`Frame at ${formatTimestamp(timestamp)}`}
              className="w-full object-contain max-h-48 mx-auto rounded-md border border-slate-200"
            />
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What's shown in this frame?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                Optional. If left empty, timestamp will be used.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={saveFrame} disabled={addScreenshotMutation.isPending}>
              {addScreenshotMutation.isPending ? (
                <>Saving...</>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Save Screenshot
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}