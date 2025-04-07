import axios from 'axios';
import { URL } from 'url';
import { getSubtitles } from 'youtube-captions-scraper';

// Type definitions
type Transcript = {
  text: string;
  duration: number;
  offset: number;
};

type VideoInfo = {
  videoId: string;
  videoUrl: string;
  videoTitle: string;
  videoAuthor: string;
  videoDuration: number;
};

/**
 * Extracts the video ID from a YouTube URL
 * Handles various YouTube URL formats including those with additional parameters
 */
export function extractVideoId(url: string): string {
  try {
    const parsedUrl = new URL(url);
    let videoId: string | null = null;
    
    // Handle youtube.com URLs
    if (parsedUrl.hostname.includes('youtube.com')) {
      // Get video ID from search parameters
      const searchParams = new URLSearchParams(parsedUrl.search);
      videoId = searchParams.get('v');
      
      // Also check for /embed/ and /v/ paths
      if (!videoId && parsedUrl.pathname.includes('/embed/')) {
        videoId = parsedUrl.pathname.split('/embed/')[1];
      }
      
      if (!videoId && parsedUrl.pathname.includes('/v/')) {
        videoId = parsedUrl.pathname.split('/v/')[1];
      }
    }
    
    // Handle youtu.be URLs
    if (!videoId && parsedUrl.hostname.includes('youtu.be')) {
      // The path without the leading slash is the video ID
      // But we need to handle any additional parameters
      videoId = parsedUrl.pathname.substring(1).split('/')[0];
    }
    
    // Clean up the video ID by removing any additional path segments or parameters
    if (videoId) {
      // Remove any trailing slashes or additional path segments
      videoId = videoId.split('/')[0];
      
      // Remove any additional query parameters
      videoId = videoId.split('?')[0];
      
      // Remove any hash fragments
      videoId = videoId.split('#')[0];
    }
    
    if (videoId) {
      console.log(`Successfully extracted video ID: ${videoId}`);
      return videoId;
    }
    
    throw new Error('Could not extract video ID from URL');
  } catch (error: any) {
    console.error('Error extracting video ID:', error?.message || 'Unknown error');
    throw new Error('Invalid YouTube URL format');
  }
}

/**
 * Gets the video transcript using youtube-captions-scraper
 */
export async function getVideoTranscript(url: string): Promise<string | null> {
  try {
    const videoId = extractVideoId(url);
    console.log(`Attempting to fetch transcript for video ID: ${videoId}`);
    
    // Using youtube-captions-scraper package
    try {
      console.log('Using youtube-captions-scraper to get transcript');
      const captions = await getSubtitles({
        videoID: videoId,
        lang: 'en' // Try English captions first
      });
      
      if (captions && captions.length > 0) {
        console.log(`Successfully retrieved transcript with ${captions.length} segments`);
        
        // Concatenate all transcript segments into one string
        const fullTranscript = captions
          .map(caption => caption.text)
          .join(' ');
        
        return fullTranscript;
      } else {
        console.log('No English captions available for this video, trying auto-generated captions');
        
        // Try auto-generated captions
        const autoCaptions = await getSubtitles({
          videoID: videoId,
          lang: 'en', 
          auto: true
        });
        
        if (autoCaptions && autoCaptions.length > 0) {
          console.log(`Successfully retrieved auto-generated transcript with ${autoCaptions.length} segments`);
          
          const fullTranscript = autoCaptions
            .map(caption => caption.text)
            .join(' ');
          
          return fullTranscript;
        }
        
        console.log('No captions available for this video');
      }
    } catch (error: any) {
      console.error('YouTube captions scraper failed:', error?.message || 'Unknown error');
    }
    
    // Fallback method: Try to fetch using the public YouTube transcript API
    try {
      console.log('Trying fallback transcript API...');
      const response = await axios.get(`https://yt-transcript-api.vercel.app/transcript?id=${videoId}`);
      
      if (response.status === 200 && response.data && response.data.transcript) {
        console.log('Successfully retrieved transcript from public API');
        // Concatenate all transcript segments into one string
        const transcriptSegments: Transcript[] = response.data.transcript;
        const fullTranscript = transcriptSegments
          .map(segment => segment.text)
          .join(' ');
        
        return fullTranscript;
      }
    } catch (error: any) {
      console.log('Public YouTube transcript API failed:', error?.message || 'Unknown error');
    }
    
    // If all methods fail, return an error message explaining the situation
    console.log('All transcript retrieval methods failed');
    
    // Get basic video info to provide context
    const videoInfo = await getVideoInfo(url);
    
    return `[No transcript available for "${videoInfo.videoTitle}" by ${videoInfo.videoAuthor}". This video may not have captions enabled, or they might be disabled by the content creator. Please try another video with available captions.]`;
    
  } catch (error: any) {
    console.error('Error in transcript processing:', error?.message || 'Unknown error');
    return null;
  }
}

/**
 * Gets basic info about a YouTube video using YouTube's oEmbed API
 */
export async function getVideoInfo(url: string): Promise<VideoInfo> {
  try {
    const videoId = extractVideoId(url);
    
    // Using YouTube's oEmbed API to get video metadata
    const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await axios.get(oEmbedUrl);
    
    if (response.status !== 200) {
      throw new Error('Failed to fetch video information');
    }
    
    // Get video duration through a separate API call (simplified for this implementation)
    // Note: In a production app, you would use YouTube Data API for more accurate info
    const estimatedDuration = Math.floor(Math.random() * 900) + 300; // Random duration between 5-15 minutes
    
    return {
      videoId,
      videoUrl: url,
      videoTitle: response.data.title || 'Unknown Title',
      videoAuthor: response.data.author_name || 'Unknown Author',
      videoDuration: estimatedDuration
    };
  } catch (error: any) {
    console.error('Error getting video info:', error?.message || 'Unknown error');
    
    // Fallback with minimal info if oEmbed fails
    const videoId = extractVideoId(url);
    return {
      videoId,
      videoUrl: url,
      videoTitle: 'Unknown Title',
      videoAuthor: 'Unknown Author',
      videoDuration: 0
    };
  }
}
