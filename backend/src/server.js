import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import prisma from "./lib/prisma.js";

import authRoutes from "./routes/auth.route.js";
import eventRoutes from "./routes/event.route.js";
import likesRoutes from "./routes/like.route.js";
import postRoutes from "./routes/post.route.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/posts", postRoutes);
app.use("/likes", likesRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API OK!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
