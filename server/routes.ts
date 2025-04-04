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
import { updateUserSchema, adminInsertUserSchema } from "@shared/schema";

// Middleware to ensure user is authenticated
function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Middleware to ensure user is an admin
function ensureAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user && req.user.isAdmin) {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Admin privileges required" });
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

  // Admin routes - require admin privileges
  
  // Get all users - admin only
  app.get("/api/admin/users", ensureAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Don't send passwords to client
      const sanitizedUsers = users.map(({ password, ...user }) => user);
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Error getting users:", error);
      res.status(500).json({ message: "Failed to retrieve users" });
    }
  });
  
  // Create a new user - admin only
  app.post("/api/admin/users", ensureAdmin, async (req, res) => {
    try {
      const userData = adminInsertUserSchema.parse(req.body);
      const newUser = await storage.createUser(userData);
      
      // Don't send password back to client
      const { password, ...sanitizedUser } = newUser;
      res.status(201).json(sanitizedUser);
    } catch (error) {
      console.error("Error creating user:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ 
        message: "Failed to create user", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Update a user - admin only
  app.patch("/api/admin/users/:id", ensureAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const updateData = updateUserSchema.parse(req.body);
      const updatedUser = await storage.updateUser(id, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password back to client
      const { password, ...sanitizedUser } = updatedUser;
      res.json(sanitizedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ 
        message: "Failed to update user", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Delete a user - admin only
  app.delete("/api/admin/users/:id", ensureAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Make sure admin can't delete themselves
      if (id === req.user?.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ message: "User not found or cannot be deleted" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  
  // Promote a user to admin - admin only
  app.post("/api/admin/users/:id/promote", ensureAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const updatedUser = await storage.promoteToAdmin(id);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password back to client
      const { password, ...sanitizedUser } = updatedUser;
      res.json(sanitizedUser);
    } catch (error) {
      console.error("Error promoting user:", error);
      res.status(500).json({ message: "Failed to promote user" });
    }
  });
  
  // Demote a user from admin - admin only
  app.post("/api/admin/users/:id/demote", ensureAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Make sure admin can't demote themselves
      if (id === req.user?.id) {
        return res.status(400).json({ message: "Cannot demote yourself" });
      }
      
      const updatedUser = await storage.demoteFromAdmin(id);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found or cannot be demoted" });
      }
      
      // Don't send password back to client
      const { password, ...sanitizedUser } = updatedUser;
      res.json(sanitizedUser);
    } catch (error) {
      console.error("Error demoting user:", error);
      res.status(500).json({ message: "Failed to demote user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
