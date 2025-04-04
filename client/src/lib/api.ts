import { SummaryWithScreenshots, YoutubeUrlInput } from "@shared/schema";
import { apiRequest } from "./queryClient";

// Create a new summary from a YouTube URL
export async function createSummary(input: YoutubeUrlInput): Promise<SummaryWithScreenshots> {
  const response = await apiRequest("POST", "/api/summaries", input);
  return response.json();
}

// Get all summaries
export async function getSummaries(): Promise<SummaryWithScreenshots[]> {
  const response = await apiRequest("GET", "/api/summaries");
  return response.json();
}

// Get a single summary by ID
export async function getSummary(id: number): Promise<SummaryWithScreenshots> {
  const response = await apiRequest("GET", `/api/summaries/${id}`);
  return response.json();
}

// Delete a summary
export async function deleteSummary(id: number): Promise<void> {
  await apiRequest("DELETE", `/api/summaries/${id}`);
}
