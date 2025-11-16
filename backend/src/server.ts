// Application entry point

import express, { Express, Request, Response, NextFunction } from "express";
import { createServer } from "http";
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
import taskRoutes from "./routes/taskRoutes";
import subtaskRoutes from "./routes/subtaskRoutes";
import messageRoutes from "./routes/messageRoutes";
import conversationRoutes from "./routes/conversationRoutes";
import activityRoutes from "./routes/activityRoutes";
import commentRoutes from "./routes/commentRoutes";

// Import Socket.IO setup
import { setupSocketIO } from "./services/socketService";

// Create Express app and HTTP server
const app: Express = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Setup Socket.IO
setupSocketIO(httpServer);

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Trust proxy - Required for secure cookies behind reverse proxy (Heroku, AWS, etc.)
app.set('trust proxy', 1);

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

// Task routes
app.use("/api/v1", taskRoutes);

// Subtask routes
app.use("/api/v1", subtaskRoutes);

// Message routes
app.use("/api/v1", messageRoutes);

// Conversation routes
app.use("/api/v1", conversationRoutes);

// Activity routes
app.use("/api/v1", activityRoutes);

// Comment routes
app.use("/api/v1", commentRoutes);

// User routes (uncomment when ready)
// app.use("/api/v1/users", userRoutes);

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
    httpServer.listen(PORT, () => {
      console.log(`
        ╔════════════════════════════════════════╗
        ║   Taskify Backend Server Started       ║
        ║   Port: ${PORT}                            ║
        ║   Environment: ${process.env.NODE_ENV}            ║
        ║   Frontend URL: ${process.env.FRONTEND_URL}   ║
        ║   Socket.IO: Enabled                   ║
        ╚════════════════════════════════════════╝
      `);
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