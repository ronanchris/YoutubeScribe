import { 
  users, type User, type InsertUser, type InviteUser,
  summaries, type Summary, type InsertSummary,
  screenshots, type Screenshot, type InsertScreenshot,
  type SummaryWithScreenshots
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, isNull } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";
import { randomBytes } from "crypto";

// Storage interface definition
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  promoteToAdmin(id: number): Promise<User | undefined>;
  demoteFromAdmin(id: number): Promise<User | undefined>;
  
  // Invitation operations
  createInvitation(inviteData: InviteUser): Promise<{ user: User; token: string }>;
  getUserByInvitationToken(token: string): Promise<User | undefined>;
  updateUserPassword(id: number, newPassword: string): Promise<User | undefined>;
  invalidateInvitationToken(userId: number): Promise<boolean>;
  
  // Summary operations
  getAllSummaries(): Promise<Summary[]>;
  getAllSummariesWithScreenshots(): Promise<SummaryWithScreenshots[]>;
  getSummary(id: number): Promise<Summary | undefined>;
  getSummaryWithScreenshots(id: number): Promise<SummaryWithScreenshots | undefined>;
  createSummary(summary: InsertSummary): Promise<Summary>;
  createSummaryWithScreenshots(summary: InsertSummary, screenshots: InsertScreenshot[]): Promise<SummaryWithScreenshots>;
  deleteSummary(id: number): Promise<boolean>;
  
  // Screenshot operations
  getScreenshotsBySummaryId(summaryId: number): Promise<Screenshot[]>;
  createScreenshot(screenshot: InsertScreenshot): Promise<Screenshot>;
  
  // Session store for authentication
  sessionStore: session.Store;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // Session store for authentication
  sessionStore: session.Store;
  
  constructor() {
    // Set up memory session store for simplicity
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    console.log('Database storage initialized');
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    console.log(`Created user with ID: ${user.id}`);
    return user;
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(users.id);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    try {
      // Don't allow updating password through this method for security
      const { password, ...updateData } = userData;
      
      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      // Don't delete the user if they're the only admin
      const allUsers = await this.getAllUsers();
      const adminUsers = allUsers.filter(user => user.isAdmin);
      
      const userToDelete = await this.getUser(id);
      
      if (userToDelete?.isAdmin && adminUsers.length <= 1) {
        console.error('Cannot delete the only admin user');
        return false;
      }
      
      const result = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id });
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }
  
  async promoteToAdmin(id: number): Promise<User | undefined> {
    return this.updateUser(id, { isAdmin: true });
  }
  
  async demoteFromAdmin(id: number): Promise<User | undefined> {
    // Don't demote if this is the only admin
    const allUsers = await this.getAllUsers();
    const adminUsers = allUsers.filter(user => user.isAdmin);
    
    if (adminUsers.length <= 1) {
      console.error('Cannot demote the only admin user');
      return undefined;
    }
    
    return this.updateUser(id, { isAdmin: false });
  }

  // Invitation operations
  async createInvitation(inviteData: InviteUser): Promise<{ user: User; token: string }> {
    // Generate a random token
    const token = randomBytes(32).toString('hex');
    
    // Set token expiry to 7 days from now
    const tokenExpiry = new Date();
    tokenExpiry.setDate(tokenExpiry.getDate() + 7);
    
    // Create a temporary password (will be required to change on first login)
    const temporaryPassword = randomBytes(12).toString('hex');
    
    // Create the user with invitation token
    const [user] = await db.insert(users).values({
      username: inviteData.email, // Use email as username initially
      password: temporaryPassword, // Will be hashed in the auth service before insertion
      isAdmin: inviteData.isAdmin,
      invitationToken: token,
      tokenExpiry,
      isPasswordChangeRequired: true,
    }).returning();
    
    console.log(`Created invitation for user ID: ${user.id} with token`);
    return { user, token };
  }
  
  async getUserByInvitationToken(token: string): Promise<User | undefined> {
    console.log(`Looking up user with invitation token: ${token}`);
    
    // First just find the user with the token, regardless of expiry
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.invitationToken, token));
    
    if (!user) {
      console.log('No user found with this token');
      return undefined;
    }
    
    console.log(`Found user ID: ${user.id} with token`);
    
    // Now check if the token has expired
    const now = new Date();
    if (user.tokenExpiry && now > user.tokenExpiry) {
      console.log(`Token expired at ${user.tokenExpiry}, current time is ${now}`);
      return user; // Still return the user, let the route handle expiry messaging
    }
    
    return user;
  }
  
  async updateUserPassword(id: number, newPassword: string): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({ 
          password: newPassword, // Will be hashed in the auth service before update
          isPasswordChangeRequired: false,
          invitationToken: null,
          tokenExpiry: null
        })
        .where(eq(users.id, id))
        .returning();
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating user password:', error);
      return undefined;
    }
  }
  
  async invalidateInvitationToken(userId: number): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({ 
          invitationToken: null,
          tokenExpiry: null
        })
        .where(eq(users.id, userId));
      
      return true;
    } catch (error) {
      console.error('Error invalidating invitation token:', error);
      return false;
    }
  }

  // Summary operations
  async getAllSummaries(): Promise<Summary[]> {
    return db.select().from(summaries).orderBy(desc(summaries.createdAt));
  }

  async getAllSummariesWithScreenshots(): Promise<SummaryWithScreenshots[]> {
    const allSummaries = await this.getAllSummaries();
    console.log(`getAllSummariesWithScreenshots: Found ${allSummaries.length} summaries`);
    
    if (allSummaries.length === 0) {
      console.log('Warning: No summaries found in storage!');
      return [];
    }
    
    const results = await Promise.all(
      allSummaries.map(async (summary) => {
        const screenshots = await this.getScreenshotsBySummaryId(summary.id);
        console.log(`Got ${screenshots.length} screenshots for summary ${summary.id}`);
        return { ...summary, screenshots };
      })
    );
    
    return results;
  }

  async getSummary(id: number): Promise<Summary | undefined> {
    const [summary] = await db.select().from(summaries).where(eq(summaries.id, id));
    return summary;
  }

  async getSummaryWithScreenshots(id: number): Promise<SummaryWithScreenshots | undefined> {
    const summary = await this.getSummary(id);
    if (!summary) return undefined;
    
    const screenshots = await this.getScreenshotsBySummaryId(id);
    return { ...summary, screenshots };
  }

  async createSummary(insertSummary: InsertSummary): Promise<Summary> {
    const [summary] = await db.insert(summaries).values(insertSummary).returning();
    console.log(`Created summary with ID: ${summary.id}`);
    return summary;
  }

  async createSummaryWithScreenshots(
    insertSummary: InsertSummary, 
    insertScreenshots: InsertScreenshot[]
  ): Promise<SummaryWithScreenshots> {
    console.log('Creating summary with screenshots...');
    
    // Create summary
    const summary = await this.createSummary(insertSummary);
    
    // Create screenshots with the correct summaryId
    const screenshots = await Promise.all(
      insertScreenshots.map(screenshot => 
        this.createScreenshot({ 
          ...screenshot, 
          summaryId: summary.id 
        })
      )
    );
    
    console.log(`Created summary with ${screenshots.length} screenshots, ID: ${summary.id}`);
    return { ...summary, screenshots };
  }

  async deleteSummary(id: number): Promise<boolean> {
    try {
      // First delete all associated screenshots
      await db.delete(screenshots).where(eq(screenshots.summaryId, id));
      
      // Then delete the summary
      const result = await db.delete(summaries).where(eq(summaries.id, id)).returning({ id: summaries.id });
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting summary:', error);
      return false;
    }
  }

  // Screenshot operations
  async getScreenshotsBySummaryId(summaryId: number): Promise<Screenshot[]> {
    return db
      .select()
      .from(screenshots)
      .where(eq(screenshots.summaryId, summaryId))
      .orderBy(screenshots.timestamp);
  }

  async createScreenshot(insertScreenshot: InsertScreenshot): Promise<Screenshot> {
    const [screenshot] = await db.insert(screenshots).values(insertScreenshot).returning();
    return screenshot;
  }
}

// Create a DatabaseStorage instance for the application
export const storage = new DatabaseStorage();
