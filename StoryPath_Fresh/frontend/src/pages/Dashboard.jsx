import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const loadMine = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/stories/mine");
      setStories(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load dashboard stories");
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

    try {
      const res = await api.post("/stories", { title, description });
      setMsg(`Story created (#${res.data.id})`);
      setTitle("");
      setDescription("");
      loadMine();
    } catch (e2) {
      setError(e2?.response?.data?.message || "Create story failed");
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
                <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="field">
                <label>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
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
