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
import crypto from "crypto";

// Using auth middleware from auth.ts

// Helper function to generate invitation links with correct domain
function generateInvitationLink(req: Request, token: string): string {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const baseUrl = `${protocol}://${req.get('host')}`;
  return `${baseUrl}/accept-invitation?token=${token}`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Get all summaries - requires authentication
  app.get("/api/summaries", ensureAuthenticated, async (req, res) => {
    try {
      // ensureAuthenticated guarantees req.user exists
      const userId = req.user!.id;
      const summaries = await storage.getUserSummariesWithScreenshots(userId);
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

      // Pass the requesting user's ID to the storage method
      const userId = req.user!.id;
      const summary = await storage.getSummaryWithScreenshots(id, userId);
      
      if (!summary) {
        return res.status(404).json({ message: "Summary not found or you don't have permission to access it" });
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
      // The error handling for userId is now in storage.ts
      const newSummary = await storage.createSummaryWithScreenshots(
        {
          ...summaryData,
          userId: req.user!.id // Associate summary with the current user
        },
        screenshots
      );
      console.log("Saved successfully with ID:", newSummary.id);
      
      // 6. Verify that just this user's summaries were updated properly
      const userSummaries = await storage.getUserSummariesWithScreenshots(req.user!.id);
      console.log(`Total summaries for user ${req.user!.id}: ${userSummaries.length}`);
      
      // Return the summary
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
      
      // First check if the summary exists and belongs to the user
      const userId = req.user!.id;
      const summary = await storage.getSummary(id);
      
      if (!summary) {
        return res.status(404).json({ message: "Summary not found" });
      }
      
      // Check if the summary belongs to the user
      if (summary.userId !== undefined && summary.userId !== userId) {
        console.log(`Delete access denied: User ${userId} attempted to delete summary ${id} belonging to user ${summary.userId}`);
        return res.status(403).json({ message: "You don't have permission to delete this summary" });
      }

      const success = await storage.deleteSummary(id);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete summary" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting summary:", error);
      res.status(500).json({ message: "Failed to delete summary" });
    }
  });

  // Admin routes - require admin privileges
  
  // Get all summaries across all users - admin only
  app.get("/api/admin/summaries", ensureAdmin, async (req, res) => {
    try {
      const summaries = await storage.getAllSummariesWithScreenshots();
      res.json(summaries);
    } catch (error) {
      console.error("Error getting all summaries:", error);
      res.status(500).json({ message: "Failed to retrieve summaries" });
    }
  });
  
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
      
      // Create the invitation link with correct domain
      const invitationLink = generateInvitationLink(req, token);
      
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
      
      // Generate a new token for the existing user instead of creating a new user
      const token = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = new Date();
      tokenExpiry.setDate(tokenExpiry.getDate() + 7); // Token valid for 7 days
      
      // Update the user with the new token
      await storage.updateUser(id, {
        invitationToken: token,
        tokenExpiry,
        isPasswordChangeRequired: true
      });
      
      // Create the invitation link with correct domain
      const invitationLink = generateInvitationLink(req, token);
      
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
      
      console.log("Validating token:", token);
      
      // Get the user with this token
      const user = await storage.getUserByInvitationToken(token);
      console.log("User found with token:", user ? `User ID: ${user.id}` : "No user found");
      
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
