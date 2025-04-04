import OpenAI from "openai";
import { InsertSummary } from "@shared/schema";
import { formatTimestamp } from "./screenshot";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key-for-development" });

/**
 * Generates a structured summary of a video transcript using OpenAI GPT-4o
 */
export async function generateSummary(
  transcript: string,
  videoInfo: {
    videoId: string;
    videoUrl: string;
    videoTitle: string;
    videoAuthor: string;
    videoDuration: number;
  }
): Promise<InsertSummary> {
  try {
    // Truncate transcript if it's too long to fit in a single API call
    const maxTranscriptLength = 14000; // Safe limit for context window
    const truncatedTranscript = transcript.length > maxTranscriptLength
      ? transcript.substring(0, maxTranscriptLength) + "... [transcript truncated due to length]"
      : transcript;

    // Build the system prompt
    const systemPrompt = `
      You are an expert video content analyzer. Your task is to analyze the transcript of a YouTube video
      and produce a comprehensive, structured summary. Follow these guidelines:
      
      1. Create a concise list of key points (5-10 bullet points)
      2. Generate a detailed summary paragraph (3-5 paragraphs)
      3. Create a structured outline of the content with hierarchical sections
      
      The output must be in the following JSON format:
      {
        "keyPoints": ["point 1", "point 2", ...],
        "summary": "Detailed summary text...",
        "structuredOutline": [
          {
            "title": "Section Title",
            "items": ["Subsection or point 1", "Subsection or point 2", ...]
          },
          ...
        ]
      }
      
      Ensure the summary is accurate, concise, and follows a logical structure. Focus on the main concepts, arguments, and information presented.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Here's the transcript of a YouTube video titled "${videoInfo.videoTitle}" by ${videoInfo.videoAuthor}:\n\n${truncatedTranscript}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2, // Lower temperature for more predictable, factual responses
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI API");
    }

    // Parse the JSON response
    const parsedContent = JSON.parse(content);

    // Build and return the summary object
    return {
      videoId: videoInfo.videoId,
      videoUrl: videoInfo.videoUrl,
      videoTitle: videoInfo.videoTitle,
      videoAuthor: videoInfo.videoAuthor,
      videoDuration: videoInfo.videoDuration,
      keyPoints: parsedContent.keyPoints,
      summary: parsedContent.summary,
      structuredOutline: parsedContent.structuredOutline,
    };
  } catch (error) {
    console.error("Error generating summary with OpenAI:", error);
    throw new Error(
      `Failed to generate summary: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Analyzes a screenshot image to generate a description
 */
export async function analyzeScreenshot(
  imageBase64: string,
  timestamp: number
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing visual content from videos. Describe what is shown in this screenshot in a concise phrase (max 8 words). Focus on diagrams, text outlines, or key visual elements if present."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Describe this video screenshot concisely:"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ],
        },
      ],
      max_tokens: 50,
    });

    return response.choices[0].message.content || `Screenshot at ${formatTimestamp(timestamp)}`;
  } catch (error) {
    console.error("Error analyzing screenshot with OpenAI:", error);
    return `Screenshot at ${formatTimestamp(timestamp)}`;
  }
}

// We're now using the shared formatTimestamp function from "./screenshot"
