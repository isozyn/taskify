// Application entry point

import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from "./routes/authRoutes";
import customColumnRoutes from "./routes/customColumnRoutes";
import projectRoutes from "./routes/projectRoutes";
import meetingRoutes from "./routes/meetingRoutes";
import documentRoutes from "./routes/documentRoutes";
import projectDocumentRoutes from "./routes/projectDocumentRoutes";

// Import services
import { CleanupService } from "./services/cleanupService";

// Create Express app
const app: Express = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:8080",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // 24 hours
  })
);

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Cookie parser middleware
app.use(cookieParser());

// Logging middleware
app.use(morgan("dev"));

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get("/api/v1/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Auth routes
app.use("/api/v1/auth", authRoutes);

// Custom Column routes
app.use("/api/v1", customColumnRoutes);

// Project routes
app.use("/api/v1", projectRoutes);

// Meeting routes
app.use("/api/v1/meetings", meetingRoutes);

// Document routes
app.use("/api/v1/documents", documentRoutes);

// Project document routes
app.use("/api/v1/projects", projectDocumentRoutes);

// User routes (uncomment when ready)
// app.use("/api/v1/users", userRoutes);

// Task routes (uncomment when ready)
// app.use("/api/v1/tasks", taskRoutes);

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ============================================
// SERVER STARTUP
// ============================================

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`
        ╔════════════════════════════════════════╗
        ║   Taskify Backend Server Started       ║
        ║   Port: ${PORT}                            ║
        ║   Environment: ${process.env.NODE_ENV}            ║
        ║   Frontend URL: ${process.env.FRONTEND_URL}   ║
        ╚════════════════════════════════════════╝
      `);
      
      // Start cleanup service for expired projects
      CleanupService.scheduleCleanup();
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\nServer shutting down...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n\nServer shutting down...");
  process.exit(0);
});

// Start the server
startServer();

export default app;