const prisma = require("../utils/prismaClient");

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

// POST /api/stories (Protected)
exports.createStory = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized (userId missing)" });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const newStory = await prisma.story.create({
      data: {
        title: title.trim(),
        description: description?.trim() || "",
        userId: req.userId, // ✅ This must exist
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

    const story = await prisma.story.findUnique({ where: { id } });
    if (!story) return res.status(404).json({ message: "Story not found" });

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
