import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

// Import config FIRST (validates env)
import { getCorsConfig } from "./config/cors.js";
import config from "./config/env.js";
import { getHelmetConfig } from "./config/helmet.js";

// Routes
import authRoutes from "./routes/auth.route.js";
import commentRoutes from "./routes/comment.route.js";
import eventRoutes from "./routes/event.route.js";
import likeRoutes from "./routes/like.route.js";
import personalityRoutes from "./routes/personality.route.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

// Security middlewares (BEFORE routes)
app.use(helmet(getHelmetConfig(config.NODE_ENV)));
app.use(cors(getCorsConfig(config.ALLOWED_ORIGINS, config.NODE_ENV)));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/comments", commentRoutes);
app.use("/likes", likeRoutes);
app.use("/personalities", personalityRoutes);
app.use("/users", userRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
