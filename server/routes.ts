import type { Express } from "express";
import type { Server } from "node:http";
import { storage } from "./storage";
import { insertReportSchema, insertCommentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Get all reports (feed)
  app.get("/api/reports", async (_req, res) => {
    try {
      const reports = await storage.getAllReports();
      res.json(reports);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get single report
  app.get("/api/reports/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
      const report = await storage.getReport(id);
      if (!report) return res.status(404).json({ error: "Report not found" });
      await storage.incrementViews(id);
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create a new report
  app.post("/api/reports", async (req, res) => {
    try {
      const validated = insertReportSchema.parse(req.body);
      const report = await storage.createReport(validated);
      res.status(201).json(report);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: err.errors });
      }
      res.status(500).json({ error: err.message });
    }
  });

  // Upvote a report
  app.post("/api/reports/:id/upvote", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const report = await storage.upvoteReport(id);
      if (!report) return res.status(404).json({ error: "Report not found" });
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Downvote a report
  app.post("/api/reports/:id/downvote", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const report = await storage.downvoteReport(id);
      if (!report) return res.status(404).json({ error: "Report not found" });
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get comments for a report
  app.get("/api/reports/:id/comments", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const commentList = await storage.getComments(id);
      res.json(commentList);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add a comment
  app.post("/api/reports/:id/comments", async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const validated = insertCommentSchema.parse({ ...req.body, reportId });
      const comment = await storage.createComment(validated);
      await storage.incrementComments(reportId);
      res.status(201).json(comment);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: err.errors });
      }
      res.status(500).json({ error: err.message });
    }
  });

  // Look up a license plate
  app.get("/api/plates/:plate", async (req, res) => {
    try {
      const plate = req.params.plate;
      const result = await storage.lookupPlate(plate);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get stats
  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  return httpServer;
}
