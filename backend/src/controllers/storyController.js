const prisma = require("../utils/prismaClient");

// Story controller handles public listing plus owner-only CRUD operations.

// GET /api/stories (Public)
exports.getAllStories = async (req, res) => {
  try {
    const stories = await prisma.story.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
    res.json(stories);
  } catch (err) {
    console.error("getAllStories error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/stories/mine (Protected)
exports.getMyStories = async (req, res) => {
  try {
    const stories = await prisma.story.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(stories);
  } catch (err) {
    console.error("getMyStories error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/stories/:id (Public)
exports.getStoryById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const story = await prisma.story.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!story) return res.status(404).json({ message: "Story not found" });

    res.json(story);
  } catch (err) {
    console.error("getStoryById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/stories/:id/start (Public)
exports.getStartNode = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const story = await prisma.story.findUnique({
      where: { id },
      select: { id: true, startNodeId: true, userId: true },
    });

    if (!story) return res.status(404).json({ message: "Story not found" });

    let startNode = null;

    if (story.startNodeId) {
      startNode = await prisma.storyNode.findUnique({
        where: { id: story.startNodeId },
      });
    }

    // If the story has no saved start node, fall back to the first node in the story.
    if (!startNode) {
      const firstNode = await prisma.storyNode.findFirst({
        where: { storyId: id },
        orderBy: { id: "asc" },
      });

      if (!firstNode) {
        return res.status(400).json({ message: "This story has no nodes yet" });
      }

      startNode = firstNode;

      if (!story.startNodeId || story.startNodeId !== firstNode.id) {
        await prisma.story.update({
          where: { id },
          data: { startNodeId: firstNode.id },
        });
      }
    }

    res.json(startNode);
  } catch (err) {
    console.error("getStartNode error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/stories/:id/start (Protected)
exports.setStartNode = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const nodeId = Number(req.body.nodeId);

    // The caller must provide a valid node ID.
    if (!nodeId) {
      return res.status(400).json({ message: "nodeId is required" });
    }

    const story = await prisma.story.findUnique({ where: { id } });
    if (!story) return res.status(404).json({ message: "Story not found" });

    // Only the story owner can change the start node.
    if (story.userId !== req.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const node = await prisma.storyNode.findUnique({ where: { id: nodeId } });
    if (!node || node.storyId !== id) {
      return res.status(400).json({ message: "nodeId must belong to this story" });
    }

    const updated = await prisma.story.update({
      where: { id },
      data: { startNodeId: nodeId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("setStartNode error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/stories (Protected)
exports.createStory = async (req, res) => {
  try {
    const { title, description } = req.body;

    // The JWT middleware must have attached the user ID before we create a story.
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized (userId missing)" });
    }

    // Keep titles non-empty so the UI and list views stay readable.
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const newStory = await prisma.story.create({
      data: {
        title: title.trim(),
        description: description?.trim() || "",
        userId: req.userId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json(newStory);
  } catch (err) {
    console.error("createStory error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/stories/:id (Protected + owner)
exports.updateStory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, description } = req.body;

    // Check that the story exists before attempting any edit.
    const story = await prisma.story.findUnique({ where: { id } });
    if (!story) return res.status(404).json({ message: "Story not found" });

    // Only the owner can edit story metadata.
    if (story.userId !== req.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const updated = await prisma.story.update({
      where: { id },
      data: {
        title: title?.trim() ?? story.title,
        description: description?.trim() ?? story.description,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.json(updated);
  } catch (err) {
    console.error("updateStory error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/stories/:id (Protected + owner)
exports.deleteStory = async (req, res) => {
  try {
    const id = Number(req.params.id);

    // Confirm the target exists and belongs to the signed-in user.
    const story = await prisma.story.findUnique({ where: { id } });
    if (!story) return res.status(404).json({ message: "Story not found" });

    if (story.userId !== req.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await prisma.story.delete({ where: { id } });
    res.json({ message: "Deleted ✅" });
  } catch (err) {
    console.error("deleteStory error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
