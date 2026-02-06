import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/stories");
      setStories(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load stories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="container">
      <div className="panel animIn">
        <div className="panelHeader">
          <div>
            <div className="kicker">PUBLIC ARCHIVE</div>
            <h1 className="panelBigTitle">Stories</h1>
            <p className="panelText">Browse and play interactive stories.</p>
          </div>
          <button className="btn btnGhost" onClick={load}>Refresh</button>
        </div>

        {error ? <div className="alert error">{error}</div> : null}
        {loading ? <div className="alert ok">Loading stories…</div> : null}

        {!loading && stories.length === 0 ? (
          <div className="empty">
            <div className="emptyTitle">No stories yet.</div>
            <div className="muted">Create one from Dashboard after login.</div>
          </div>
        ) : null}

        <div className="cards">
          {stories.map((s, idx) => (
            <div key={s.id} className={`storyCard animIn ${idx % 2 ? "delay1" : ""}`}>
              <div className="storyTop">
                <div>
                  <div className="storyTitle">{s.title}</div>
                  <div className="storyMeta">
                    by <span className="strong">{s?.user?.name || "Unknown"}</span> • ID #{s.id}
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
