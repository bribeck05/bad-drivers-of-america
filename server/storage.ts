import { reports, comments, plateLookups } from '@shared/schema';
import type { Report, InsertReport, Comment, InsertComment } from '@shared/schema';
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, desc } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

export interface IStorage {
  // Reports
  getAllReports(): Promise<Report[]>;
  getReport(id: number): Promise<Report | undefined>;
  getReportsByPlate(plate: string): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  upvoteReport(id: number): Promise<Report | undefined>;
  downvoteReport(id: number): Promise<Report | undefined>;
  incrementViews(id: number): Promise<void>;
  incrementComments(id: number): Promise<void>;
  // Comments
  getComments(reportId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  // Plate lookup
  lookupPlate(plate: string): Promise<{ reports: Report[]; lookupCount: number }>;
  // Stats
  getStats(): Promise<{ totalReports: number; totalUpvotes: number; totalComments: number; topStates: { state: string; count: number }[] }>;
}

export class DatabaseStorage implements IStorage {
  async getAllReports(): Promise<Report[]> {
    return db.select().from(reports).orderBy(desc(reports.createdAt)).all();
  }

  async getReport(id: number): Promise<Report | undefined> {
    return db.select().from(reports).where(eq(reports.id, id)).get();
  }

  async getReportsByPlate(plate: string): Promise<Report[]> {
    return db.select().from(reports).where(eq(reports.licensePlate, plate.toUpperCase())).orderBy(desc(reports.createdAt)).all();
  }

  async createReport(report: InsertReport): Promise<Report> {
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

  async createComment(comment: InsertComment): Promise<Comment> {
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
