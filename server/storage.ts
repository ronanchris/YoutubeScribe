import { 
  users, type User, type InsertUser,
  summaries, type Summary, type InsertSummary,
  screenshots, type Screenshot, type InsertScreenshot,
  type SummaryWithScreenshots
} from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private summaries: Map<number, Summary>;
  private screenshots: Map<number, Screenshot>;
  private currentUserId: number;
  private currentSummaryId: number;
  private currentScreenshotId: number;

  constructor() {
    this.users = new Map();
    this.summaries = new Map();
    this.screenshots = new Map();
    this.currentUserId = 1;
    this.currentSummaryId = 1;
    this.currentScreenshotId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Summary operations
  async getAllSummaries(): Promise<Summary[]> {
    return Array.from(this.summaries.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllSummariesWithScreenshots(): Promise<SummaryWithScreenshots[]> {
    const allSummaries = await this.getAllSummaries();
    
    const results = await Promise.all(
      allSummaries.map(async (summary) => {
        const screenshots = await this.getScreenshotsBySummaryId(summary.id);
        return { ...summary, screenshots };
      })
    );
    
    return results;
  }

  async getSummary(id: number): Promise<Summary | undefined> {
    return this.summaries.get(id);
  }

  async getSummaryWithScreenshots(id: number): Promise<SummaryWithScreenshots | undefined> {
    const summary = await this.getSummary(id);
    if (!summary) return undefined;
    
    const screenshots = await this.getScreenshotsBySummaryId(id);
    return { ...summary, screenshots };
  }

  async createSummary(insertSummary: InsertSummary): Promise<Summary> {
    const id = this.currentSummaryId++;
    const createdAt = new Date();
    const summary: Summary = { ...insertSummary, id, createdAt };
    this.summaries.set(id, summary);
    return summary;
  }

  async createSummaryWithScreenshots(
    insertSummary: InsertSummary, 
    insertScreenshots: InsertScreenshot[]
  ): Promise<SummaryWithScreenshots> {
    // Create summary
    const summary = await this.createSummary(insertSummary);
    
    // Create screenshots with the correct summaryId
    const screenshots = await Promise.all(
      insertScreenshots.map(screenshot => 
        this.createScreenshot({ ...screenshot, summaryId: summary.id })
      )
    );
    
    return { ...summary, screenshots };
  }

  async deleteSummary(id: number): Promise<boolean> {
    if (!this.summaries.has(id)) {
      return false;
    }
    
    // Delete the summary
    this.summaries.delete(id);
    
    // Delete all associated screenshots
    const screenshotsToDelete = Array.from(this.screenshots.values())
      .filter(screenshot => screenshot.summaryId === id);
    
    for (const screenshot of screenshotsToDelete) {
      this.screenshots.delete(screenshot.id);
    }
    
    return true;
  }

  // Screenshot operations
  async getScreenshotsBySummaryId(summaryId: number): Promise<Screenshot[]> {
    return Array.from(this.screenshots.values())
      .filter(screenshot => screenshot.summaryId === summaryId)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  async createScreenshot(insertScreenshot: InsertScreenshot): Promise<Screenshot> {
    const id = this.currentScreenshotId++;
    const screenshot: Screenshot = { ...insertScreenshot, id };
    this.screenshots.set(id, screenshot);
    return screenshot;
  }
}

export const storage = new MemStorage();
