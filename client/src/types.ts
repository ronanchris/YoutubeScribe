// Basic type definitions for the client side
// These mirror the types defined in shared/schema.ts

export interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

export interface Screenshot {
  id: number;
  summaryId: number;
  timestamp: number;
  imageUrl: string;
  description: string;
  createdAt: string;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_cost: number;
  completion_cost: number;
  total_cost: number;
  transcript_length?: number;
  truncated_length?: number;
  was_truncated?: boolean;
  model?: string;
  prompt_type?: string;
}

export interface Summary {
  id: number;
  userId: number;
  videoId: string;
  videoUrl: string;
  videoTitle: string;
  videoAuthor: string;
  videoDuration: number;
  transcript: string;
  summary: string;
  keyPoints: string[];
  structuredOutline: { title: string; items: string[] }[];
  promptTemplate: string;
  createdAt: string;
  updatedAt: string;
  tokenUsage: TokenUsage;
  // Include these properties to maintain compatibility with shared schema
  fullPrompt?: string;
}

export interface SummaryWithScreenshots extends Summary {
  screenshots: Screenshot[];
}