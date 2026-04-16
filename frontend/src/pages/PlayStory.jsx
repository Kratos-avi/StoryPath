import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";

export default function PlayStory() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [node, setNode] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [loadingNext, setLoadingNext] = useState(false);

  const getNodeOptions = (rawOptions) => {
    if (!Array.isArray(rawOptions)) return [];
    return rawOptions
      .map((option) => ({
        text: String(option?.text || "").trim(),
        targetNodeId: Number(option?.targetNodeId ?? option?.nextNodeId),
      }))
      .filter((option) => option.text && Number.isFinite(option.targetNodeId));
  };

  const load = async () => {
    setError("");
    try {
      const s = await api.get(`/stories/${id}`);
      setStory(s.data);

      const start = await api.get(`/stories/${id}/start`);
      setNode(start.data);
      setHistory([start.data.id]);
    } catch (e) {
      setError(e?.response?.data?.message || "Cannot play this story yet (missing start node).");
    }
  };

  const chooseOption = async (targetNodeId) => {
    setError("");
    setLoadingNext(true);
    try {
      const next = await api.get(`/nodes/${targetNodeId}`);
      setNode(next.data);
      setHistory((prev) => [...prev, next.data.id]);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load next node.");
    } finally {
      setLoadingNext(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [id]);

  const options = getNodeOptions(node?.options);

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

            <div className="storyActions">
              {options.map((option, index) => (
                <button
                  key={`${option.targetNodeId}-${index}`}
                  className="btn btnYellow"
                  onClick={() => chooseOption(option.targetNodeId)}
                  disabled={loadingNext}
                >
                  {option.text}
                </button>
              ))}
            </div>

            <div className="muted smallText routeMeta">
              Path: {history.join(" -> ")}
            </div>

            <div className="muted smallText">
              {options.length === 0 ? "No choices here. This is an ending node." : "Choose an option to continue."}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
