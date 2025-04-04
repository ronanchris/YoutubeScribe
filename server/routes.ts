import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { youtubeUrlSchema } from "@shared/schema";
import { getVideoTranscript, getVideoInfo } from "./services/youtube";
import { generateSummary } from "./services/openai";
import { extractScreenshots } from "./services/screenshot";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all summaries
  app.get("/api/summaries", async (req, res) => {
    try {
      const summaries = await storage.getAllSummariesWithScreenshots();
      res.json(summaries);
    } catch (error) {
      console.error("Error getting summaries:", error);
      res.status(500).json({ message: "Failed to retrieve summaries" });
    }
  });

  // Get a single summary by ID
  app.get("/api/summaries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid summary ID" });
      }

      const summary = await storage.getSummaryWithScreenshots(id);
      if (!summary) {
        return res.status(404).json({ message: "Summary not found" });
      }

      res.json(summary);
    } catch (error) {
      console.error("Error getting summary:", error);
      res.status(500).json({ message: "Failed to retrieve summary" });
    }
  });

  // Generate a new summary from YouTube URL
  app.post("/api/summaries", async (req, res) => {
    try {
      // Validate YouTube URL
      const { url } = youtubeUrlSchema.parse(req.body);
      
      // 1. Get video info (title, author, etc.)
      const videoInfo = await getVideoInfo(url);
      
      // 2. Get video transcript
      const transcript = await getVideoTranscript(url);
      if (!transcript) {
        return res.status(400).json({ 
          message: "Could not extract transcript. The video might not have captions available." 
        });
      }
      
      // 3. Generate AI summary
      const summaryData = await generateSummary(transcript, videoInfo);
      
      // 4. Extract key screenshots
      const screenshots = await extractScreenshots(url);
      
      // 5. Save everything to storage
      const newSummary = await storage.createSummaryWithScreenshots(
        summaryData,
        screenshots
      );
      
      res.status(201).json(newSummary);
    } catch (error) {
      console.error("Error generating summary:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ 
        message: "Failed to generate summary", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Delete a summary
  app.delete("/api/summaries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid summary ID" });
      }

      const success = await storage.deleteSummary(id);
      if (!success) {
        return res.status(404).json({ message: "Summary not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting summary:", error);
      res.status(500).json({ message: "Failed to delete summary" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
