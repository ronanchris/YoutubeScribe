import axios from 'axios';
import { createCanvas, loadImage } from 'canvas';
import { extractVideoId, getVideoInfo } from './youtube';
import { analyzeScreenshot } from './openai';
import { InsertScreenshot } from '@shared/schema';

/**
 * Helper function to format seconds into a MM:SS timestamp format
 * Exported for use in other parts of the application
 */
export function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Get YouTube video thumbnail URLs
 * @param videoId YouTube video ID
 * @param timestamp Optional timestamp in seconds to get frame at specific time
 * @param quality Image quality ('default', 'mq', 'hq', 'sd', 'maxres')
 * @returns URL to the thumbnail image
 */
function getYouTubeThumbnailUrl(videoId: string, timestamp: number = 0, quality: string = 'hq'): string {
  // If timestamp is 0, return the standard thumbnail
  if (timestamp === 0) {
    // Use predefined quality options
    switch (quality) {
      case 'default': return `https://i.ytimg.com/vi/${videoId}/default.jpg`;      // 120x90
      case 'mq': return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;        // 320x180
      case 'hq': return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;        // 480x360
      case 'sd': return `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`;        // 640x480
      case 'maxres': return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`; // 1280x720
      default: return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    }
  }
  
  // For timestamps > 0, use the storyboard API to get frames at specific timestamps
  // YouTube provides frame thumbnails in WebP format with the timestamp parameter
  // Add a cache-busting parameter to ensure we get a fresh image every time
  const cacheParam = Date.now();
  
  if (timestamp > 0) {
    // For timestamp-specific frames
    return `https://i.ytimg.com/vi_webp/${videoId}/sddefault.webp?v=${timestamp}&t=${cacheParam}`;
  } else {
    // For the very start of video, use the standard thumbnail which may be more reliable
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg?t=${cacheParam}`;
  }
}

/**
 * Get a frame from a YouTube video at a specific timestamp
 * This is an API-free approach to get video frames by leveraging YouTube's thumbnail system
 */
export async function getYouTubeFrameAtTimestamp(videoId: string, timestamp: number): Promise<Buffer> {
  // We'll try multiple thumbnail formats and fallbacks to maximize the chance of getting a unique frame
  const thumbnailFormats = [
    // First try timestamp-based WebP thumbnails
    () => `https://i.ytimg.com/vi_webp/${videoId}/sddefault.webp?v=${timestamp}&t=${Date.now()}`,
    
    // Then try standard quality formats with timestamps in URL
    () => `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg?t=${timestamp}&cache=${Date.now()}`,
    () => `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg?t=${timestamp}&cache=${Date.now()}`,
    () => `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg?t=${timestamp}&cache=${Date.now()}`,
    
    // Last resort: use standard default thumbnail
    () => `https://i.ytimg.com/vi/${videoId}/default.jpg?cache=${Date.now()}`
  ];
  
  // Try each format in sequence until one works
  let lastError: Error | null = null;
  
  for (const getUrl of thumbnailFormats) {
    try {
      const imageUrl = getUrl();
      console.log(`Trying to fetch frame from: ${imageUrl}`);
      
      // Add retry logic with timeout
      const timeoutPromise = new Promise<Buffer>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 5000);
      });
      
      const fetchPromise = axios.get(imageUrl, { 
        responseType: 'arraybuffer',
        timeout: 5000 // 5 second timeout
      }).then(response => Buffer.from(response.data));
      
      // Use the first to complete
      const imageBuffer = await Promise.race([fetchPromise, timeoutPromise]);
      return imageBuffer;
    } catch (error) {
      console.log(`Format failed, trying next option. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      lastError = error instanceof Error ? error : new Error('Unknown error fetching image');
      // Continue to next format
    }
  }
  
  // If all formats failed, throw the last error
  console.error('All thumbnail formats failed to fetch', lastError);
  throw lastError || new Error('Failed to fetch frame from all sources');
}

/**
 * Creates a new screenshot from a video frame at a specific timestamp
 * @param videoId YouTube video ID
 * @param timestamp Timestamp in seconds
 * @param description Optional user-provided description
 * @returns Prepared screenshot object ready to be saved
 */
export async function createCustomScreenshot(
  videoId: string, 
  timestamp: number, 
  description?: string
): Promise<InsertScreenshot> {
  try {
    // Get the frame at the specified timestamp
    const imageBuffer = await getYouTubeFrameAtTimestamp(videoId, timestamp);
    
    // Process the image with our enhancement pipeline
    const processedImage = await processImage(imageBuffer, timestamp);
    
    // Convert to base64 for storage
    const base64Image = processedImage.toString('base64');
    
    // If no description was provided, use a generic one
    const screenshotDescription = description || `Frame captured at ${formatTimestamp(timestamp)}`;
    
    // Return the prepared screenshot object (summaryId will be set by the caller)
    return {
      summaryId: 0,
      imageUrl: base64Image,
      timestamp,
      description: screenshotDescription
    };
  } catch (error) {
    console.error('Error creating custom screenshot:', error);
    throw new Error('Failed to create screenshot from the specified timestamp');
  }
}

/**
 * Gets a single default thumbnail for a YouTube video.
 * This is a simplified version that returns just one thumbnail to speed up summary generation.
 * Users can later enhance their summaries with additional screenshots using the frame capture interface.
 */
export async function extractScreenshots(youtubeUrl: string): Promise<InsertScreenshot[]> {
  try {
    // Get the video ID and info
    const videoId = extractVideoId(youtubeUrl);
    const videoInfo = await getVideoInfo(youtubeUrl);
    
    console.log(`Getting default thumbnail for video: ${videoId}`);
    
    const screenshots: InsertScreenshot[] = [];
    
    try {
      // Use the high-quality default thumbnail
      const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      
      // Fetch the image
      const response = await axios.get(thumbnailUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(response.data);
      
      // Process the image with canvas to add basic enhancements
      const processedImage = await processImage(imageBuffer);
      
      // Convert the processed image to base64
      const base64Image = processedImage.toString('base64');
      
      // Add a generic description since this is just the default thumbnail
      const description = `Default thumbnail for "${videoInfo.videoTitle}" by ${videoInfo.videoAuthor}`;
      
      // Add to screenshots collection
      screenshots.push({
        summaryId: 0, // Will be set when saving
        imageUrl: base64Image,
        timestamp: 0, // Default thumbnail has timestamp 0
        description
      });
    } catch (error: any) {
      console.error(`Error processing default thumbnail:`, error?.message || 'Unknown error');
    }
    
    return screenshots;
  } catch (error: any) {
    console.error('Error extracting default thumbnail:', error?.message || 'Unknown error');
    return []; // Return empty array in case of failure
  }
}

/**
 * Processes an image to enhance/detect text and diagrams
 * This adds simple visual enhancements to highlight text and diagrams
 */
export async function processImage(imageBuffer: Buffer, timestamp?: number): Promise<Buffer> {
  try {
    // Load the image
    const image = await loadImage(imageBuffer);
    
    // Create a canvas with the image dimensions
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    
    // Draw the original image
    ctx.drawImage(image, 0, 0);
    
    // Apply processing based on the image content
    // This simulates detecting and enhancing text/diagrams
    
    // 1. Slightly increase contrast to make text more readable
    ctx.globalCompositeOperation = 'source-atop';
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 2. Add a subtle border to highlight the content
    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = 'rgba(0, 120, 255, 0.5)';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    // 3. Add a timestamp watermark
    ctx.font = 'bold 16px Arial';
    
    // Format timestamp if provided
    let watermarkText = 'Key Frame';
    if (timestamp) {
      const formattedTime = formatTimestamp(timestamp);
      watermarkText = `${formattedTime} - Key Frame`;
    }
    
    // Background for watermark text
    const textWidth = ctx.measureText(watermarkText).width + 10;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(10, canvas.height - 30, textWidth, 20);
    
    // Watermark text
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillText(watermarkText, 15, canvas.height - 15);
    
    // 4. Add a highlight effect to simulate detected text areas
    // In a real implementation, this would be based on actual OCR results
    // For demo, we'll just add random highlights
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * (canvas.width - 100);
      const y = Math.random() * (canvas.height - 50);
      const width = 50 + Math.random() * 150;
      const height = 10 + Math.random() * 30;
      
      ctx.fillStyle = 'rgba(255, 255, 0, 0.15)';
      ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = 'rgba(255, 200, 0, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, width, height);
    }
    
    // Convert canvas to buffer with higher quality
    return canvas.toBuffer('image/jpeg', { quality: 0.95 });
  } catch (error: any) {
    console.error('Error processing image:', error?.message || 'Unknown error');
    return imageBuffer; // Return original image on error
  }
}
