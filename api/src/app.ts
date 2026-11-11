import cors from "cors";
import express from "express";
import { neonAuthContextMiddleware } from "./auth/neonAuth.js";
import { env } from "./config/env.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/errorHandler.js";
import { announcementRouter } from "./routes/announcementRoutes.js";
import { authRouter } from "./routes/authRoutes.js";
import { departmentRouter } from "./routes/departmentRoutes.js";
import { donationRouter } from "./routes/donationRoutes.js";
import { sermonRouter } from "./routes/sermonRoutes.js";

export const app = express();

const allowedOrigins =
  env.CORS_ORIGIN === "*"
    ? true
    : env.CORS_ORIGIN.split(",").map((origin) => origin.trim());

app.disable("x-powered-by");
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "1mb" }));
app.use(neonAuthContextMiddleware);

app.get("/", (_req, res) => {
  res.json({
    name: "Royal Palace Chapel Assemblies of God API",
    version: "1.0.0",
    status: "ok",
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRouter);
app.use("/api/announcements", announcementRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/sermons", sermonRouter);
app.use("/api/donations", donationRouter);

app.use(notFoundHandler);
app.use(errorHandler);
