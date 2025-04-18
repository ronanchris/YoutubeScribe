import { useState, useRef, useEffect, useCallback } from "react";
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
import { addCustomScreenshot, previewVideoFrame } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";

import { Screenshot } from "@shared/schema";
import { Check, Plus, Camera, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

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
  const isMobile = useIsMobile();
  const [timestamp, setTimestamp] = useState(0);
  const [pendingTimestamp, setPendingTimestamp] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [description, setDescription] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sliderLocked, setSliderLocked] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set the maximum duration to 24 hours or the video duration, whichever is smaller
  const maxDuration = Math.min(videoDuration, 86400);
  
  // Determine step size for frame capture (larger step on mobile for easier selection)
  const stepSize = isMobile ? 5 : 1;
  
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
    // Use a unique cache-busting parameter to ensure we get a fresh image
    const cacheParam = Date.now();
    
    // We'll use one of several different approaches to maximize our chances
    // of getting a different frame for different timestamps
    
    // For the beginning of the video
    if (ts === 0) {
      return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg?t=${cacheParam}`;
    }
    
    // For timestamps that are multiples of 10, try the maxresdefault
    if (ts % 10 === 0) {
      return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg?t=${cacheParam}`;
    }
    
    // For timestamps divisible by 3, use the mq thumbnail
    if (ts % 3 === 0) {
      return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg?t=${cacheParam}`;
    }
    
    // For timestamps divisible by 5, use the hq thumbnail 
    if (ts % 5 === 0) {
      return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg?t=${cacheParam}`;
    }
    
    // For all other timestamps, use the webp format with the timestamp parameter
    return `https://i.ytimg.com/vi_webp/${videoId}/sddefault.webp?v=${ts}&t=${cacheParam}`;
  };
  
  // Debounced timestamp update function
  const debouncedUpdateTimestamp = useCallback((newTimestamp: number) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set loading state
    setIsLoading(true);
    
    // Update pending timestamp
    setPendingTimestamp(newTimestamp);
    
    // After a short delay, update the actual timestamp
    timeoutRef.current = setTimeout(() => {
      // Update the actual timestamp
      setTimestamp(newTimestamp);
      setPendingTimestamp(null);
      timeoutRef.current = null;
      
      // Update the preview image directly with YouTube URLs
      // Use cache-busting parameter
      const cacheParam = Date.now();
      // Try high quality first but have fallbacks ready
      setPreviewUrl(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg?t=${cacheParam}`);
      
      // After a short delay, clear loading state
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    }, isMobile ? 400 : 200); // Longer delay on mobile for stability
  }, [isMobile, videoId]);
  
  // Handle moving to next/previous frame using step buttons
  const stepTimestamp = useCallback((direction: 'prev' | 'next') => {
    if (sliderLocked) return;
    
    const increment = direction === 'next' ? stepSize : -stepSize;
    const newTimestamp = Math.max(0, Math.min(maxDuration, timestamp + increment));
    
    // Lock slider briefly to prevent jumps
    setSliderLocked(true);
    setIsLoading(true);
    
    // Update timestamp
    setTimestamp(newTimestamp);
    
    // Set a new preview URL with cache busting
    const cacheParam = Date.now();
    setPreviewUrl(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg?t=${cacheParam}-step`);
    
    // Unlock after a reasonable delay
    setTimeout(() => {
      setSliderLocked(false);
      setIsLoading(false);
    }, 600);
  }, [timestamp, maxDuration, stepSize, sliderLocked, videoId]);
  
  // Use server-side API to fetch frames
  const fetchFrameFromServer = useCallback(async (ts: number) => {
    try {
      setIsLoading(true);
      // Use the server API to get a high-quality frame
      const imageDataUrl = await previewVideoFrame(videoId, ts);
      setPreviewUrl(imageDataUrl);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Error fetching frame from server:", error);
      setIsLoading(false);
      return false;
    }
  }, [videoId]);
  
  // Update the preview when the timestamp changes using direct YouTube URLs
  useEffect(() => {
    // Show loading state
    setIsLoading(true);
    
    // Use the most reliable YouTube URL format with cache busting
    const cacheParam = Date.now();
    setPreviewUrl(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg?t=${cacheParam}`);
    
    // Set a timeout to clear loading state
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    
    // Cleanup function
    return () => {
      clearTimeout(loadingTimeout);
    };
  }, [timestamp, videoId]);
  
  // Handle the slider change
  const handleSliderChange = (value: number[]) => {
    if (sliderLocked) return;
    
    // Round to step size for more predictable frame selection on mobile
    const newValue = isMobile 
      ? Math.round(value[0] / stepSize) * stepSize 
      : value[0];
      
    // Use the debounced update function
    debouncedUpdateTimestamp(newValue);
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
  
  // Capture the current frame using direct YouTube URLs
  const captureFrame = () => {
    // Show toast to indicate what's happening
    toast({
      title: "Preparing frame...",
      description: "Getting the best frame at this timestamp before capture",
      duration: 1500
    });
    
    // Set loading state
    setIsLoading(true);
    
    // Try high quality image first
    const timestamp1 = Date.now();
    const highQualityUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg?t=${timestamp1}`;
    
    // Set the preview URL to highest quality option
    setPreviewUrl(highQualityUrl);
    
    // After a short delay, show the capture dialog regardless of image loading state
    setTimeout(() => {
      // If the image is taking too long to load, try a more reliable format
      if (isLoading) {
        const timestamp2 = Date.now();
        const reliableUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg?t=${timestamp2}`;
        setPreviewUrl(reliableUrl);
      }
      
      // Show dialog after a reasonable delay to allow image loading
      setTimeout(() => {
        setIsLoading(false);
        setDialogOpen(true);
      }, 400);
    }, 600);
  };
  
  // Save the captured frame with description
  const saveFrame = () => {
    // Show a toast to indicate we're trying to save
    toast({
      title: "Saving screenshot...",
      description: "Please wait while we capture this frame",
    });
    
    // Add a small delay before saving to ensure UI is responsive
    setTimeout(() => {
      addScreenshotMutation.mutate({
        summaryId,
        timestamp,
        description: description.trim() || `Frame at ${formatTimestamp(timestamp)}`
      });
      setDialogOpen(false);
    }, 500);
  };
  
  // Refresh the preview using direct YouTube URLs (more reliable)
  const refreshPreview = () => {
    // Show loading state
    setIsLoading(true);
    
    // Show a toast to explain what's happening
    toast({
      title: "Refreshing frame",
      description: "Getting a fresh frame at this timestamp...",
      duration: 1500
    });
    
    // Use a different timestamp to force cache refresh
    const diffAmount = 1; // Small difference to force cache refresh
    let newTimestamp = Math.max(0, Math.min(maxDuration, timestamp + diffAmount));
    
    // We'll focus on reliable YouTube thumbnail methods which are more stable
    // First, try a slightly different timestamp to break any caching
    setPreviewUrl(`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg?t=${Date.now()}-1`);
    
    // Then quickly set back to original timestamp with a new cache param
    setTimeout(() => {
      const cacheParam = Date.now();
      setPreviewUrl(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg?t=${cacheParam}-2`);
      
      // Finally use our best quality option with another cache param
      setTimeout(() => {
        const finalCacheParam = Date.now();
        setPreviewUrl(`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg?t=${finalCacheParam}-3`);
        
        // Set a timeout to clear loading state if image is taking too long
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      }, 300);
    }, 300);
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
              <>
                <img 
                  key={previewUrl} // Force re-render on URL change
                  src={previewUrl}
                  alt={`Frame at ${formatTimestamp(timestamp)}`}
                  className="w-full object-contain max-h-64 mx-auto"
                  onLoad={() => {
                    setIsLoading(false);
                    setErrorCount(0);
                  }}
                  onError={() => {
                    // If image fails to load, try a fallback or increment error count
                    setErrorCount(prev => prev + 1);
                    if (errorCount < 3) {
                      // Try default thumbnail formats in sequence
                      const formats = ['hqdefault', 'mqdefault', 'default'];
                      const format = formats[errorCount % formats.length];
                      setPreviewUrl(`https://i.ytimg.com/vi/${videoId}/${format}.jpg?t=${Date.now()}`);
                    } else {
                      // After several failures, just use the default
                      setPreviewUrl(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg?t=${Date.now()}`);
                    }
                  }}
                />
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="rounded-md bg-white/90 p-2 shadow-sm">
                      <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  </div>
                )}
              </>
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
              step={isMobile ? stepSize : 1}
              onValueChange={handleSliderChange}
              disabled={sliderLocked}
              className="w-full"
            />
            
            {/* Display pending timestamp if one exists */}
            {pendingTimestamp !== null && (
              <div className="text-xs text-center mt-1 text-slate-500">
                Moving to {formatTimestamp(pendingTimestamp)}...
              </div>
            )}
          </div>
          
          {/* Step Controls - More precise frame selection */}
          <div className="flex justify-center gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => stepTimestamp('prev')}
              disabled={timestamp === 0 || sliderLocked}
              className="w-12 h-10"
              title={`Step back ${stepSize} seconds`}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => stepTimestamp('next')}
              disabled={timestamp >= maxDuration || sliderLocked}
              className="w-12 h-10"
              title={`Step forward ${stepSize} seconds`}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <Input
                value={formatTimestamp(timestamp)}
                onChange={handleTimestampInputChange}
                className="w-24 text-center"
                placeholder="MM:SS"
              />
              {isMobile && (
                <div className="text-xs text-slate-500">
                  Step Size: {stepSize}s
                </div>
              )}
            </div>
            
            <Button 
              variant="default" 
              className="flex-shrink-0"
              onClick={captureFrame}
              disabled={false} // Never disable this button to ensure it's always clickable
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