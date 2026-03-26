/**
 * Story Controller
 * 
 * Manages all story-related business logic and operations:
 * - CRUD operations for stories (create, read, update, delete)
 * - Story search and filtering capabilities
 * - Story forking/remixing (creating copies with all nodes cloned)
 * - User profile and public story discovery endpoints
 * - Authorization and ownership verification for protected operations
 * 
 * Authorization:
 * - Public endpoints (GET /stories, GET /users/:id): No authentication required
 * - Protected endpoints (POST, PUT, DELETE): Require authentication and story ownership
 */

const prisma = require("../utils/prismaClient");
const { Prisma } = require("@prisma/client");

/**
 * GET /api/stories
 * 
 * Retrieves all public stories with optional title search filtering.
 * No authentication required - publicly accessible endpoint.
 * Useful for story discovery and browsing.
 * 
 * Query Parameters:
 * - search (string, optional): Filter stories by title (case-insensitive partial match)
 * 
 * Response: Array of story objects with creator information
 * Error: 500 on database failure
 */
exports.getAllStories = async (req, res) => {
  try {
    const { search } = req.query;
    
    // Build WHERE clause for search filtering
    // MySQL is case-insensitive by default, so we don't need mode: "insensitive"
    const where = search && search.trim() 
      ? { title: { contains: search.trim() } }
      : undefined;

    // Fetch all (or filtered) stories ordered by newest first
    const stories = await prisma.story.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        // Include creator info but exclude sensitive user data
        user: { select: { id: true, name: true, email: true } },
      },
    });
    res.json(stories);
  } catch (err) {
    console.error("getAllStories error:", err.message || err);
    console.error("Error details:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * GET /api/stories/mine (Protected)
 * 
 * Retrieves only stories owned by the authenticated user.
 * Requires valid JWT token in Authorization header.
 * Essential for the user's creator dashboard.
 * 
 * Authentication: Required (Bearer token)
 * 
 * Response: Array of user's stories ordered by creation date (newest first)
 * Error: 401 if unauthorized, 500 on database failure
 */
exports.getMyStories = async (req, res) => {
  try {
    // Verify user is authenticated
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized (userId missing)" });
    }

    // Fetch stories for current user
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

/**
 * GET /api/stories/:id
 * 
 * Retrieves a single story by ID with creator information.
 * Used by play and edit pages to load story metadata.
 * No authentication required - any user can view any story.
 * 
 * Params:
 * - id (number): Story ID
 * 
 * Response: Story object with creator details
 * Error: 404 if story not found, 500 on database failure
 */
exports.getStoryById = async (req, res) => {
  try {
    // Parse ID from URL parameter
    const id = Number(req.params.id);

    // Fetch story with creator info
    const story = await prisma.story.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Return 404 if story doesn't exist
    if (!story) return res.status(404).json({ message: "Story not found" });

    res.json(story);
  } catch (err) {
    console.error("getStoryById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/stories/:id/start
 * 
 * Retrieves the configured start node for initiating story playback.
 * Called when player clicks "Play" to load the first story node.
 * 
 * Params:
 * - id (number): Story ID
 * 
 * Response: Starting story node object
 * Error: 404 if story not found, start node not set, or node validation fails
 * Error: 500 on database failure
 */
exports.getStartNode = async (req, res) => {
  try {
    const id = Number(req.params.id);

    // Fetch story to check if start node is configured
    const story = await prisma.story.findUnique({ where: { id } });
    if (!story) return res.status(404).json({ message: "Story not found" });

    // Check if story has a start node assigned
    if (!story.startNodeId) {
      return res.status(404).json({ message: "Start node not set" });
    }

    // Fetch the actual start node
    const startNode = await prisma.storyNode.findUnique({
      where: { id: story.startNodeId },
    });

    // Verify the start node exists and belongs to this story
    if (!startNode || startNode.storyId !== story.id) {
      return res.status(404).json({ message: "Start node not found" });
    }

    res.json(startNode);
  } catch (err) {
    console.error("getStartNode error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/stories (Protected)
 * 
 * Creates a new story under the authenticated user's ownership.
 * The creator becomes the story owner and can edit/delete it.
 * All input is validated and trimmed before storage.
 * 
 * Authentication: Required (Bearer token)
 * 
 * Request body:
 * - title (string, max 120 chars): Story title (required)
 * - description (string, max 1000 chars): Story synopsis (optional)
 * 
 * Response: Created story object with ID and creator info
 * Error: 400 for validation errors, 401 for auth issues, 500 on database failure
 */
exports.createStory = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized (userId missing)" });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Define length limits to prevent database bloat
    const MAX_TITLE_LENGTH = 120;
    const MAX_DESCRIPTION_LENGTH = 1000;

    // Validate title length
    if (title.trim().length > MAX_TITLE_LENGTH) {
      return res.status(400).json({ 
        message: `Title must be ${MAX_TITLE_LENGTH} characters or less` 
      });
    }

    // Validate description length if provided
    if (description && description.trim().length > MAX_DESCRIPTION_LENGTH) {
      return res.status(400).json({ 
        message: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less` 
      });
    }

    // Verify user exists (additional validation)
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(401).json({ message: "Invalid session user. Please login again." });
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

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2003") {
        return res.status(400).json({ message: "Invalid user reference. Please login again." });
      }
    }

    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/stories/:id (Protected)
 * 
 * Updates story metadata (title, description) and/or the start node.
 * Requires authentication and ownership of the story.
 * 
 * Params:
 * - id (number): Story ID
 * 
 * Request body (optional):
 * - title (string): Updated story title
 * - description (string): Updated story description
 * - startNodeId (number or null): Set/unset the story's starting node
 * 
 * Response: Updated story object
 * Error: 400 for validation, 403 for permission denied, 404 if not found, 500 on failure
 */
exports.updateStory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, description, startNodeId } = req.body;

    const story = await prisma.story.findUnique({ where: { id } });
    if (!story) return res.status(404).json({ message: "Story not found" });

    if (story.userId !== req.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    let nextStartNodeId = story.startNodeId;
    if (startNodeId !== undefined) {
      if (startNodeId === null) {
        nextStartNodeId = null;
      } else {
        const parsedStartNodeId = Number(startNodeId);
        if (Number.isNaN(parsedStartNodeId)) {
          return res.status(400).json({ message: "startNodeId must be a valid number or null" });
        }

        const candidate = await prisma.storyNode.findUnique({ where: { id: parsedStartNodeId } });
        if (!candidate || candidate.storyId !== story.id) {
          return res.status(400).json({ message: "Start node must belong to this story" });
        }

        nextStartNodeId = parsedStartNodeId;
      }
    }

    const updated = await prisma.story.update({
      where: { id },
      data: {
        title: title?.trim() ?? story.title,
        description: description?.trim() ?? story.description,
        startNodeId: nextStartNodeId,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.json(updated);
  } catch (err) {
    console.error("updateStory error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE /api/stories/:id (Protected)
 * 
 * Deletes a story and all associated nodes permanently.
 * Requires authentication and ownership of the story.
 * WARNING: This removes the story and all its content - action cannot be undone.
 * 
 * Params:
 * - id (number): Story ID
 * 
 * Response: Success message
 * Error: 403 for permission denied, 404 if not found, 500 on failure
 */
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

/**
 * GET /api/stories/users/:userId/profile
 * 
 * Retrieves a user's public profile information and story count.
 * No authentication required - publicly visible profile data.
 * Used by the user profile page to display creator information.
 * 
 * Params:
 * - userId (number): User ID
 * 
 * Response: User object with profile info and story count
 * Error: 404 if user not found, 500 on database failure
 */
exports.getUserProfile = async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: { select: { stories: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("getUserProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/stories/users/:userId/stories
 * 
 * Retrieves all stories created by a specific user.
 * No authentication required - publicly visible stories.
 * Used to display a creator's portfolio on their profile page.
 * 
 * Params:
 * - userId (number): User ID
 * 
 * Response: Array of user's stories ordered by creation date (newest first)
 * Error: 404 if user not found, 500 on database failure
 */
exports.getUserStories = async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const stories = await prisma.story.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(stories);
  } catch (err) {
    console.error("getUserStories error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/stories/:id/fork (Protected)
 * 
 * Creates a copy of another user's story for the authenticated user.
 * Clones the story with all its nodes and choices (complete story structure).
 * Useful for remixing and building upon existing stories.
 * Names the forked story with "(Remix)" suffix to indicate cloned origin.
 * 
 * Authentication: Required (Bearer token)
 * 
 * Params:
 * - id (number): Original story ID to fork
 * 
 * Response: New forked story object with all cloned nodes
 * Error: 404 if original story not found, 401 if unauthorized, 500 on failure
 */
exports.forkStory = async (req, res) => {
  try {
    const storyId = Number(req.params.id);

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized (userId missing)" });
    }

    // Get original story with all its nodes
    const originalStory = await prisma.story.findUnique({
      where: { id: storyId },
      include: { nodes: true },
    });

    if (!originalStory) {
      return res.status(404).json({ message: "Story not found" });
    }

    // Create new story for current user
    const newStory = await prisma.story.create({
      data: {
        title: `${originalStory.title} (Remix)`,
        description: originalStory.description,
        userId: req.userId,
      },
    });

    // Clone all nodes from original story
    if (originalStory.nodes && originalStory.nodes.length > 0) {
      const nodeMapping = {}; // Map old node IDs to new node IDs

      // Create all nodes first (without nextNodeId references)
      for (const node of originalStory.nodes) {
        const newNode = await prisma.storyNode.create({
          data: {
            storyId: newStory.id,
            content: node.content,
            // Initialize with empty options array, will update later
            options: [],
          },
        });

        nodeMapping[node.id] = newNode.id;
      }

      // Update nodes with correct nextNodeId references
      for (const originalNode of originalStory.nodes) {
        const newNodeId = nodeMapping[originalNode.id];
        let newOptions = [];

        if (Array.isArray(originalNode.options)) {
          newOptions = originalNode.options.map((opt) => ({
            text: opt.text,
            // Map old nextNodeId to new nextNodeId
            nextNodeId: opt.nextNodeId ? nodeMapping[opt.nextNodeId] : opt.nextNodeId,
          }));
        }

        await prisma.storyNode.update({
          where: { id: newNodeId },
          data: { options: newOptions },
        });
      }

      // Set the start node if original had one
      if (originalStory.startNodeId) {
        const newStartNodeId = nodeMapping[originalStory.startNodeId];
        await prisma.story.update({
          where: { id: newStory.id },
          data: { startNodeId: newStartNodeId },
        });
      }
    }

    // Return full new story with nodes
    const result = await prisma.story.findUnique({
      where: { id: newStory.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        nodes: true,
      },
    });

    res.status(201).json(result);
  } catch (err) {
    console.error("forkStory error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
