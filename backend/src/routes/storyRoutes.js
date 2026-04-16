const express = require("express");
const router = express.Router();

const storyController = require("../controllers/storyController");
const authMiddleware = require("../middleware/authMiddleware");

// Public
router.get("/", storyController.getAllStories);
router.get("/mine", authMiddleware, storyController.getMyStories);
router.get("/:id/start", storyController.getStartNode);
router.get("/:id", storyController.getStoryById);

// Protected
router.put("/:id/start", authMiddleware, storyController.setStartNode);
router.post("/", authMiddleware, storyController.createStory);
router.put("/:id", authMiddleware, storyController.updateStory);
router.delete("/:id", authMiddleware, storyController.deleteStory);

module.exports = router;
