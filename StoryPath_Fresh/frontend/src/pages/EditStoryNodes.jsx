import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";

export default function EditStoryNodes() {
  const { id } = useParams();

  const [story, setStory] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [content, setContent] = useState("");
  const [isStart, setIsStart] = useState(false);

  const load = async () => {
    setError("");
    setMsg("");
    try {
      const s = await api.get(`/stories/${id}`);
      setStory(s.data);

      const n = await api.get(`/stories/${id}/nodes`);
      setNodes(n.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load story/nodes");
    }
  };

  useEffect(() => { load(); }, [id]);

  const addNode = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    if (!content.trim()) return setError("Node content is required");

    try {
      await api.post(`/stories/${id}/nodes`, { content, isStart });
      setContent("");
      setIsStart(false);
      setMsg("Node added");
      load();
    } catch (e2) {
      setError(e2?.response?.data?.message || "Failed to add node");
    }
  };

  return (
    <div className="container">
      <div className="panel animIn">
        <div className="panelHeader">
          <div>
            <div className="kicker">NODE FORGE</div>
            <h1 className="panelBigTitle">Edit Nodes</h1>
            <p className="panelText">
              Story: <span className="strong">{story?.title || `#${id}`}</span>
            </p>
          </div>
          <button className="btn btnGhost" onClick={load}>Reload</button>
        </div>

        {msg ? <div className="alert ok">{msg}</div> : null}
        {error ? <div className="alert error">{error}</div> : null}

        <div className="grid2">
          <div className="subPanel">
            <h2 className="subTitle">Add Node</h2>
            <form className="form" onSubmit={addNode}>
              <div className="field">
                <label>Content</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} />
              </div>

              <label className="checkRow">
                <input type="checkbox" checked={isStart} onChange={(e) => setIsStart(e.target.checked)} />
                <span>Set as Start Node</span>
              </label>

              <button className="btn btnPrimary">Add Node</button>
              <div className="muted smallText">
                Next: add choices between nodes (we can add UI for that next).
              </div>
            </form>
          </div>

          <div className="subPanel">
            <h2 className="subTitle">Nodes</h2>
            {nodes.length === 0 ? (
              <div className="empty">
                <div className="emptyTitle">No nodes yet.</div>
                <div className="muted">Add the start node first.</div>
              </div>
            ) : (
              <div className="cards">
                {nodes.map((n) => (
                  <div key={n.id} className="nodeCard">
                    <div className="nodeTop">
                      <div className="chip small">
                        <span className="chipDot" />
                        Node #{n.id}{n.isStart ? " • START" : ""}
                      </div>
                    </div>
                    <div className="nodeText">{n.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
