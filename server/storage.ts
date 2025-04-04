import { 
  users, type User, type InsertUser,
  summaries, type Summary, type InsertSummary,
  screenshots, type Screenshot, type InsertScreenshot,
  type SummaryWithScreenshots
} from "@shared/schema";
import * as fs from 'fs';
import * as path from 'path';

// File paths for persistent storage
const DATA_DIR = './data';
const STORAGE_FILE = path.join(DATA_DIR, 'storage.json');

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
}

// In-memory storage with file persistence
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private summaries: Map<number, Summary>;
  private screenshots: Map<number, Screenshot>;
  private currentUserId: number;
  private currentSummaryId: number;
  private currentScreenshotId: number;

  constructor() {
    // Initialize with default values
    this.users = new Map();
    this.summaries = new Map();
    this.screenshots = new Map();
    this.currentUserId = 1;
    this.currentSummaryId = 1;
    this.currentScreenshotId = 1;
    
    // Load data from persistent storage if available
    this.loadFromDisk();
  }
  
  // Load data from disk if available
  private loadFromDisk() {
    try {
      // Create data directory if it doesn't exist
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        console.log(`Created data directory: ${DATA_DIR}`);
        return; // No data file yet
      }
      
      // Check if storage file exists
      if (!fs.existsSync(STORAGE_FILE)) {
        console.log('No storage file found, starting with empty storage');
        return;
      }
      
      // Read and parse storage file
      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      const parsed = JSON.parse(data);
      
      // Populate storage from parsed data
      if (parsed.users) {
        this.users = new Map(Object.entries(parsed.users).map(([id, user]) => [Number(id), user as User]));
      }
      
      if (parsed.summaries) {
        this.summaries = new Map(Object.entries(parsed.summaries).map(([id, summary]) => {
          // Convert createdAt string back to Date
          const typedSummary = summary as Summary;
          typedSummary.createdAt = new Date(typedSummary.createdAt);
          return [Number(id), typedSummary];
        }));
      }
      
      if (parsed.screenshots) {
        this.screenshots = new Map(Object.entries(parsed.screenshots).map(([id, screenshot]) => 
          [Number(id), screenshot as Screenshot]
        ));
      }
      
      // Set counters for next IDs
      this.currentUserId = parsed.currentUserId || 1;
      this.currentSummaryId = parsed.currentSummaryId || 1;
      this.currentScreenshotId = parsed.currentScreenshotId || 1;
      
      console.log('Successfully loaded storage from disk');
      console.log(`- Loaded ${this.users.size} users`);
      console.log(`- Loaded ${this.summaries.size} summaries`);
      console.log(`- Loaded ${this.screenshots.size} screenshots`);
    } catch (error) {
      console.error('Error loading from disk:', error);
      // Continue with empty storage
    }
  }
  
  // Save data to disk
  private saveToDisk() {
    try {
      // Ensure data directory exists
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      
      // Convert Maps to plain objects for JSON serialization
      const data = {
        users: Object.fromEntries(this.users),
        summaries: Object.fromEntries(this.summaries),
        screenshots: Object.fromEntries(this.screenshots),
        currentUserId: this.currentUserId,
        currentSummaryId: this.currentSummaryId,
        currentScreenshotId: this.currentScreenshotId
      };
      
      // Write to file
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
      console.log('Successfully saved storage to disk');
    } catch (error) {
      console.error('Error saving to disk:', error);
    }
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
    this.saveToDisk();
    return user;
  }

  // Summary operations
  async getAllSummaries(): Promise<Summary[]> {
    return Array.from(this.summaries.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllSummariesWithScreenshots(): Promise<SummaryWithScreenshots[]> {
    const allSummaries = await this.getAllSummaries();
    console.log(`getAllSummariesWithScreenshots: Found ${allSummaries.length} summaries`);
    
    if (allSummaries.length === 0) {
      console.log('Warning: No summaries found in storage!');
      // Dump current state of storage for debugging
      console.log('Current storage state:');
      console.log(`- Summaries map size: ${this.summaries.size}`);
      console.log(`- Screenshots map size: ${this.screenshots.size}`);
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
    // Using defaults from the schema
    const summary: Summary = { 
      ...insertSummary, 
      id, 
      createdAt,
      videoDuration: insertSummary.videoDuration ?? 0,
      keyPoints: insertSummary.keyPoints ?? []
    };
    this.summaries.set(id, summary);
    this.saveToDisk();
    console.log(`Created summary with ID: ${id}`);
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
          summaryId: summary.id,
          description: screenshot.description ?? ""
        })
      )
    );
    
    console.log(`Created summary with ${screenshots.length} screenshots, ID: ${summary.id}`);
    console.log('Total summaries in storage:', this.summaries.size);
    this.saveToDisk();
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
    
    this.saveToDisk();
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
    // Using the default from the schema
    const screenshot: Screenshot = { 
      ...insertScreenshot, 
      id,
      description: insertScreenshot.description ?? ""
    };
    this.screenshots.set(id, screenshot);
    return screenshot;
  }
}

export const storage = new MemStorage();
