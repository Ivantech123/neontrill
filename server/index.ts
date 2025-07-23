import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import session from "express-session";
import { handleDemo } from "./routes/demo";
import { handleVerifyWallet, handleGetChallenge } from "./routes/auth";
import { handleGetGames, handleGetStats } from "./routes/games";
import {
  handleGetUserHistory,
  handleGetUserProfile,
  handleGetUserInventory,
  handleGetUserEarnings,
  handleClaimEarnings,
} from "./routes/user";
import shopRoutes from "./routes/shop";
import rouletteRoutes from "./routes/roulette";
import leaderboardRoutes from "./routes/leaderboard";
import { authenticateToken } from "./utils/auth";

export function createServer() {
  const app = express();

  // Security headers
  // Custom Content Security Policy
  const cspDirectives: helmet.ContentSecurityPolicyOptions["directives"] = {
    defaultSrc: ["'self'"],
    connectSrc: [
      "'self'",
      "https://raw.githubusercontent.com",
      "https://ton.org",
    ],
    imgSrc: [
      "'self'",
      "data:",
      "https://static.tonapi.io",
      "https://wallet.tg",
    ],
  };

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      // In development — disable CSP, in production — apply our custom directives
      contentSecurityPolicy:
        process.env.NODE_ENV === "production"
          ? { directives: cspDirectives }
          : false,
    }),
  );

  // CORS with whitelist
  const allowedOrigins = (process.env.CORS_ORIGINS || "*").split(",");
  app.use(
    cors({
      origin: (origin, callback) => {
        if (
          !origin ||
          allowedOrigins.includes("*") ||
          allowedOrigins.includes(origin)
        ) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    }),
  );

  // Rate limiter for roulette spins
  const spinRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 spins per minute per IP
    message: { error: "Too many spins, slow down." },
    standardHeaders: true,
  });

  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "your-super-secret-key",
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: process.env.NODE_ENV === "production", // в продакшене использовать secure cookies
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 часа
      },
    }),
  );

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/v1/auth/verify", handleVerifyWallet);
  app.get("/api/v1/auth/challenge", handleGetChallenge);

  // Game routes
  app.get("/api/v1/games", handleGetGames);
  app.get("/api/v1/stats", handleGetStats);

  // User routes (protected)
  app.get("/api/v1/user/history", authenticateToken, handleGetUserHistory);
  app.get("/api/v1/user/profile", authenticateToken, handleGetUserProfile);
  app.get("/api/v1/user/inventory", authenticateToken, handleGetUserInventory);
  app.get("/api/v1/user/earnings", authenticateToken, handleGetUserEarnings);
  app.post(
    "/api/v1/user/claim-earnings",
    authenticateToken,
    handleClaimEarnings,
  );

  // Shop routes
  app.use("/api/v1/shop", shopRoutes);

  // Leaderboard route
  app.use("/api/v1/leaderboard", leaderboardRoutes);

  // Roulette routes
  app.use("/api/v1/roulette/spin", spinRateLimiter);
  app.use("/api/v1/roulette", rouletteRoutes);

  return app;
}
