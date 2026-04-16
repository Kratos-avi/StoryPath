const express = require("express");
const path = require("path");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const storyRoutes = require("./routes/storyRoutes");
const authRoutes = require("./routes/authRoutes");
const nodeRoutes = require("./routes/nodeRoutes");
const prisma = require("./utils/prismaClient");
const { validateEnv, getAllowedOrigins } = require("./config/env");

validateEnv();

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = getAllowedOrigins();
const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(compression());
app.use(express.json({ limit: "1mb" }));

if (!isProduction) {
  app.use(morgan("dev"));
}

// CORS policy supports explicit allowlist plus Render preview domains.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (origin.startsWith("https://") && origin.endsWith(".onrender.com")) {
        return callback(null, true);
      }

      const corsError = new Error("CORS origin not allowed");
      corsError.status = 403;
      return callback(corsError);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply broader API limiter first, then stricter auth limiter for login/register endpoints.
app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);

app.get("/api", (req, res) => {
  res.json({
    message: "StoryPath API is running",
    status: "success",
    version: "1.0.0",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    time: new Date().toISOString(),
  });
});

app.use("/api/stories", storyRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", nodeRoutes);

if (isProduction) {
  // In production, backend serves both API and built SPA assets.
  app.use(express.static(frontendDistPath));

  app.get(/^(?!\/api).*/, (req, res, next) => {
    if (req.method !== "GET") return next();

    res.sendFile(path.join(frontendDistPath, "index.html"), (err) => {
      if (err) next(err);
    });
  });
}

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = status === 500 ? "Internal server error" : err.message;

  if (!isProduction) {
    console.error("Unhandled server error:", err);
  }

  res.status(status).json({ message });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

async function gracefulShutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  setTimeout(async () => {
    await prisma.$disconnect();
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));