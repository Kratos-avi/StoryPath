/**
 * Creator Dashboard Page (Protected)
 * 
 * Authenticated users-only page for story creation and management.
 * Features:
 * - Create new stories with title and description
 * - View all owned stories
 * - Edit nodes in stories
 * - Play stories
 * - Delete stories
 * 
 * Requires authentication to access.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

// Define content length limits for form validation
const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 1000;

/**
 * Dashboard Component
 * Creator hub for managing stories and creating new content
 */
export default function Dashboard() {
  const { user } = useAuth();

  // ============= NEW STORY FORM STATE =============
  const [title, setTitle] = useState("");             // New story title
  const [description, setDescription] = useState(""); // New story description

  // ============= STORY LIST STATE =============
  const [stories, setStories] = useState([]);        // User's owned stories
  const [loading, setLoading] = useState(false);     // Loading state
  const [msg, setMsg] = useState("");                // Success message
  const [error, setError] = useState("");            // Error message
  const [deletingStoryId, setDeletingStoryId] = useState(null); // Delete in progress
  const [duplicatingStoryId, setDuplicatingStoryId] = useState(null); // Duplicate in progress
  const [exportingStoryId, setExportingStoryId] = useState(null); // Export in progress
  const [publishingStoryId, setPublishingStoryId] = useState(null); // Publish toggle in progress

  /**
   * Extract error message from API response
   * Handles multiple possible error property names
   */
  const getApiError = (err, fallback) => {
    const data = err?.response?.data;
    return data?.message || data?.detail || data?.error || fallback;
  };

  const loadMine = async ({ silent = false } = {}) => {
    setLoading(true);
    if (!silent) setError("");
    try {
      const res = await api.get("/stories/mine");
      const storyList = Array.isArray(res.data) ? res.data : [];
      const storiesWithMetrics = await Promise.all(
        storyList.map(async (story) => {
          try {
            const nodesRes = await api.get(`/stories/${story.id}/nodes`);
            const nodes = Array.isArray(nodesRes.data) ? nodesRes.data : [];

            const choiceCount = nodes.reduce((acc, node) => {
              const options = Array.isArray(node?.options) ? node.options : [];
              return acc + options.length;
            }, 0);

            return {
              ...story,
              nodeCount: nodes.length,
              choiceCount,
              hasStartNode: Number.isFinite(Number(story?.startNodeId)),
            };
          } catch (_err) {
            return {
              ...story,
              nodeCount: 0,
              choiceCount: 0,
              hasStartNode: Number.isFinite(Number(story?.startNodeId)),
            };
          }
        })
      );

      setStories(storiesWithMetrics);
    } catch (e) {
      if (!silent) {
        setError(getApiError(e, "Failed to load dashboard stories"));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMine(); }, []);

  const createStory = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    if (!title.trim()) return setError("Title is required");
    if (title.trim().length > MAX_TITLE_LENGTH) {
      return setError(`Title must be ${MAX_TITLE_LENGTH} characters or less`);
    }
    if (description.trim().length > MAX_DESCRIPTION_LENGTH) {
      return setError(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`);
    }

    try {
      const res = await api.post("/stories", { title, description });
      setMsg(`Story created (#${res.data.id})`);
      setTitle("");
      setDescription("");
      await loadMine({ silent: true });
    } catch (e2) {
      setError(getApiError(e2, "Create story failed"));
    }
  };

  const deleteStory = async (storyId, storyTitle) => {
    setMsg("");
    setError("");

    const confirmed = window.confirm(`Delete story "${storyTitle}"? This action cannot be undone.`);
    if (!confirmed) return;

    setDeletingStoryId(storyId);
    try {
      await api.delete(`/stories/${storyId}`);
      setStories((prev) => prev.filter((s) => s.id !== storyId));
      setMsg(`Story #${storyId} deleted`);
    } catch (err) {
      setError(getApiError(err, "Delete story failed"));
    } finally {
      setDeletingStoryId(null);
    }
  };

  const duplicateStory = async (storyId, storyTitle) => {
    setMsg("");
    setError("");
    setDuplicatingStoryId(storyId);

    try {
      const res = await api.post(`/stories/${storyId}/fork`);
      setMsg(`Story duplicated as #${res?.data?.id} (${storyTitle})`);
      await loadMine({ silent: true });
    } catch (err) {
      setError(getApiError(err, "Duplicate story failed"));
    } finally {
      setDuplicatingStoryId(null);
    }
  };

  const exportStory = async (storyId) => {
    setMsg("");
    setError("");
    setExportingStoryId(storyId);

    try {
      const [storyRes, nodesRes] = await Promise.all([
        api.get(`/stories/${storyId}`),
        api.get(`/stories/${storyId}/nodes`),
      ]);

      const payload = {
        exportedAt: new Date().toISOString(),
        story: storyRes.data,
        nodes: nodesRes.data,
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `story-${storyId}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      setMsg(`Story #${storyId} exported`);
    } catch (err) {
      setError(getApiError(err, "Export story failed"));
    } finally {
      setExportingStoryId(null);
    }
  };

  const togglePublish = async (story) => {
    setMsg("");
    setError("");
    setPublishingStoryId(story.id);

    try {
      await api.put(`/stories/${story.id}`, {
        isPublished: !story.isPublished,
      });

      setStories((prev) =>
        prev.map((item) =>
          item.id === story.id
            ? { ...item, isPublished: !story.isPublished }
            : item
        )
      );

      setMsg(
        !story.isPublished
          ? `Story #${story.id} published`
          : `Story #${story.id} moved to draft`
      );
    } catch (err) {
      setError(getApiError(err, "Publish update failed"));
    } finally {
      setPublishingStoryId(null);
    }
  };

  const totalStories = stories.length;
  const totalNodes = stories.reduce((acc, story) => acc + Number(story.nodeCount || 0), 0);
  const totalChoices = stories.reduce((acc, story) => acc + Number(story.choiceCount || 0), 0);
  const playableStories = stories.filter((story) => story.hasStartNode).length;
  const totalPlays = stories.reduce((acc, story) => acc + Number(story.playCount || 0), 0);
  const totalCompletions = stories.reduce((acc, story) => acc + Number(story.completionCount || 0), 0);
  const completionRate = totalPlays > 0 ? Math.round((totalCompletions / totalPlays) * 100) : 0;

  return (
    <div className="container">
      <div className="panel animIn">
        <div className="panelHeader">
          <div>
            <div className="kicker">CREATOR CONSOLE</div>
            <h1 className="panelBigTitle">Dashboard</h1>
            <p className="panelText">
              Logged in as <span className="strong">{user?.name}</span> — create stories and edit nodes.
            </p>
          </div>
          <button className="btn btnGhost" onClick={loadMine}>Reload</button>
        </div>

        {msg ? <div className="alert ok">{msg}</div> : null}
        {error ? <div className="alert error">{error}</div> : null}

        <div className="profileStats">
          <div className="stat">
            <div className="statLabel">Stories</div>
            <div className="statValue">{totalStories}</div>
          </div>
          <div className="stat">
            <div className="statLabel">Nodes</div>
            <div className="statValue">{totalNodes}</div>
          </div>
          <div className="stat">
            <div className="statLabel">Choices</div>
            <div className="statValue">{totalChoices}</div>
          </div>
          <div className="stat">
            <div className="statLabel">Playable</div>
            <div className="statValue">{playableStories}</div>
          </div>
          <div className="stat">
            <div className="statLabel">Plays</div>
            <div className="statValue">{totalPlays}</div>
          </div>
          <div className="stat">
            <div className="statLabel">Completions</div>
            <div className="statValue">{totalCompletions}</div>
          </div>
          <div className="stat">
            <div className="statLabel">Completion Rate</div>
            <div className="statValue">{completionRate}%</div>
          </div>
        </div>

        <div className="grid2">
          <div className="subPanel">
            <h2 className="subTitle">Create Story (Protected)</h2>
            <form className="form" onSubmit={createStory}>
              <div className="field">
                <label>Title</label>
                <input 
                  className="input" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={MAX_TITLE_LENGTH}
                />
                <div className="charCount">{title.length}/{MAX_TITLE_LENGTH}</div>
              </div>
              <div className="field">
                <label>Description</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                />
                <div className="charCount">{description.length}/{MAX_DESCRIPTION_LENGTH}</div>
              </div>
              <button className="btn btnPrimary">Create</button>
              <div className="muted smallText">After creating, click “Edit Nodes”.</div>
            </form>
          </div>

          <div className="subPanel">
            <h2 className="subTitle">Your Stories</h2>

            {loading ? <div className="alert ok">Loading…</div> : null}
            {(!loading && stories.length === 0) ? (
              <div className="empty">
                <div className="emptyTitle">No stories yet.</div>
                <div className="muted">Create your first one on the left.</div>
              </div>
            ) : null}

            <div className="cards">
              {stories.map((s) => (
                <div key={s.id} className="storyCard">
                  <div className="storyTop">
                    <div>
                      <div className="storyTitle">{s.title}</div>
                      <div className="storyMeta">ID #{s.id}</div>
                    </div>
                    <div className="chip small">
                      <span className="chipDot" />
                      {s.isPublished ? "published" : "draft"}
                    </div>
                  </div>
                  <div className="storyDesc">{s.description}</div>
                  <div className="kicker" style={{ marginTop: "8px" }}>
                    {`Nodes ${s.nodeCount || 0} | Choices ${s.choiceCount || 0} | ${s.hasStartNode ? "Ready to play" : "Start node missing"}`}
                  </div>
                  <div className="kicker" style={{ marginTop: "6px" }}>
                    {`Plays ${s.playCount || 0} | Completions ${s.completionCount || 0}`}
                  </div>
                  <div className="storyActions">
                    <Link className="btn btnGhost" to={`/stories/${s.id}/play`}>Play</Link>
                    <Link className="btn btnPrimary" to={`/stories/${s.id}/edit`}>Edit Nodes</Link>
                    <button
                      className="btn btnGhost"
                      type="button"
                      disabled={publishingStoryId === s.id}
                      onClick={() => togglePublish(s)}
                    >
                      {publishingStoryId === s.id
                        ? "Saving..."
                        : s.isPublished
                          ? "Move to Draft"
                          : "Publish"}
                    </button>
                    <button
                      className="btn btnGhost"
                      type="button"
                      disabled={duplicatingStoryId === s.id}
                      onClick={() => duplicateStory(s.id, s.title)}
                    >
                      {duplicatingStoryId === s.id ? "Duplicating..." : "Duplicate"}
                    </button>
                    <button
                      className="btn btnGhost"
                      type="button"
                      disabled={exportingStoryId === s.id}
                      onClick={() => exportStory(s.id)}
                    >
                      {exportingStoryId === s.id ? "Exporting..." : "Export JSON"}
                    </button>
                    <button
                      className="btn btnGhost"
                      type="button"
                      disabled={deletingStoryId === s.id}
                      onClick={() => deleteStory(s.id, s.title)}
                    >
                      {deletingStoryId === s.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
