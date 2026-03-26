/**
 * Story Routes
 * 
 * This module manages all story-related endpoints:
 * - Fetching public and user-owned stories
 * - Creating, updating, and deleting stories
 * - Forking/remixing stories
 * - Accessing user profiles and story start nodes
 * 
 * NOTE: Place specific routes before generic /:id to prevent route shadowing.
 */

const express = require("express");
const router = express.Router();

const storyController = require("../controllers/storyController");
const authMiddleware = require("../middleware/authMiddleware");

// ============= PUBLIC STORY ROUTES (No Authentication Required) =============

/**
 * GET /api/stories
 * Retrieves all public stories, optionally filtered by search query.
 */
router.get("/", storyController.getAllStories);

/**
 * GET /api/stories/:id/start
 * Retrieves the starting node for a story (used to initiate playback).
 */
router.get("/:id/start", storyController.getStartNode);

/**
 * GET /api/stories/:id/graph
 * Returns graph data (nodes + edges) for visual story-map rendering.
 */
router.get("/:id/graph", storyController.getStoryGraph);

/**
 * POST /api/stories/:id/track-play
 * Increments play count for analytics.
 */
router.post("/:id/track-play", storyController.trackPlay);

/**
 * POST /api/stories/:id/track-completion
 * Increments completion count for analytics.
 */
router.post("/:id/track-completion", storyController.trackCompletion);

/**
 * GET /api/stories/users/:userId/profile
 * Retrieves a user's profile information and story count.
 */
router.get("/users/:userId/profile", storyController.getUserProfile);

/**
 * GET /api/stories/users/:userId/stories
 * Retrieves all stories created by a specific user.
 */
router.get("/users/:userId/stories", storyController.getUserStories);

// ============= PROTECTED STORY ROUTES (Authentication Required) =============

/**
 * GET /api/stories/mine (Protected)
 * Retrieves only stories owned by the authenticated user.
 */
router.get("/mine", authMiddleware, storyController.getMyStories);

/**
 * POST /api/stories (Protected)
 * Creates a new story under the authenticated user's ownership.
 */
router.post("/", authMiddleware, storyController.createStory);

/**
 * PUT /api/stories/:id (Protected)
 * Updates story metadata (title, description, start node).
 */
router.put("/:id", authMiddleware, storyController.updateStory);

/**
 * DELETE /api/stories/:id (Protected)
 * Deletes a story and all associated nodes.
 */
router.delete("/:id", authMiddleware, storyController.deleteStory);

/**
 * POST /api/stories/:id/fork (Protected)
 * Creates a copy of another story with all nodes (user remix feature).
 */
router.post("/:id/fork", authMiddleware, storyController.forkStory);

// ============= SINGLE STORY ROUTE (Generic, Place Last) =============

/**
 * GET /api/stories/:id
 * Retrieves a single story by ID with creator information.
 * Must be placed after specific routes to avoid shadowing.
 */
router.get("/:id", storyController.getStoryById);

module.exports = router;
