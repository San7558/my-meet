// server/index.js
// ─────────────────────────────────────────────────────────────────────────────
// CRITICAL: These two lines MUST come before any other import so that:
//   1. DNS resolution always prefers IPv4 (fixes querySrv ECONNREFUSED on Windows/Node 24)
//   2. All environment variables are available when sub-modules (firebase, db) are imported
// ─────────────────────────────────────────────────────────────────────────────
import { setDefaultResultOrder } from "dns";
setDefaultResultOrder("ipv4first");

import dotenv from "dotenv";
dotenv.config();

// ── Framework & Middleware ────────────────────────────────────────────────────
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// ── Internal Modules (env is loaded before these resolve) ─────────────────────
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import translateRoutes from "./routes/translate.routes.js";
import violationRoutes from "./routes/violation.routes.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

// ── Bootstrap ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // 1. Connect to MongoDB FIRST – server won't start if DB is unreachable
  await connectDB();

  // 2. Build Express app only after DB is ready
  const app = express();

  // Security & logging
  app.use(helmet());
  app.use(morgan("dev"));
  // ── CORS ─────────────────────────────────────────────────────────────────
  // Allow configured CLIENT_URL (production) AND localhost:5173 (dev).
  // credentials:true is required so the browser sends the Authorization header
  // on cross-origin requests.
  const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ].filter(Boolean); // drop undefined if CLIENT_URL is not set

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow non-browser requests (Postman, server-to-server) and listed origins
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.warn(`[CORS] Blocked request from origin: ${origin}`);
          callback(new Error(`CORS: origin ${origin} not allowed`));
        }
      },
      credentials: true,
    })
  );
  app.use(express.json());

  // Health check (always available, even if DB has issues later)
  app.get("/health", (req, res) =>
    res.json({ status: "ok", message: "Server is running" })
  );

  // API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/translate", translateRoutes);
  app.use("/api/violations", violationRoutes);

  // 404 & global error handler (must be last)
  app.use(notFound);
  app.use(errorHandler);

  // 3. Start listening only after DB is confirmed
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
  });
};

// Catch any top-level startup errors (DB failures, bad env, etc.)
startServer().catch((err) => {
  console.error("💥 Fatal startup error:", err);
  process.exit(1);
});
