import { Screenshot } from "@shared/schema";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Images } from "lucide-react";

interface ScreenshotsGalleryProps {
  screenshots: Screenshot[];
}

export default function ScreenshotsGallery({ screenshots }: ScreenshotsGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<Screenshot | null>(null);

  // Format timestamp as MM:SS
  const formatTimestamp = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (screenshots.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Images className="h-10 w-10 mx-auto mb-2 text-slate-400" />
        <p>No key visuals were found for this video.</p>
      </div>
    );
  }

  return (
    <>
      <h3 className="text-md font-semibold text-slate-700 mb-3 flex items-center">
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
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        Key Visuals
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {screenshots.map((screenshot) => (
          <Dialog key={screenshot.id}>
            <DialogTrigger asChild>
              <div 
                className="cursor-pointer hover:opacity-90 transition-opacity" 
                onClick={() => setSelectedImage(screenshot)}
              >
                <img
                  src={`data:image/jpeg;base64,${screenshot.imageUrl}`}
                  alt={screenshot.description || "Video screenshot"}
                  className="w-full h-40 sm:h-32 object-cover rounded-lg border border-slate-200 mb-1"
                  loading="lazy"
                />
                <p className="text-xs text-slate-500 truncate">
                  {screenshot.description} ({formatTimestamp(screenshot.timestamp)})
                </p>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-w-[95vw] w-full p-3 sm:p-6">
              <div className="text-center">
                <img
                  src={`data:image/jpeg;base64,${screenshot.imageUrl}`}
                  alt={screenshot.description || "Video screenshot"}
                  className="max-w-full rounded-md mx-auto max-h-[50vh] sm:max-h-[60vh] object-contain"
                />
                <p className="mt-2 text-sm font-medium break-words">{screenshot.description}</p>
                <p className="text-xs text-slate-500">
                  Timestamp: {formatTimestamp(screenshot.timestamp)}
                </p>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </>
  );
}
