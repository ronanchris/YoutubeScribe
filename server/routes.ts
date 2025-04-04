import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { youtubeUrlSchema } from "@shared/schema";
import { getVideoTranscript, getVideoInfo } from "./services/youtube";
import { generateSummary } from "./services/openai";
import { extractScreenshots } from "./services/screenshot";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";

// Middleware to ensure user is authenticated
function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Get all summaries - requires authentication
  app.get("/api/summaries", ensureAuthenticated, async (req, res) => {
    try {
      const summaries = await storage.getAllSummariesWithScreenshots();
      res.json(summaries);
    } catch (error) {
      console.error("Error getting summaries:", error);
      res.status(500).json({ message: "Failed to retrieve summaries" });
    }
  });

  // Get a single summary by ID - requires authentication
  app.get("/api/summaries/:id", ensureAuthenticated, async (req, res) => {
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

  // Generate a new summary from YouTube URL - requires authentication
  app.post("/api/summaries", ensureAuthenticated, async (req, res) => {
    try {
      // Validate YouTube URL
      const { url } = youtubeUrlSchema.parse(req.body);
      console.log("Processing YouTube URL:", url);
      
      // 1. Get video info (title, author, etc.)
      const videoInfo = await getVideoInfo(url);
      console.log("Got video info:", { title: videoInfo.videoTitle, author: videoInfo.videoAuthor });
      
      // 2. Get video transcript
      const transcript = await getVideoTranscript(url);
      if (!transcript) {
        return res.status(400).json({ 
          message: "Could not extract transcript. The video might not have captions available." 
        });
      }
      console.log("Got transcript, length:", transcript.length);
      
      // 3. Generate AI summary
      console.log("Generating summary with OpenAI...");
      const summaryData = await generateSummary(transcript, videoInfo);
      console.log("Summary generated successfully");
      
      // 4. Extract key screenshots
      console.log("Extracting screenshots...");
      const screenshots = await extractScreenshots(url);
      console.log(`Extracted ${screenshots.length} screenshots`);
      
      // 5. Save everything to storage
      console.log("Saving to storage...");
      const newSummary = await storage.createSummaryWithScreenshots(
        summaryData,
        screenshots
      );
      console.log("Saved successfully with ID:", newSummary.id);
      
      // 6. Verify the summary was stored properly
      const allSummaries = await storage.getAllSummariesWithScreenshots();
      console.log(`Total summaries in storage: ${allSummaries.length}`);
      
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

  // Delete a summary - requires authentication
  app.delete("/api/summaries/:id", ensureAuthenticated, async (req, res) => {
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
