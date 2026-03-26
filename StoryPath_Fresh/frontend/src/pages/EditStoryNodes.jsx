/**
 * Story Node Editor Page (Protected)
 * 
 * Interface for creators to add, edit, and manage story nodes (pages).
 * Features:
 * - Add new nodes with content
 * - Edit existing node content and choices
 * - Set story start node
 * - Delete nodes
 * - Format choices as "Label -> NodeId"
 * 
 * Requires authentication and story ownership.
 */

import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";

// Define content length limits for validation
const MAX_NODE_CONTENT_LENGTH = 5000;
const MAX_CHOICE_TEXT_LENGTH = 200;

/**
 * Convert node options array to text format for editing
 * Format: Choice Text -> NodeId (one per line)
 * Useful for textarea editing where users see human-readable format
 */
const formatOptionsAsText = (options) => {
  if (!Array.isArray(options) || options.length === 0) return "";
  return options
    .map((opt) => {
      const label = String(opt?.text || "").trim();
      const nextNodeId = opt?.nextNodeId;
      // Only include valid options with both label and node ID
      if (!label || !Number.isFinite(Number(nextNodeId))) return "";
      return `${label} -> ${Number(nextNodeId)}`;
    })
    .filter(Boolean)
    .join("\n");
};

/**
 * Parse choice options from text format
 * Input format: One choice per line as Label -> NodeId
 * Validates syntax and throws descriptive errors for invalid formats
 */
const parseOptionsFromText = (text) => {
  if (!text.trim()) return [];

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  // Each line follows: Choice label -> NodeId format
  const parsed = lines.map((line, idx) => {
    const parts = line.split("->");
    if (parts.length !== 2) {
      throw new Error(`Invalid option format on line ${idx + 1}. Use: Label -> NodeId`);
    }

    const label = parts[0].trim();
    const nextNodeId = Number(parts[1].trim());

    if (!label) {
      throw new Error(`Option label missing on line ${idx + 1}`);
    }
    if (Number.isNaN(nextNodeId)) {
      throw new Error(`Invalid node id on line ${idx + 1}`);
    }

    return { text: label, nextNodeId };
  });

  return parsed;
};

export default function EditStoryNodes() {
  const { id } = useParams();
  const draftStorageKey = `storypath-node-drafts-${id}`;

  // ============= STATE VARIABLES =============
  const [story, setStory] = useState(null);           // Story metadata
  const [nodes, setNodes] = useState([]);             // All story nodes
  const [nodeDrafts, setNodeDrafts] = useState({});   // Draft edits for each node
  const [serverDraftSnapshot, setServerDraftSnapshot] = useState({}); // Last loaded snapshot from server
  const [savingNodeId, setSavingNodeId] = useState(null);    // Node being saved
  const [deletingNodeId, setDeletingNodeId] = useState(null); // Node being deleted
  const [settingStartId, setSettingStartId] = useState(null); // Setting start node
  const [error, setError] = useState("");             // Error message
  const [msg, setMsg] = useState("");                 // Success message

  // Form state for adding new nodes
  const [content, setContent] = useState("");         // New node content
  const [isStart, setIsStart] = useState(false);      // Whether new node is start

  const load = async () => {
    setError("");
    setMsg("");
    try {
      const s = await api.get(`/stories/${id}`);
      setStory(s.data);

      const n = await api.get(`/stories/${id}/nodes`);
      setNodes(n.data);
      const nextDrafts = n.data.reduce((acc, node) => {
          acc[node.id] = {
            content: node.content || "",
            optionsText: formatOptionsAsText(node.options),
          };
          return acc;
        }, {});

      setServerDraftSnapshot(nextDrafts);

      const localDraftsRaw = localStorage.getItem(draftStorageKey);
      if (localDraftsRaw) {
        try {
          const localDrafts = JSON.parse(localDraftsRaw);
          const mergedDrafts = { ...nextDrafts };

          Object.keys(localDrafts || {}).forEach((nodeId) => {
            if (mergedDrafts[nodeId]) {
              mergedDrafts[nodeId] = {
                ...mergedDrafts[nodeId],
                ...localDrafts[nodeId],
              };
            }
          });

          setNodeDrafts(mergedDrafts);
        } catch (_err) {
          setNodeDrafts(nextDrafts);
        }
      } else {
        setNodeDrafts(nextDrafts);
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load story/nodes");
    }
  };

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (!Object.keys(nodeDrafts).length) return undefined;

    const timeoutId = setTimeout(() => {
      localStorage.setItem(draftStorageKey, JSON.stringify(nodeDrafts));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [nodeDrafts, draftStorageKey]);

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(nodeDrafts) !== JSON.stringify(serverDraftSnapshot);
  }, [nodeDrafts, serverDraftSnapshot]);

  useEffect(() => {
    if (!hasUnsavedChanges) return undefined;

    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasUnsavedChanges]);

  const draftSummary = useMemo(() => {
    const allNodeIds = new Set(nodes.map((node) => Number(node.id)));
    let linkCount = 0;
    const brokenLinks = [];

    Object.entries(nodeDrafts).forEach(([nodeId, draft]) => {
      if (!draft) return;

      try {
        const parsed = parseOptionsFromText(draft.optionsText || "");
        linkCount += parsed.length;

        parsed.forEach((choice) => {
          const nextId = Number(choice.nextNodeId);
          if (!allNodeIds.has(nextId)) {
            brokenLinks.push(`#${nodeId} -> #${nextId}`);
          }
        });
      } catch (_err) {
        // Ignore parse errors in summary; save action still validates strictly.
      }
    });

    return {
      nodeCount: nodes.length,
      linkCount,
      brokenLinks,
    };
  }, [nodeDrafts, nodes]);

  const graphData = useMemo(() => {
    const nodeIds = nodes.map((node) => Number(node.id));
    const nodeIdSet = new Set(nodeIds);
    const total = nodes.length || 1;
    const centerX = 380;
    const centerY = 220;
    const radius = Math.max(110, Math.min(180, total * 24));

    const graphNodes = nodes.map((node, index) => {
      const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
      return {
        id: Number(node.id),
        label: `#${node.id}`,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        isStart: Number(story?.startNodeId) === Number(node.id),
      };
    });

    const byId = Object.fromEntries(graphNodes.map((node) => [node.id, node]));
    const graphEdges = [];

    Object.entries(nodeDrafts).forEach(([nodeId, draft]) => {
      if (!draft) return;
      try {
        const parsed = parseOptionsFromText(draft.optionsText || "");
        parsed.forEach((choice, idx) => {
          const fromId = Number(nodeId);
          const toId = Number(choice.nextNodeId);

          if (!nodeIdSet.has(fromId) || !nodeIdSet.has(toId)) return;
          if (!byId[fromId] || !byId[toId]) return;

          graphEdges.push({
            id: `${fromId}-${toId}-${idx}`,
            fromId,
            toId,
            label: choice.text,
          });
        });
      } catch (_err) {
        // Ignore parse errors in graph rendering.
      }
    });

    return { graphNodes, graphEdges, byId };
  }, [nodes, nodeDrafts, story?.startNodeId]);

  const addNode = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    if (!content.trim()) return setError("Node content is required");
    if (content.length > MAX_NODE_CONTENT_LENGTH) {
      return setError(`Node content must be ${MAX_NODE_CONTENT_LENGTH} characters or less`);
    }

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

  const setAsStart = async (nodeId) => {
    setError("");
    setMsg("");
    setSettingStartId(nodeId);
    try {
      await api.put(`/stories/${id}`, { startNodeId: nodeId });
      setMsg(`Node #${nodeId} is now the start node`);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update start node");
    } finally {
      setSettingStartId(null);
    }
  };

  const saveNode = async (nodeId) => {
    setError("");
    setMsg("");

    const draft = nodeDrafts[nodeId];
    if (!draft?.content?.trim()) {
      setError("Node content is required");
      return;
    }

    setSavingNodeId(nodeId);
    try {
      const options = parseOptionsFromText(draft.optionsText || "");
      await api.put(`/nodes/${nodeId}`, {
        content: draft.content,
        options,
      });
      setMsg(`Node #${nodeId} saved`);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to save node");
    } finally {
      setSavingNodeId(null);
    }
  };

  const deleteNode = async (nodeId) => {
    setError("");
    setMsg("");

    const confirmed = window.confirm(`Delete node #${nodeId}? This action cannot be undone.`);
    if (!confirmed) return;

    setDeletingNodeId(nodeId);
    try {
      await api.delete(`/nodes/${nodeId}`);
      setMsg(`Node #${nodeId} deleted`);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to delete node");
    } finally {
      setDeletingNodeId(null);
    }
  };

  const discardLocalDrafts = () => {
    localStorage.removeItem(draftStorageKey);
    setNodeDrafts(serverDraftSnapshot);
    setMsg("Local drafts discarded");
    setError("");
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

        <div className="controlRow">
          <div className="chip small">
            <span className="chipDot" />
            {`Nodes ${draftSummary.nodeCount}`}
          </div>
          <div className="chip small">
            <span className="chipDot" />
            {`Links ${draftSummary.linkCount}`}
          </div>
          <div className="chip small">
            <span className="chipDot" />
            {hasUnsavedChanges ? "Unsaved drafts" : "All changes saved"}
          </div>
          <button type="button" className="btn btnGhost" onClick={discardLocalDrafts}>
            Discard Local Drafts
          </button>
        </div>

        {draftSummary.brokenLinks.length > 0 ? (
          <div className="alert error">
            {`Possible broken links: ${draftSummary.brokenLinks.slice(0, 4).join(", ")}${draftSummary.brokenLinks.length > 4 ? " ..." : ""}`}
          </div>
        ) : null}

        <div className="subPanel" style={{ marginBottom: "16px" }}>
          <div className="panelHeader">
            <div>
              <div className="kicker">Story Graph View</div>
              <h2 className="subTitle" style={{ margin: 0 }}>Branching Map</h2>
            </div>
            <div className="chip small">
              <span className="chipDot" />
              {`${graphData.graphNodes.length} nodes / ${graphData.graphEdges.length} links`}
            </div>
          </div>

          {graphData.graphNodes.length === 0 ? (
            <div className="empty">
              <div className="emptyTitle">Graph will appear after adding nodes.</div>
            </div>
          ) : (
            <div className="graphWrap">
              <svg viewBox="0 0 760 440" className="storyGraph" role="img" aria-label="Story graph view">
                <defs>
                  <marker
                    id="graphArrow"
                    markerWidth="10"
                    markerHeight="8"
                    refX="9"
                    refY="4"
                    orient="auto"
                  >
                    <path d="M0,0 L10,4 L0,8 z" fill="rgba(75,210,255,.82)" />
                  </marker>
                </defs>

                {graphData.graphEdges.map((edge) => {
                  const from = graphData.byId[edge.fromId];
                  const to = graphData.byId[edge.toId];
                  if (!from || !to) return null;

                  return (
                    <g key={edge.id}>
                      <line
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        className="graphEdge"
                        markerEnd="url(#graphArrow)"
                      />
                    </g>
                  );
                })}

                {graphData.graphNodes.map((node) => (
                  <g key={node.id}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.isStart ? 26 : 22}
                      className={node.isStart ? "graphNode graphNodeStart" : "graphNode"}
                    />
                    <text x={node.x} y={node.y + 4} textAnchor="middle" className="graphNodeText">
                      {node.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          )}
        </div>

        <div className="grid2">
          <div className="subPanel">
            <h2 className="subTitle">Add Node</h2>
            <form className="form" onSubmit={addNode}>
              <div className="field">
                <label>Content</label>
                <textarea 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={MAX_NODE_CONTENT_LENGTH}
                />
                <div className="charCount">{content.length}/{MAX_NODE_CONTENT_LENGTH}</div>
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
                        Node #{n.id}{story?.startNodeId === n.id ? " • START" : ""}
                      </div>
                      <div className="rowBtns">
                        <button
                          type="button"
                          className="btn btnGhost"
                          disabled={settingStartId === n.id}
                          onClick={() => setAsStart(n.id)}
                        >
                          {settingStartId === n.id ? "Setting..." : "Set Start"}
                        </button>
                      </div>
                    </div>

                    <div className="field">
                      <label>Node Content</label>
                      <textarea
                        value={nodeDrafts[n.id]?.content || ""}
                        onChange={(e) =>
                          setNodeDrafts((prev) => ({
                            ...prev,
                            [n.id]: { ...prev[n.id], content: e.target.value },
                          }))
                        }
                        maxLength={MAX_NODE_CONTENT_LENGTH}
                      />
                      <div className="charCount">{(nodeDrafts[n.id]?.content || "").length}/{MAX_NODE_CONTENT_LENGTH}</div>
                    </div>

                    <div className="field">
                      <label>Choices (one per line: Label -&gt; NodeId)</label>
                      <textarea
                        value={nodeDrafts[n.id]?.optionsText || ""}
                        onChange={(e) =>
                          setNodeDrafts((prev) => ({
                            ...prev,
                            [n.id]: { ...prev[n.id], optionsText: e.target.value },
                          }))
                        }
                      />
                    </div>

                    <div className="rowBtns">
                      <button
                        type="button"
                        className="btn btnPrimary"
                        disabled={savingNodeId === n.id}
                        onClick={() => saveNode(n.id)}
                      >
                        {savingNodeId === n.id ? "Saving..." : "Save Node"}
                      </button>

                      <button
                        type="button"
                        className="btn btnGhost"
                        disabled={deletingNodeId === n.id}
                        onClick={() => deleteNode(n.id)}
                      >
                        {deletingNodeId === n.id ? "Deleting..." : "Delete Node"}
                      </button>
                    </div>
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
