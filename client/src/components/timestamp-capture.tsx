import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Camera, Check, ChevronLeft, ChevronRight, Video } from "lucide-react";
import { addCustomScreenshot } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";

// Helper function to format timestamp as MM:SS
const formatTimestamp = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

interface TimestampCaptureProps {
  videoId: string;
  videoDuration: number;
  summaryId: number;
  onScreenshotAdded?: (screenshot: any) => void;
}

export default function TimestampCapture({
  videoId,
  videoDuration,
  summaryId,
  onScreenshotAdded
}: TimestampCaptureProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const maxDuration = videoDuration;
  
  // Step size for navigation buttons (in seconds)
  const stepSize = isMobile ? 10 : 5;
  
  // State for managing the current display
  const [timestamp, setTimestamp] = useState(Math.floor(maxDuration * 0.1)); // Start at 10% of video
  const [dialogOpen, setDialogOpen] = useState(false);
  const [description, setDescription] = useState('');
  
  // Generate colors based on timestamp for visual variety
  const getColorForTimestamp = (ts: number): string => {
    const colors = [
      'bg-blue-100', 'bg-green-100', 'bg-purple-100', 
      'bg-yellow-100', 'bg-pink-100', 'bg-indigo-100'
    ];
    const index = Math.floor((ts / maxDuration) * colors.length);
    return colors[Math.min(index, colors.length - 1)];
  };
  
  // React Query mutation for adding a screenshot
  const queryClient = useQueryClient();
  const addScreenshotMutation = useMutation({
    mutationFn: (data: { summaryId: number; timestamp: number; description: string }) => 
      addCustomScreenshot(data.summaryId, data.timestamp, data.description),
    onSuccess: (newScreenshot) => {
      queryClient.invalidateQueries({ queryKey: ['/api/summaries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summaries', summaryId] });
      
      // Call the callback if provided
      if (onScreenshotAdded) {
        onScreenshotAdded(newScreenshot);
      }
      
      // Show success toast
      toast({
        title: "Timestamp marker added",
        description: `Saved marker at ${formatTimestamp(timestamp)}`,
      });
      
      // Clear description field
      setDescription('');
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add marker",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle the slider change
  const handleSliderChange = (value: number[]) => {
    // Update the timestamp
    setTimestamp(value[0]);
  };

  // Handle moving to next/previous timestamp
  const stepTimestamp = useCallback((direction: 'prev' | 'next') => {
    const increment = direction === 'next' ? stepSize : -stepSize;
    const newTimestamp = Math.max(0, Math.min(maxDuration, timestamp + increment));
    setTimestamp(newTimestamp);
  }, [timestamp, maxDuration, stepSize]);

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
  
  // Capture the current timestamp
  const captureTimestamp = () => {
    // Show toast to indicate what's happening
    toast({
      title: "Preparing timestamp...",
      description: "Getting ready to capture timestamp marker",
      duration: 1500
    });
    
    // Show dialog after a short delay for better UX
    setTimeout(() => {
      setDialogOpen(true);
    }, 300);
  };
  
  // Save the captured timestamp with description
  const saveTimestamp = () => {
    // Show a toast to indicate we're saving
    toast({
      title: "Saving timestamp...",
      description: "Please wait while we save this marker",
    });
    
    // Add a small delay before saving to ensure UI is responsive
    setTimeout(() => {
      addScreenshotMutation.mutate({
        summaryId,
        timestamp,
        description: description.trim() || `Marker at ${formatTimestamp(timestamp)}`
      });
      setDialogOpen(false);
    }, 300);
  };
  
  // Generate time markers for visualization
  const generateTimeMarkers = () => {
    const markers = [];
    const step = maxDuration / 5; // 5 markers across timeline
    
    for (let i = 0; i <= maxDuration; i += step) {
      const position = (i / maxDuration) * 100;
      markers.push(
        <div 
          key={i} 
          className="absolute transform -translate-x-1/2 -bottom-3 text-xs text-slate-500"
          style={{ left: `${position}%` }}
        >
          {formatTimestamp(i)}
        </div>
      );
    }
    
    return markers;
  };
  
  // Create a visualization for the timestamp
  const renderTimestampVisualization = () => {
    // Calculate position as percentage of video duration
    const position = (timestamp / maxDuration) * 100;
    
    return (
      <div className="relative h-36 bg-slate-100 rounded-md overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <Video className="h-20 w-20 text-slate-300" />
        </div>
        
        {/* Visual marker for the current timestamp */}
        <div 
          className={`absolute w-1 h-full ${getColorForTimestamp(timestamp)}`}
          style={{ left: `${position}%` }}
        />
        
        {/* Time marker */}
        <div 
          className="absolute bottom-2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-md shadow-sm text-sm font-medium"
          style={{ left: `${position}%` }}
        >
          {formatTimestamp(timestamp)}
        </div>
      </div>
    );
  };
  
  return (
    <Card className="bg-white shadow-sm border border-slate-200 mb-4">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-semibold text-slate-700 flex items-center">
              <Camera className="h-5 w-5 mr-1 text-primary" />
              Video Timestamp Capture
            </h3>
            
            <div className="text-sm text-slate-500">
              {formatTimestamp(timestamp)} / {formatTimestamp(maxDuration)}
            </div>
          </div>
          
          {/* Timeline Visualization */}
          {renderTimestampVisualization()}
          
          {/* Timeline/scrubber */}
          <div className="pt-2 relative">
            <Slider
              value={[timestamp]}
              min={0}
              max={maxDuration}
              step={isMobile ? stepSize : 1}
              onValueChange={handleSliderChange}
              className="w-full"
            />
            
            {/* Time markers underneath */}
            <div className="relative h-6 mt-1">
              {generateTimeMarkers()}
            </div>
          </div>
          
          {/* Step Controls - More precise selection */}
          <div className="flex justify-center gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => stepTimestamp('prev')}
              disabled={timestamp === 0}
              className="w-12 h-10"
              title={`Step back ${stepSize} seconds`}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => stepTimestamp('next')}
              disabled={timestamp >= maxDuration}
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
              onClick={captureTimestamp}
            >
              <Camera className="h-4 w-4 mr-1" />
              Capture Timestamp
            </Button>
          </div>
        </div>
      </CardContent>
      
      {/* Description Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Timestamp Marker</DialogTitle>
            <DialogDescription>
              Add a description for this timestamp
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className={`h-20 ${getColorForTimestamp(timestamp)} rounded-md flex items-center justify-center p-4`}>
              <div className="bg-white px-3 py-2 rounded-md shadow-sm">
                <span className="font-semibold">{formatTimestamp(timestamp)}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What happens at this timestamp?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                Describe what happens at this point in the video (optional).
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={saveTimestamp} disabled={addScreenshotMutation.isPending}>
              {addScreenshotMutation.isPending ? (
                <>Saving...</>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Save Timestamp
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}