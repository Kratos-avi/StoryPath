/**
 * StoryPath Backend Server
 * 
 * Main entry point for the Express.js server.
 * Initializes middleware, environment variables, and route handlers.
 * 
 * Environment Variables:
 * - PORT: Server port (default: 5000)
 * - JWT_SECRET: Secret key for JWT token signing
 */

const express = require("express");
require("dotenv").config();
const cors = require("cors");

const storyRoutes = require("./routes/storyRoutes");
const authRoutes = require("./routes/authRoutes");
const nodeRoutes = require("./routes/nodeRoutes");

const app = express();

// ============= MIDDLEWARE =============
// Enable Cross-Origin Requests (CORS) for frontend communication
app.use(cors());
// Parse incoming JSON request bodies
app.use(express.json());

// Root route for quick API status checks in the browser.
app.get("/", (req, res) => {
  res.json({
    message: "StoryPath API is running",
    status: "success",
    version: "1.0.0"
  });
});

// ============= HEALTH CHECK ENDPOINT =============
/**
 * GET /api/health
 * Simple endpoint to verify server is running.
 * Returns status and current timestamp.
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ============= ROUTE HANDLERS =============
/**
 * Story endpoints: CRUD operations for stories
 */
app.use("/api/stories", storyRoutes);

/**
 * Authentication endpoints: Login and registration
 */
app.use("/api/auth", authRoutes);

/**
 * Node endpoints: CRUD operations for story nodes
 */
app.use("/api", nodeRoutes);

// ============= SERVER STARTUP =============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
