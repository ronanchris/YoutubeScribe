import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { youtubeUrlSchema } from "@shared/schema";
import { getVideoTranscript, getVideoInfo } from "./services/youtube";
import { generateSummary } from "./services/openai";
import { extractScreenshots } from "./services/screenshot";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth, ensureAuthenticated, ensureAdmin, hashPassword } from "./auth";
import { updateUserSchema, adminInsertUserSchema, inviteUserSchema } from "@shared/schema";

// Using auth middleware from auth.ts

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
  
  // Create invitation - admin only
  app.post("/api/admin/invitations", ensureAdmin, async (req, res) => {
    try {
      const inviteData = inviteUserSchema.parse(req.body);
      
      // Check if the email already exists as a username
      const existingUser = await storage.getUserByUsername(inviteData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Create the invitation
      const { user, token } = await storage.createInvitation({
        ...inviteData,
        email: inviteData.email.trim().toLowerCase()
      });
      
      // Create the invitation link
      const baseUrl = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`;
      const invitationLink = `${baseUrl}/accept-invitation?token=${token}`;
      
      // Return the user and invitation link
      res.status(201).json({ 
        user: { id: user.id, username: user.username, isAdmin: user.isAdmin },
        invitationLink
      });
    } catch (error) {
      console.error("Error creating invitation:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ 
        message: "Failed to create invitation", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Regenerate invitation link for existing user - admin only
  app.post("/api/admin/users/:id/regenerate-invitation", ensureAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Get the user to verify existence
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create a new invitation token for the user
      await storage.invalidateInvitationToken(id); // Clear any existing tokens
      const { token } = await storage.createInvitation({
        email: user.username,
        isAdmin: user.isAdmin
      });
      
      // Create the invitation link
      const baseUrl = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`;
      const invitationLink = `${baseUrl}/accept-invitation?token=${token}`;
      
      res.json({ invitationLink });
    } catch (error) {
      console.error("Error regenerating invitation:", error);
      res.status(500).json({ 
        message: "Failed to regenerate invitation", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Validate invitation token - public
  app.get("/api/validate-invitation", async (req, res) => {
    try {
      const token = req.query.token as string;
      if (!token) {
        return res.status(400).json({ valid: false, message: "Token is required" });
      }
      
      // Get the user with this token
      const user = await storage.getUserByInvitationToken(token);
      if (!user) {
        return res.json({ valid: false, message: "Invalid or expired invitation" });
      }
      
      // Check if token is expired
      if (user.tokenExpiry && new Date() > user.tokenExpiry) {
        return res.json({ 
          valid: false, 
          message: "Invitation has expired. Please ask an administrator for a new invitation." 
        });
      }
      
      res.json({ 
        valid: true, 
        username: user.username 
      });
    } catch (error) {
      console.error("Error validating invitation:", error);
      res.status(500).json({ 
        valid: false, 
        message: "Failed to validate invitation" 
      });
    }
  });
  
  // Accept invitation - public
  app.post("/api/accept-invitation", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }
      
      // Get the user with this token
      const user = await storage.getUserByInvitationToken(token);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired invitation" });
      }
      
      // Check if token is expired
      if (user.tokenExpiry && new Date() > user.tokenExpiry) {
        return res.status(400).json({ 
          message: "Invitation has expired. Please ask an administrator for a new invitation." 
        });
      }
      
      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update the user's password and invalidate the token
      const updatedUser = await storage.updateUserPassword(user.id, hashedPassword);
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user password" });
      }
      
      // Invalidate the invitation token
      await storage.invalidateInvitationToken(user.id);
      
      // Log the user in
      req.login(updatedUser, (err) => {
        if (err) {
          console.error("Error logging in after accepting invitation:", err);
          return res.status(500).json({ message: "Failed to log in" });
        }
        
        res.json(updatedUser);
      });
    } catch (error) {
      console.error("Error accepting invitation:", error);
      res.status(500).json({ 
        message: "Failed to accept invitation", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
