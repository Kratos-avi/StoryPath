/**
 * Story Playback Page
 * 
 * Interactive player for reading and navigating through stories.
 * Features:
 * - Display story content nodes
 * - User choice branching (multiple choices per node)
 * - Navigation: Back, Restart, and choice buttons
 * - Error handling for missing nodes
 * 
 * Publicly accessible - any user can play any story.
 */

import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";

/**
 * Normalize choice data from node options
 * Validates and sanitizes choice objects before rendering
 * Filters out invalid choices (missing text or node ID)
 * 
 * Returns: Array of valid choice objects with text and nextNodeId
 */
const normalizeOptions = (options) => {
  // Return empty array if options is not an array
  if (!Array.isArray(options)) return [];
  
  // Map and validate each option
  return options
    .map((opt) => ({
      text: String(opt?.text || "").trim(),
      nextNodeId: Number(opt?.nextNodeId),
    }))
    // Filter out invalid choices (empty text or NaN node IDs)
    .filter((opt) => opt.text && !Number.isNaN(opt.nextNodeId));
};

export default function PlayStory() {
  const { id } = useParams();
  const [story, setStory] = useState(null);        // Story metadata (title, description)
  const [node, setNode] = useState(null);          // Current story node being displayed
  const [trail, setTrail] = useState([]);          // History of visited nodes for back button
  const [error, setError] = useState("");           // Error messages for user
  const [loadingNext, setLoadingNext] = useState(false); // Loading state during navigation
  const playTrackedRef = useRef(false);
  const completionTrackedRef = useRef(false);

  const load = async () => {
    setError("");
    playTrackedRef.current = false;
    completionTrackedRef.current = false;
    try {
      const s = await api.get(`/stories/${id}`);
      setStory(s.data);

      const start = await api.get(`/stories/${id}/start`);
      setNode(start.data);
      setTrail([start.data.id]);

      if (!playTrackedRef.current) {
        playTrackedRef.current = true;
        api
          .post(`/stories/${id}/track-play`)
          .then((res) => {
            setStory((prev) => ({
              ...(prev || {}),
              playCount: res?.data?.playCount ?? prev?.playCount ?? 0,
              completionCount:
                res?.data?.completionCount ?? prev?.completionCount ?? 0,
            }));
          })
          .catch(() => {
            // Ignore analytics failures to avoid interrupting playback.
          });
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Cannot play this story yet (missing start node).");
    }
  };

  useEffect(() => { load(); }, [id]);

  const choose = async (option) => {
    setError("");
    setLoadingNext(true);
    try {
      const res = await api.get(`/nodes/${option.nextNodeId}`);
      if (Number(res.data.storyId) !== Number(id)) {
        setError("Invalid choice target for this story.");
        return;
      }
      setNode(res.data);
      setTrail((prev) => [...prev, res.data.id]);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load selected node");
    } finally {
      setLoadingNext(false);
    }
  };

  const canGoBack = trail.length > 1;
  const goBack = async () => {
    if (!canGoBack) return;
    setError("");
    setLoadingNext(true);
    try {
      const previousNodeId = trail[trail.length - 2];
      const res = await api.get(`/nodes/${previousNodeId}`);
      setNode(res.data);
      setTrail((prev) => prev.slice(0, -1));
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to go back");
    } finally {
      setLoadingNext(false);
    }
  };

  const options = normalizeOptions(node?.options);

  useEffect(() => {
    if (!node) return;
    if (options.length > 0) return;
    if (completionTrackedRef.current) return;

    completionTrackedRef.current = true;
    api
      .post(`/stories/${id}/track-completion`)
      .then((res) => {
        setStory((prev) => ({
          ...(prev || {}),
          playCount: res?.data?.playCount ?? prev?.playCount ?? 0,
          completionCount:
            res?.data?.completionCount ?? prev?.completionCount ?? 0,
        }));
      })
      .catch(() => {
        // Ignore analytics failures to avoid interrupting playback.
      });
  }, [id, node, options.length]);

  return (
    <div className="container">
      <div className="panel animIn">
        <div className="panelHeader">
          <div>
            <div className="kicker">PLAY MODE</div>
            <h1 className="panelBigTitle">{story?.title || "Story"}</h1>
            <p className="panelText">{story?.description}</p>
            <div className="kicker" style={{ marginTop: "6px" }}>
              {`Plays ${story?.playCount || 0} | Completions ${story?.completionCount || 0}`}
            </div>
          </div>
          <button type="button" className="btn btnGhost" onClick={load}>Restart</button>
        </div>

        {error ? <div className="alert error">{error}</div> : null}

        {node ? (
          <div className="playCard">
            <div className="playGlow" />
            <div className="playText">{node.content}</div>

            <div className="divider" />

            {options.length > 0 ? (
              <div className="choiceList">
                {options.map((opt, idx) => (
                  <button
                    type="button"
                    key={`${opt.nextNodeId}-${idx}`}
                    className="btn btnGhost choiceBtn"
                    disabled={loadingNext}
                    onClick={() => choose(opt)}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            ) : (
              <div className="empty">
                <div className="emptyTitle">Story End</div>
                <div className="muted">No further choices from this node.</div>
              </div>
            )}

            <div className="rowBtns playActions">
              <button
                type="button"
                className="btn btnGhost"
                onClick={goBack}
                disabled={!canGoBack || loadingNext}
              >
                Back
              </button>
              <button type="button" className="btn btnPrimary" onClick={load} disabled={loadingNext}>
                Restart Story
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
