const express = require("express");
const router = express.Router();

const nodeController = require("../controllers/nodeController");
const authMiddleware = require("../middleware/authMiddleware");

// Public node routes for reading story branches.
router.get("/stories/:storyId/nodes", nodeController.getNodesForStory);
router.get("/nodes/:id", nodeController.getNodeById);

// Protected node routes require ownership of the story.
router.post("/stories/:storyId/nodes", authMiddleware, nodeController.createNode);
router.put("/nodes/:id", authMiddleware, nodeController.updateNode);
router.delete("/nodes/:id", authMiddleware, nodeController.deleteNode);

module.exports = router;
