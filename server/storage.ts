import { 
  users, type User, type InsertUser,
  summaries, type Summary, type InsertSummary,
  screenshots, type Screenshot, type InsertScreenshot,
  type SummaryWithScreenshots
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Storage interface definition
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
    // Set up PostgreSQL session store
    const PostgresStore = connectPg(session);
    this.sessionStore = new PostgresStore({
      pool, 
      createTableIfMissing: true
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
