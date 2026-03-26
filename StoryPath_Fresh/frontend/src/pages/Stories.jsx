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

import { useEffect, useMemo, useState } from "react";
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
  const [searchInput, setSearchInput] = useState("");           // Search input (raw)
  const [searchQuery, setSearchQuery] = useState("");           // Search query (debounced)
  const [sortBy, setSortBy] = useState("newest");               // Sort order
  const [visibilityFilter, setVisibilityFilter] = useState("all"); // all | mine | community
  const [copiedStoryId, setCopiedStoryId] = useState(null);      // Story id for copied link feedback

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
    const timeoutId = setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    load(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (!copiedStoryId) return undefined;
    const timeoutId = setTimeout(() => setCopiedStoryId(null), 1200);
    return () => clearTimeout(timeoutId);
  }, [copiedStoryId]);

  const visibleStories = useMemo(() => {
    const mine = (story) => Number(user?.id) === Number(story?.userId);

    const filtered = stories.filter((story) => {
      if (visibilityFilter === "mine") return mine(story);
      if (visibilityFilter === "community") return !mine(story);
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "title-asc") {
        return String(a.title || "").localeCompare(String(b.title || ""));
      }
      if (sortBy === "title-desc") {
        return String(b.title || "").localeCompare(String(a.title || ""));
      }

      const timeA = new Date(a?.createdAt || 0).getTime();
      const timeB = new Date(b?.createdAt || 0).getTime();

      if (sortBy === "oldest") return timeA - timeB;
      return timeB - timeA;
    });

    return sorted;
  }, [stories, sortBy, visibilityFilter, user?.id]);

  const ownedCount = useMemo(
    () => stories.filter((story) => Number(story?.userId) === Number(user?.id)).length,
    [stories, user?.id]
  );

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
      alert(`Campaign "${storyTitle}" cloned successfully. Check your mission bay.`);
      load(searchQuery);
    } catch (e) {
      setError(e?.response?.data?.message || "Fork story failed");
    } finally {
      setForkingStoryId(null);
    }
  };

  const copyPlayLink = async (storyId) => {
    try {
      const link = `${window.location.origin}/stories/${storyId}/play`;
      await navigator.clipboard.writeText(link);
      setCopiedStoryId(storyId);
      setError("");
    } catch (_err) {
      setError("Could not copy link. Please copy the URL from browser address bar.");
    }
  };

  return (
    <div className="container">
      <div className="panel animIn">
        <div className="panelHeader">
          <div>
            <div className="kicker">STAR ARCHIVE</div>
            <h1 className="panelBigTitle">Galactic Campaigns</h1>
            <p className="panelText">Browse and play interactive saga missions.</p>
          </div>
          <button className="btn btnGhost" onClick={() => load(searchQuery)}>Refresh</button>
        </div>

        <div className="controlRow">
          <div className="chip small">
            <span className="chipDot" />
            {loading ? "Loading..." : `${visibleStories.length} shown`}
          </div>
          <div className="chip small">
            <span className="chipDot" />
            {`Your campaigns: ${ownedCount}`}
          </div>
        </div>

        <div className="searchRow">
          <input
            type="text"
            placeholder="Search campaigns by codename..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="searchInput"
          />
          <select
            className="selectInput"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
          </select>
          <select
            className="selectInput"
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
          >
            <option value="all">All Campaigns</option>
            <option value="community">Fleet Network</option>
            <option value="mine">My Campaigns</option>
          </select>
          <button
            type="button"
            className="btn btnGhost"
            onClick={() => setSearchInput("")}
          >
            Clear
          </button>
        </div>

        {error ? <div className="alert error">{error}</div> : null}
        {loading ? <div className="alert ok">Loading stories…</div> : null}

        {!loading && visibleStories.length === 0 ? (
          <div className="empty">
            <div className="emptyTitle">No campaigns detected.</div>
            <div className="muted">{searchQuery ? "Try a different signal query." : "Create one from Mission Bay after login."}</div>
          </div>
        ) : null}

        <div className="cards">
          {visibleStories.map((s, idx) => (
            <div key={s.id} className={`storyCard animIn ${idx % 2 ? "delay1" : ""}`}>
              {Number(user?.id) === Number(s?.userId) ? (
                <div className="chip small">
                  <span className="chipDot" />
                  your campaign
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
                  {s.isPublished ? "broadcast" : "draft"}
                </div>
              </div>
              <div className="storyDesc">{s.description}</div>
              <div className="kicker" style={{ marginTop: "8px" }}>
                {`Plays ${s.playCount || 0} | Completions ${s.completionCount || 0}`}
              </div>
              <div className="storyActions">
                <Link className="btn btnPrimary" to={`/stories/${s.id}/play`}>Deploy</Link>
                <button
                  type="button"
                  className="btn btnGhost"
                  onClick={() => copyPlayLink(s.id)}
                >
                  {copiedStoryId === s.id ? "Signal Copied" : "Transmit"}
                </button>
                {Number(user?.id) !== Number(s?.userId) ? (
                  <button
                    type="button"
                    className="btn btnGhost"
                    disabled={forkingStoryId === s.id}
                    onClick={() => forkStory(s.id, s.title)}
                  >
                    {forkingStoryId === s.id ? "Cloning..." : "Clone/Remix"}
                  </button>
                ) : null}
                {Number(user?.id) === Number(s?.userId) ? (
                  <>
                    <Link className="btn btnGhost" to={`/stories/${s.id}/edit`}>Edit Mission Nodes</Link>
                    <button
                      type="button"
                      className="btn btnGhost"
                      disabled={deletingStoryId === s.id}
                      onClick={() => deleteStory(s.id, s.title)}
                    >
                      {deletingStoryId === s.id ? "Purging..." : "Delete"}
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
