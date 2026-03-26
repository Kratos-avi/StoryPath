const prisma = require("../utils/prismaClient");

// Lists all nodes in story order for editor/play setup.
exports.getNodesForStory = async (req, res) => {
  try {
    const storyId = Number(req.params.storyId);

    const nodes = await prisma.storyNode.findMany({
      where: { storyId },
      orderBy: { id: "asc" },
    });

    res.json(nodes);
  } catch (err) {
    console.error("getNodesForStory error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Returns one node by id.
exports.getNodeById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const node = await prisma.storyNode.findUnique({
      where: { id },
    });

    if (!node) return res.status(404).json({ message: "Node not found" });

    res.json(node);
  } catch (err) {
    console.error("getNodeById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Creates a node for a story owned by the authenticated user.
exports.createNode = async (req, res) => {
  try {
    const storyId = Number(req.params.storyId);
    const { content, options } = req.body;

    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) return res.status(404).json({ message: "Story not found" });

    // Enforce story ownership before allowing edits.
    if (story.userId !== req.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "content is required" });
    }

    const newNode = await prisma.storyNode.create({
      data: {
        storyId,
        content: content.trim(),
        options: Array.isArray(options) ? options : [],
      },
    });

    // First node becomes start node automatically unless one already exists.
    if (!story.startNodeId) {
      await prisma.story.update({
        where: { id: storyId },
        data: { startNodeId: newNode.id },
      });
    }

    res.status(201).json(newNode);
  } catch (err) {
    console.error("createNode error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Updates a node's content/options for the story owner.
exports.updateNode = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { content, options } = req.body;

    const node = await prisma.storyNode.findUnique({ where: { id } });
    if (!node) return res.status(404).json({ message: "Node not found" });

    const story = await prisma.story.findUnique({ where: { id: node.storyId } });
    if (!story) return res.status(404).json({ message: "Story not found" });

    // Enforce story ownership before allowing edits.
    if (story.userId !== req.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const updated = await prisma.storyNode.update({
      where: { id },
      data: {
        content: typeof content === "string" ? content.trim() : node.content,
        options: Array.isArray(options) ? options : node.options,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("updateNode error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Deletes a node for the story owner.
exports.deleteNode = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const node = await prisma.storyNode.findUnique({ where: { id } });
    if (!node) return res.status(404).json({ message: "Node not found" });

    const story = await prisma.story.findUnique({ where: { id: node.storyId } });
    if (!story) return res.status(404).json({ message: "Story not found" });

    // Enforce story ownership before allowing edits.
    if (story.userId !== req.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await prisma.storyNode.delete({ where: { id } });

    res.json({ message: "Node deleted ✅" });
  } catch (err) {
    console.error("deleteNode error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
