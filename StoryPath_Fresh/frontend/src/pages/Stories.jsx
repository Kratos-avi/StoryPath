/**
 * Public Stories Browse Page
 * 
 * Displays all public stories in a searchable list.
 * Features:
 * - Search stories by title
 * - Play or fork (remix) stories
 * - Edit/delete own stories
 * - View story creator information
 * 
 * Accessible to both authenticated and unauthenticated users.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

/**
 * Stories Component
 * Fetches and displays all public stories with filtering and actions
 */
export default function Stories() {
  const { user } = useAuth();
  
  // ============= STORIES STATE =============
  const [stories, setStories] = useState([]);        // All public stories
  const [loading, setLoading] = useState(true);      // Loading state
  const [error, setError] = useState("");            // Error message
  
  // ============= ACTION STATES =============
  const [deletingStoryId, setDeletingStoryId] = useState(null); // Delete in progress
  const [forkingStoryId, setForkingStoryId] = useState(null);   // Fork in progress
  const [searchQuery, setSearchQuery] = useState("");           // Search filter

  const load = async (search = "") => {
    setLoading(true);
    setError("");
    try {
      const params = search ? { search } : {};
      const res = await api.get("/stories", { params });
      setStories(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load stories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    load(searchQuery);
  }, [searchQuery]);

  const deleteStory = async (storyId, storyTitle) => {
    const confirmed = window.confirm(`Delete story "${storyTitle}"? This action cannot be undone.`);
    if (!confirmed) return;

    setDeletingStoryId(storyId);
    setError("");
    try {
      await api.delete(`/stories/${storyId}`);
      setStories((prev) => prev.filter((s) => s.id !== storyId));
    } catch (e) {
      setError(e?.response?.data?.message || "Delete story failed");
    } finally {
      setDeletingStoryId(null);
    }
  };

  const forkStory = async (storyId, storyTitle) => {
    if (!user) {
      setError("You must be logged in to fork a story");
      return;
    }

    setForkingStoryId(storyId);
    setError("");
    try {
      const res = await api.post(`/stories/${storyId}/fork`);
      setError("");
      alert(`Story "${storyTitle}" forked successfully! Check your dashboard.`);
      load(searchQuery);
    } catch (e) {
      setError(e?.response?.data?.message || "Fork story failed");
    } finally {
      setForkingStoryId(null);
    }
  };

  return (
    <div className="container">
      <div className="panel animIn">
        <div className="panelHeader">
          <div>
            <div className="kicker">PUBLIC ARCHIVE</div>
            <h1 className="panelBigTitle">Stories</h1>
            <p className="panelText">Browse and play interactive stories.</p>
          </div>
          <button className="btn btnGhost" onClick={() => load(searchQuery)}>Refresh</button>
        </div>

        <div className="searchRow">
          <input
            type="text"
            placeholder="Search stories by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="searchInput"
          />
        </div>

        {error ? <div className="alert error">{error}</div> : null}
        {loading ? <div className="alert ok">Loading stories…</div> : null}

        {!loading && stories.length === 0 ? (
          <div className="empty">
            <div className="emptyTitle">No stories found.</div>
            <div className="muted">{searchQuery ? "Try a different search." : "Create one from Dashboard after login."}</div>
          </div>
        ) : null}

        <div className="cards">
          {stories.map((s, idx) => (
            <div key={s.id} className={`storyCard animIn ${idx % 2 ? "delay1" : ""}`}>
              {Number(user?.id) === Number(s?.userId) ? (
                <div className="chip small">
                  <span className="chipDot" />
                  your story
                </div>
              ) : null}

              <div className="storyTop">
                <div>
                  <div className="storyTitle">{s.title}</div>
                  <div className="storyMeta">
                    by <Link to={`/users/${s?.user?.id}/profile`} className="creatorLink">{s?.user?.name || "Unknown"}</Link> • ID #{s.id}
                  </div>
                </div>
                <div className="chip small">
                  <span className="chipDot" />
                  playable
                </div>
              </div>
              <div className="storyDesc">{s.description}</div>
              <div className="storyActions">
                <Link className="btn btnPrimary" to={`/stories/${s.id}/play`}>Play</Link>
                {Number(user?.id) !== Number(s?.userId) ? (
                  <button
                    type="button"
                    className="btn btnGhost"
                    disabled={forkingStoryId === s.id}
                    onClick={() => forkStory(s.id, s.title)}
                  >
                    {forkingStoryId === s.id ? "Forking..." : "Fork/Remix"}
                  </button>
                ) : null}
                {Number(user?.id) === Number(s?.userId) ? (
                  <>
                    <Link className="btn btnGhost" to={`/stories/${s.id}/edit`}>Edit Nodes</Link>
                    <button
                      type="button"
                      className="btn btnGhost"
                      disabled={deletingStoryId === s.id}
                      onClick={() => deleteStory(s.id, s.title)}
                    >
                      {deletingStoryId === s.id ? "Deleting..." : "Delete"}
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
