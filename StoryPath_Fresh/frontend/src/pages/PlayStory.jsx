import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";

export default function PlayStory() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [node, setNode] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const s = await api.get(`/stories/${id}`);
      setStory(s.data);

      const start = await api.get(`/stories/${id}/start`);
      setNode(start.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Cannot play this story yet (missing start node).");
    }
  };

  useEffect(() => { load(); }, [id]);

  return (
    <div className="container">
      <div className="panel animIn">
        <div className="panelHeader">
          <div>
            <div className="kicker">PLAY MODE</div>
            <h1 className="panelBigTitle">{story?.title || "Story"}</h1>
            <p className="panelText">{story?.description}</p>
          </div>
          <button className="btn btnGhost" onClick={load}>Restart</button>
        </div>

        {error ? <div className="alert error">{error}</div> : null}

        {node ? (
          <div className="playCard">
            <div className="playGlow" />
            <div className="playText">{node.content}</div>

            <div className="muted smallText">
              Choices UI will appear here when we connect choices endpoint.
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
