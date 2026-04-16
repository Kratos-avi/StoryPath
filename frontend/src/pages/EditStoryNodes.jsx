import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";

// EditStoryNodes is the branching editor for authors to build the decision tree.
export default function EditStoryNodes() {
  const { id } = useParams();

  const [story, setStory] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [content, setContent] = useState("");
  const [isStart, setIsStart] = useState(false);
  const [drafts, setDrafts] = useState({});

  // Normalize stored choice data into a consistent list for editing.
  const getOptions = (options) => {
    if (!Array.isArray(options)) return [];
    return options
      .map((option) => ({
        text: String(option?.text || "").trim(),
        targetNodeId: Number(option?.targetNodeId ?? option?.nextNodeId),
      }))
      .filter((option) => option.text && Number.isFinite(option.targetNodeId));
  };

  // Load the story and all of its nodes so the editor stays in sync with the API.
  const load = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    // The first data load intentionally hydrates component state after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Create a new node for the current story.
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

  // Mark a node as the story's entry point.
  const setStartNode = async (nodeId) => {
    setMsg("");
    setError("");
    try {
      await api.put(`/stories/${id}/start`, { nodeId });
      setMsg(`Node #${nodeId} set as start node`);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to set start node");
    }
  };

  // Keep one draft object per node so choice edits stay isolated.
  const changeDraft = (nodeId, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [nodeId]: {
        text: prev[nodeId]?.text || "",
        targetNodeId: prev[nodeId]?.targetNodeId || "",
        [field]: value,
      },
    }));
  };

  // Append a choice that links one node to another.
  const addChoice = async (node) => {
    const draft = drafts[node.id] || { text: "", targetNodeId: "" };
    const text = draft.text?.trim();
    const targetNodeId = Number(draft.targetNodeId);

    if (!text) return setError("Choice text is required");
    if (!Number.isFinite(targetNodeId)) return setError("Target node id is required");

    const exists = nodes.some((n) => n.id === targetNodeId);
    if (!exists) return setError("Target node id must exist in this story");

    setMsg("");
    setError("");

    const nextOptions = [...getOptions(node.options), { text, targetNodeId, nextNodeId: targetNodeId }];

    try {
      await api.put(`/nodes/${node.id}`, { options: nextOptions });
      setMsg(`Choice added to node #${node.id}`);
      setDrafts((prev) => ({
        ...prev,
        [node.id]: { text: "", targetNodeId: "" },
      }));
      load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to add choice");
    }
  };

  // Remove a branching choice by rebuilding the stored options list.
  const removeChoice = async (node, indexToRemove) => {
    setMsg("");
    setError("");
    const nextOptions = getOptions(node.options).filter((_, index) => index !== indexToRemove);
    try {
      await api.put(`/nodes/${node.id}`, { options: nextOptions });
      setMsg(`Choice removed from node #${node.id}`);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to remove choice");
    }
  };

  // Delete a node after the user confirms the action.
  const deleteNode = async (nodeId) => {
    setMsg("");
    setError("");

    const ok = window.confirm(`Delete node #${nodeId}? Choices targeting it may break.`);
    if (!ok) return;

    try {
      await api.delete(`/nodes/${nodeId}`);
      setMsg(`Node #${nodeId} deleted`);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to delete node");
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
                Next: connect choices between nodes to shape each path.
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
                      {story?.startNodeId !== n.id ? (
                        <button className="btn btnGhost btnTiny" onClick={() => setStartNode(n.id)}>
                          Make Start
                        </button>
                      ) : null}
                    </div>
                    <div className="nodeText">{n.content}</div>

                    <div className="choicesWrap">
                      <div className="smallText">Choices</div>
                      <div className="storyActions">
                        <button className="btn btnGhost btnTiny" onClick={() => deleteNode(n.id)}>
                          Delete Node
                        </button>
                      </div>

                      {getOptions(n.options).length === 0 ? (
                        <div className="muted smallText">No choices yet.</div>
                      ) : (
                        <div className="cards compact">
                          {getOptions(n.options).map((option, index) => (
                            <div key={`${option.targetNodeId}-${index}`} className="choiceItem">
                              <div className="choiceText">
                                {`${option.text} to Node #${option.targetNodeId}`}
                              </div>
                              <button
                                className="btn btnGhost btnTiny"
                                onClick={() => removeChoice(n, index)}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="choiceForm">
                        <input
                          className="input"
                          placeholder="Choice text"
                          value={drafts[n.id]?.text || ""}
                          onChange={(e) => changeDraft(n.id, "text", e.target.value)}
                        />
                        <select
                          className="input"
                          value={drafts[n.id]?.targetNodeId || ""}
                          onChange={(e) => changeDraft(n.id, "targetNodeId", e.target.value)}
                        >
                          <option value="">Target node...</option>
                          {nodes
                            .filter((candidate) => candidate.id !== n.id)
                            .map((candidate) => (
                              <option key={candidate.id} value={candidate.id}>
                                Node #{candidate.id}
                              </option>
                            ))}
                        </select>
                        <button className="btn btnPrimary btnTiny" onClick={() => addChoice(n)}>
                          Add Choice
                        </button>
                      </div>
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
