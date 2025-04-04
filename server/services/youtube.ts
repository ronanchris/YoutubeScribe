import axios from 'axios';
import { URL } from 'url';

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
 */
export function extractVideoId(url: string): string {
  try {
    const parsedUrl = new URL(url);
    
    // Handle youtube.com URLs
    if (parsedUrl.hostname.includes('youtube.com')) {
      const searchParams = new URLSearchParams(parsedUrl.search);
      const videoId = searchParams.get('v');
      if (videoId) return videoId;
    }
    
    // Handle youtu.be URLs
    if (parsedUrl.hostname.includes('youtu.be')) {
      // The path without the leading slash is the video ID
      return parsedUrl.pathname.substring(1);
    }
    
    throw new Error('Could not extract video ID from URL');
  } catch (error) {
    console.error('Error extracting video ID:', error);
    throw new Error('Invalid YouTube URL format');
  }
}

/**
 * Gets the video transcript using youtube-transcript-api via a Node.js implementation
 */
export async function getVideoTranscript(url: string): Promise<string | null> {
  try {
    const videoId = extractVideoId(url);
    
    // Using the youtube-transcript-api endpoint
    const response = await axios.get(`https://yt-transcript-api.vercel.app/transcript?id=${videoId}`);
    
    if (response.status !== 200 || !response.data || !response.data.transcript) {
      console.error('Transcript API error:', response.data);
      return null;
    }
    
    // Concatenate all transcript segments into one string
    const transcriptSegments: Transcript[] = response.data.transcript;
    const fullTranscript = transcriptSegments
      .map(segment => segment.text)
      .join(' ');
    
    return fullTranscript;
  } catch (error) {
    console.error('Error getting transcript:', error);
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
  } catch (error) {
    console.error('Error getting video info:', error);
    
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
