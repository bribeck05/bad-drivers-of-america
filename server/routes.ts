import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "node:http";
import session from "express-session";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { insertReportSchema, insertCommentSchema, insertUserSchema, safeUser } from "@shared/schema";
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

// --- Auth Middleware ---
declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required. Please log in." });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Session middleware — __Host- prefix required for published sandbox (served over HTTPS)
  app.use(
    session({
      name: "__Host-sid",
      secret: process.env.SESSION_SECRET || "bad-drivers-of-america-secret-key-2024",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: true,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  );

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

      req.session.userId = user.id;
      res.status(201).json(safeUser(user));
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

      req.session.userId = user.id;
      res.json(safeUser(user));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // Get current user
  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = await storage.getUserById(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
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
        userId: req.session.userId,
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

  // Add a comment (auth required)
  app.post("/api/reports/:id/comments", requireAuth, rateLimit(60000, 15), async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const validated = insertCommentSchema.parse({ ...req.body, reportId });
      const comment = await storage.createComment({
        ...validated,
        userId: req.session.userId,
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
