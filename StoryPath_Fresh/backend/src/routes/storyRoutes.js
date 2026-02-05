const express = require("express");
const router = express.Router();

const storyController = require("../controllers/storyController");
const authMiddleware = require("../middleware/authMiddleware");

// Public
router.get("/", storyController.getAllStories);

// Protected
router.post("/", authMiddleware, storyController.createStory);
router.put("/:id", authMiddleware, storyController.updateStory);
router.delete("/:id", authMiddleware, storyController.deleteStory);

module.exports = router;
