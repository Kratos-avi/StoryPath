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
      setStories(res.data);
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
                      creator
                    </div>
                  </div>
                  <div className="storyDesc">{s.description}</div>
                  <div className="storyActions">
                    <Link className="btn btnGhost" to={`/stories/${s.id}/play`}>Play</Link>
                    <Link className="btn btnPrimary" to={`/stories/${s.id}/edit`}>Edit Nodes</Link>
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
