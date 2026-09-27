import { reports, comments, plateLookups, users } from '@shared/schema';
import type { Report, InsertReport, Comment, InsertComment, User, InsertUser } from '@shared/schema';
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, desc, sql } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

// Auto-create tables on first run
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL DEFAULT 'Anonymous Driver',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    license_plate TEXT NOT NULL,
    make TEXT,
    model TEXT,
    location TEXT NOT NULL,
    state TEXT,
    media_type TEXT NOT NULL DEFAULT 'photo',
    media_data TEXT,
    incident_type TEXT NOT NULL DEFAULT 'reckless',
    author_name TEXT NOT NULL DEFAULT 'Anonymous Driver',
    user_id INTEGER,
    upvotes INTEGER NOT NULL DEFAULT 0,
    downvotes INTEGER NOT NULL DEFAULT 0,
    views INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    author_name TEXT NOT NULL DEFAULT 'Anonymous Driver',
    user_id INTEGER,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS plate_lookups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    license_plate TEXT NOT NULL,
    lookup_count INTEGER NOT NULL DEFAULT 0,
    last_looked_up TEXT NOT NULL
  );
`);

// Add lat/long columns to existing reports table (migration)
try { sqlite.exec(`ALTER TABLE reports ADD COLUMN latitude REAL;`); } catch {}
try { sqlite.exec(`ALTER TABLE reports ADD COLUMN longitude REAL;`); } catch {}

export interface IStorage {
  // Users
  createUser(user: InsertUser & { passwordHash: string }): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  // Reports
  getAllReports(): Promise<Report[]>;
  getReport(id: number): Promise<Report | undefined>;
  getReportsByPlate(plate: string): Promise<Report[]>;
  getNearbyReports(lat: number, lng: number, radiusMiles: number): Promise<Report[]>;
  createReport(report: InsertReport & { userId?: number }): Promise<Report>;
  upvoteReport(id: number): Promise<Report | undefined>;
  downvoteReport(id: number): Promise<Report | undefined>;
  incrementViews(id: number): Promise<void>;
  incrementComments(id: number): Promise<void>;
  // Comments
  getComments(reportId: number): Promise<Comment[]>;
  createComment(comment: InsertComment & { userId?: number }): Promise<Comment>;
  // Plate lookup
  lookupPlate(plate: string): Promise<{ reports: Report[]; lookupCount: number }>;
  // Stats
  getStats(): Promise<{ totalReports: number; totalUpvotes: number; totalComments: number; topStates: { state: string; count: number }[] }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async createUser(user: InsertUser & { passwordHash: string }): Promise<User> {
    return db.insert(users).values({
      username: user.username,
      passwordHash: user.passwordHash,
      displayName: user.displayName || "Anonymous Driver",
    }).returning().get();
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.username, username)).get();
  }

  async getUserById(id: number): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.id, id)).get();
  }

  // Reports
  async getAllReports(): Promise<Report[]> {
    return db.select().from(reports).orderBy(desc(reports.createdAt)).all();
  }

  async getReport(id: number): Promise<Report | undefined> {
    return db.select().from(reports).where(eq(reports.id, id)).get();
  }

  async getReportsByPlate(plate: string): Promise<Report[]> {
    return db.select().from(reports).where(eq(reports.licensePlate, plate.toUpperCase())).orderBy(desc(reports.createdAt)).all();
  }

  async getNearbyReports(lat: number, lng: number, radiusMiles: number): Promise<Report[]> {
    const allReports = db.select().from(reports).orderBy(desc(reports.createdAt)).all();
    // Haversine distance filter
    return allReports.filter(r => {
      if (r.latitude == null || r.longitude == null) return false;
      const R = 3958.8; // Earth radius in miles
      const dLat = (r.latitude - lat) * Math.PI / 180;
      const dLng = (r.longitude - lng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat * Math.PI / 180) * Math.cos(r.latitude * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = R * c;
      return dist <= radiusMiles;
    });
  }

  async createReport(report: InsertReport & { userId?: number }): Promise<Report> {
    const data = { ...report, licensePlate: report.licensePlate.toUpperCase() };
    return db.insert(reports).values(data).returning().get();
  }

  async upvoteReport(id: number): Promise<Report | undefined> {
    const report = db.select().from(reports).where(eq(reports.id, id)).get();
    if (!report) return undefined;
    db.update(reports).set({ upvotes: report.upvotes + 1 }).where(eq(reports.id, id)).run();
    return db.select().from(reports).where(eq(reports.id, id)).get();
  }

  async downvoteReport(id: number): Promise<Report | undefined> {
    const report = db.select().from(reports).where(eq(reports.id, id)).get();
    if (!report) return undefined;
    db.update(reports).set({ downvotes: report.downvotes + 1 }).where(eq(reports.id, id)).run();
    return db.select().from(reports).where(eq(reports.id, id)).get();
  }

  async incrementViews(id: number): Promise<void> {
    const report = db.select().from(reports).where(eq(reports.id, id)).get();
    if (report) {
      db.update(reports).set({ views: report.views + 1 }).where(eq(reports.id, id)).run();
    }
  }

  async incrementComments(id: number): Promise<void> {
    const report = db.select().from(reports).where(eq(reports.id, id)).get();
    if (report) {
      db.update(reports).set({ commentCount: report.commentCount + 1 }).where(eq(reports.id, id)).run();
    }
  }

  async getComments(reportId: number): Promise<Comment[]> {
    return db.select().from(comments).where(eq(comments.reportId, reportId)).orderBy(desc(comments.createdAt)).all();
  }

  async createComment(comment: InsertComment & { userId?: number }): Promise<Comment> {
    return db.insert(comments).values(comment).returning().get();
  }

  async lookupPlate(plate: string): Promise<{ reports: Report[]; lookupCount: number }> {
    const upperPlate = plate.toUpperCase();
    const existing = db.select().from(plateLookups).where(eq(plateLookups.licensePlate, upperPlate)).get();
    if (existing) {
      db.update(plateLookups).set({ lookupCount: existing.lookupCount + 1, lastLookedUp: new Date().toISOString() }).where(eq(plateLookups.id, existing.id)).run();
    } else {
      db.insert(plateLookups).values({ licensePlate: upperPlate, lookupCount: 1, lastLookedUp: new Date().toISOString() }).run();
    }
    const reportList = await this.getReportsByPlate(upperPlate);
    return { reports: reportList, lookupCount: existing ? existing.lookupCount + 1 : 1 };
  }

  async getStats(): Promise<{ totalReports: number; totalUpvotes: number; totalComments: number; topStates: { state: string; count: number }[] }> {
    const allReports = db.select().from(reports).all();
    const totalReports = allReports.length;
    const totalUpvotes = allReports.reduce((sum, r) => sum + r.upvotes, 0);
    const totalComments = allReports.reduce((sum, r) => sum + r.commentCount, 0);

    const stateCounts: Record<string, number> = {};
    allReports.forEach(r => {
      if (r.state) {
        stateCounts[r.state] = (stateCounts[r.state] || 0) + 1;
      }
    });
    const topStates = Object.entries(stateCounts)
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { totalReports, totalUpvotes, totalComments, topStates };
  }
}

export const storage = new DatabaseStorage();
