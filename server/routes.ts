import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "node:http";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { insertReportSchema, insertCommentSchema, safeUser } from "@shared/schema";
import { z } from "zod";

// --- Rate Limiter (in-memory, IP-based) ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(windowMs: number, maxRequests: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const key = `${ip}:${req.method}:${req.path}`;
    const now = Date.now();
    const entry = rateLimitMap.get(key);

    if (!entry || now > entry.resetAt) {
      rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count++;
    if (entry.count > maxRequests) {
      return res.status(429).json({ error: "Too many requests. Please slow down." });
    }

    next();
  };
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 300000);

// --- Token-based Auth ---
const TOKEN_SECRET = process.env.SESSION_SECRET || "bad-drivers-of-america-secret-key-2024";
const activeTokens = new Map<string, { userId: number; expiresAt: number }>();

function generateToken(userId: number): string {
  const token = crypto.randomBytes(32).toString("hex");
  activeTokens.set(token, { userId, expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7 }); // 7 days
  return token;
}

function getUserIdFromToken(req: Request): number | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  const entry = activeTokens.get(token);
  if (!entry || Date.now() > entry.expiresAt) {
    if (entry) activeTokens.delete(token);
    return null;
  }
  return entry.userId;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res.status(401).json({ error: "Authentication required. Please log in." });
  }
  (req as any).userId = userId;
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ===== AUTH ROUTES =====

  // Signup
  app.post("/api/auth/signup", rateLimit(60000, 5), async (req, res) => {
    try {
      const { username, password, displayName } = req.body;

      if (!username || typeof username !== "string" || username.trim().length < 3) {
        return res.status(400).json({ error: "Username must be at least 3 characters" });
      }
      if (!password || typeof password !== "string" || password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      const existing = await storage.getUserByUsername(username.trim().toLowerCase());
      if (existing) {
        return res.status(409).json({ error: "Username already taken" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        username: username.trim().toLowerCase(),
        passwordHash,
        displayName: displayName?.trim() || "Anonymous Driver",
      });

      const token = generateToken(user.id);
      res.status(201).json({ ...safeUser(user), token });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Login
  app.post("/api/auth/login", rateLimit(60000, 10), async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username.trim().toLowerCase());
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const token = generateToken(user.id);
      res.json({ ...safeUser(user), token });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      activeTokens.delete(token);
    }
    res.json({ success: true });
  });

  // Get current user
  app.get("/api/auth/me", async (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json(safeUser(user));
  });

  // ===== REPORT ROUTES =====

  // Get all reports (feed)
  app.get("/api/reports", rateLimit(60000, 60), async (_req, res) => {
    try {
      const reports = await storage.getAllReports();
      res.json(reports);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get single report
  app.get("/api/reports/:id", rateLimit(60000, 60), async (req, res) => {
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

  // Create a new report (auth required)
  app.post("/api/reports", requireAuth, rateLimit(60000, 10), async (req, res) => {
    try {
      const validated = insertReportSchema.parse(req.body);
      const report = await storage.createReport({
        ...validated,
        userId: (req as any).userId,
      });
      res.status(201).json(report);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: err.errors });
      }
      res.status(500).json({ error: err.message });
    }
  });

  // Upvote a report (auth required)
  app.post("/api/reports/:id/upvote", requireAuth, rateLimit(60000, 30), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const report = await storage.upvoteReport(id);
      if (!report) return res.status(404).json({ error: "Report not found" });
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Downvote a report (auth required)
  app.post("/api/reports/:id/downvote", requireAuth, rateLimit(60000, 30), async (req, res) => {
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
  app.get("/api/reports/:id/comments", rateLimit(60000, 60), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const commentList = await storage.getComments(id);
      res.json(commentList);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add a comment (open to all — auth optional, anonymous allowed)
  app.post("/api/reports/:id/comments", rateLimit(60000, 15), async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const userId = getUserIdFromToken(req); // null if not logged in
      const { content, authorName } = req.body;

      if (!content || typeof content !== "string" || content.trim().length === 0) {
        return res.status(400).json({ error: "Comment cannot be empty" });
      }

      const comment = await storage.createComment({
        reportId,
        content: content.trim(),
        authorName: (authorName || "Anonymous Driver").trim().substring(0, 50),
        userId: userId || undefined,
      });
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
  app.get("/api/plates/:plate", rateLimit(60000, 30), async (req, res) => {
    try {
      const plate = req.params.plate;
      const result = await storage.lookupPlate(plate);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get stats
  app.get("/api/stats", rateLimit(60000, 30), async (_req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  return httpServer;
}
