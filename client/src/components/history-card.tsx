import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSummary } from "@/lib/api";
import { SummaryWithScreenshots } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Copy, Trash2, ExternalLink, User, Camera } from "lucide-react";

interface HistoryCardProps {
  summary: SummaryWithScreenshots;
}

export default function HistoryCard({ summary }: HistoryCardProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth() || { user: null };
  const isAdmin = user?.isAdmin || false;

  // Format timestamp for display
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  // Format duration for display
  const formatDuration = (seconds: number | undefined | null) => {
    if (!seconds && seconds !== 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Generate tags from the video title 
  const generateTags = () => {
    // Extract potential tags from title
    const words = summary.videoTitle.split(' ');
    const tags: string[] = [];
    
    // Look for tech-related terms or other significant words
    const techTerms = ['AI', 'ML', 'JavaScript', 'Python', 'React', 'Node', 'Web', 'Data', 'Tech'];
    
    techTerms.forEach(term => {
      if (summary.videoTitle.includes(term)) {
        tags.push(term);
      }
    });
    
    // If we didn't find any tech terms, use the first 2 significant words
    if (tags.length === 0) {
      words
        .filter(word => word.length > 3) // Only consider words longer than 3 chars
        .slice(0, 2)
        .forEach(word => tags.push(word));
    }
    
    // Limit to 2 tags max
    return tags.slice(0, 2);
  };

  // Delete summary mutation
  const deletesMutation = useMutation({
    mutationFn: deleteSummary,
    onSuccess: () => {
      toast({
        title: "Summary deleted",
        description: "The summary has been removed from your history",
      });
      // Invalidate both regular and admin summaries queries to update history
      queryClient.invalidateQueries({ queryKey: ['/api/summaries'] });
      if (isAdmin) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/summaries'] });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to delete summary",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Thumbnail - use the first screenshot or a placeholder
  const thumbnailUrl = summary.screenshots.length > 0 
    ? `data:image/jpeg;base64,${summary.screenshots[0].imageUrl}`
    : `https://i.ytimg.com/vi/${summary.videoId}/hqdefault.jpg`;

  const tags = generateTags();

  return (
    <Card 
      className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={(e) => {
        // Prevent clicking card when dropdown is clicked
        if (e.target instanceof Element && 
            (e.target.closest('[role="menuitem"]') || 
             e.target.closest('[role="menu"]') || 
             e.target.closest('button'))) {
          return;
        }
        setLocation(`/?id=${summary.id}`);
      }}
    >
      <div className="aspect-video bg-slate-100 relative">
        <img
          src={thumbnailUrl}
          alt={`${summary.videoTitle} thumbnail`}
          className="w-full h-full object-cover"
        />
        <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
          {formatDuration(summary.videoDuration)}
        </span>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-slate-800 mb-1 line-clamp-1">{summary.videoTitle}</h3>
        <div className="flex flex-wrap items-center mb-2">
          <p className="text-xs text-slate-500 line-clamp-1 mr-1">
            {summary.videoAuthor} • Processed {formatDate(summary.createdAt)}
          </p>
          {/* Show user ID badge for admin users */}
          {isAdmin && summary.userId !== undefined && (
            <span className="mt-1 sm:mt-0 inline-flex items-center bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded">
              <User className="inline mr-1 h-3 w-3" />
              ID: {summary.userId}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, index) => (
              <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="text-slate-400 hover:text-primary z-10 p-1">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLocation(`/?id=${summary.id}`)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>View</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation(`/?id=${summary.id}&screenshots=add`)}>
                <Camera className="mr-2 h-4 w-4" />
                <span>Add Screenshots</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                navigator.clipboard.writeText(summary.videoUrl);
                toast({
                  title: "URL Copied",
                  description: "Video URL copied to clipboard",
                });
              }}>
                <Copy className="mr-2 h-4 w-4" />
                <span>Copy URL</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600" 
                onClick={() => deletesMutation.mutate(summary.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
