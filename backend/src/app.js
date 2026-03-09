import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

// Config importée en premier pour valider les variables d'environnement au démarrage
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

// ── Middlewares de sécurité (avant tout le reste) ─────────────────────────────
app.use(helmet(getHelmetConfig(config.NODE_ENV)));
app.use(cors(getCorsConfig(config.ALLOWED_ORIGINS, config.NODE_ENV)));

// ── Parsers du corps de requête ───────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Fichiers statiques — images uploadées ─────────────────────────────────────
app.use("/uploads", express.static("uploads"));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/comments", commentRoutes);
app.use("/likes", likeRoutes);
app.use("/personalities", personalityRoutes);
app.use("/users", userRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ── Gestionnaire d'erreurs global ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
