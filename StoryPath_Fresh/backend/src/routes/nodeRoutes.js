/**
 * Story Nodes Routes
 * 
 * This module handles all endpoints for managing story nodes (pages/paragraphs in a story):
 * - Fetching nodes for a story
 * - Creating, updating, and deleting nodes (requires authentication)
 * - Protected endpoints enforce story ownership before modifications
 */

const express = require("express");
const router = express.Router();

const nodeController = require("../controllers/nodeController");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * GET /api/stories/:storyId/nodes
 * Retrieves all nodes for a specific story (public read).
 */
router.get("/stories/:storyId/nodes", nodeController.getNodesForStory);

/**
 * GET /api/nodes/:id
 * Retrieves a single node by ID.
 */
router.get("/nodes/:id", nodeController.getNodeById);

/**
 * POST /api/stories/:storyId/nodes (Protected)
 * Creates a new node for the story (requires authentication and ownership).
 */
router.post("/stories/:storyId/nodes", authMiddleware, nodeController.createNode);

/**
 * PUT /api/nodes/:id (Protected)
 * Updates an existing node's content and choices.
 */
router.put("/nodes/:id", authMiddleware, nodeController.updateNode);

/**
 * DELETE /api/nodes/:id (Protected)
 * Deletes a node from its story.
 */
router.delete("/nodes/:id", authMiddleware, nodeController.deleteNode);

module.exports = router;
