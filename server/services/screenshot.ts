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

// Simple utility to get YouTube video thumbnail URLs at different timestamps
function getYouTubeThumbnailUrl(videoId: string, timestamp: number): string {
  // For real-world implementation, you'd use the YouTube Player API to get actual frames
  
  // Since YouTube doesn't provide an API to get frames at specific timestamps,
  // we'll simulate different thumbnails by using various available image variants
  const thumbnailOptions = [
    // Standard thumbnail options
    `https://i.ytimg.com/vi/${videoId}/default.jpg`,      // Default thumbnail (120x90)
    `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,    // Medium quality (320x180)
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,    // High quality (480x360)
    `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,    // Standard definition (640x480)
    
    // Alternative thumbnails that YouTube generates for videos
    `https://i.ytimg.com/vi/${videoId}/0.jpg`,            // First thumbnail
    `https://i.ytimg.com/vi/${videoId}/1.jpg`,            // Second thumbnail
    `https://i.ytimg.com/vi/${videoId}/2.jpg`,            // Third thumbnail
    `https://i.ytimg.com/vi/${videoId}/3.jpg`,            // Fourth thumbnail
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` // Maximum resolution
  ];
  
  // Map timestamp to a thumbnail index
  // For demo purposes, this ensures different timestamps get different thumbnails
  const index = Math.floor(timestamp / 60) % thumbnailOptions.length;
  
  return thumbnailOptions[index];
}

/**
 * Extracts and processes key screenshots from a YouTube video
 * Note: In a real implementation, this would involve:
 * 1. Downloading the video
 * 2. Extracting frames at regular intervals
 * 3. Processing frames for text/diagram detection
 * 4. Selecting the most informative frames
 * 
 * For this demo, we'll simulate by:
 * 1. Getting the video thumbnail at different timestamps
 * 2. Processing these images to detect text/diagrams
 */
export async function extractScreenshots(youtubeUrl: string): Promise<InsertScreenshot[]> {
  try {
    // Get the video ID and info (including duration)
    const videoId = extractVideoId(youtubeUrl);
    const videoInfo = await getVideoInfo(youtubeUrl);
    
    // Calculate optimal screenshot timestamps based on video duration
    // We'll take 4-6 screenshots distributed throughout the video
    const videoDuration = videoInfo.videoDuration;
    const numberOfScreenshots = Math.min(6, Math.max(4, Math.floor(videoDuration / 120)));
    
    // Generate timestamps at relatively even intervals, skipping the first and last 10%
    // This helps avoid intro/outro content and focuses on the main video content
    const startTime = Math.floor(videoDuration * 0.1); // Skip first 10%
    const endTime = Math.floor(videoDuration * 0.9);   // Skip last 10%
    const interval = Math.floor((endTime - startTime) / (numberOfScreenshots - 1));
    
    const timestamps: number[] = [];
    for (let i = 0; i < numberOfScreenshots; i++) {
      timestamps.push(startTime + (i * interval));
    }
    
    console.log(`Extracting ${timestamps.length} screenshots at timestamps:`, timestamps);
    
    const screenshots: InsertScreenshot[] = [];
    
    for (const timestamp of timestamps) {
      try {
        // Get thumbnail URL for this timestamp
        const thumbnailUrl = getYouTubeThumbnailUrl(videoId, timestamp);
        
        // Fetch the image
        const response = await axios.get(thumbnailUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data);
        
        // Process the image with canvas to simulate diagram/text detection
        const processedImage = await processImage(imageBuffer, timestamp);
        
        // Convert the processed image to base64
        const base64Image = processedImage.toString('base64');
        
        // Generate a description for the screenshot using OpenAI Vision
        const description = await analyzeScreenshot(base64Image, timestamp);
        
        // Add to screenshots collection
        screenshots.push({
          summaryId: 0, // Will be set when saving
          imageUrl: base64Image,
          timestamp,
          description
        });
      } catch (error: any) {
        console.error(`Error processing screenshot at timestamp ${timestamp}:`, error?.message || 'Unknown error');
        // Continue with other timestamps
      }
    }
    
    return screenshots;
  } catch (error: any) {
    console.error('Error extracting screenshots:', error?.message || 'Unknown error');
    return []; // Return empty array in case of failure
  }
}

/**
 * Processes an image to enhance/detect text and diagrams
 * This adds simple visual enhancements to highlight text and diagrams
 */
async function processImage(imageBuffer: Buffer, timestamp?: number): Promise<Buffer> {
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
