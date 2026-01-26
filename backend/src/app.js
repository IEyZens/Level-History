import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import swaggerui from "swagger-ui-express";
import yaml from "yamljs";

import authRoutes from "./routes/auth.route.js";
import commentRoutes from "./routes/comment.route.js";
import eventRoutes from "./routes/event.route.js";
import likeRoutes from "./routes/like.route.js";
import personalityRoutes from "./routes/personality.route.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const swaggerDocument = yaml.load(path.join(__dirname, "../swagger.yaml"));

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api-docs", swaggerui.serve, swaggerui.setup(swaggerDocument));

app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/comments", commentRoutes);
app.use("/likes", likeRoutes);
app.use("/personalities", personalityRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API OK!" });
});

export default app;
