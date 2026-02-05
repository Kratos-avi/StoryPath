import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null
  );

  const [email, setEmail] = useState("avinash@test.com");
  const [password, setPassword] = useState("123456");

  const [stories, setStories] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [msg, setMsg] = useState("");

  async function fetchStories() {
    setMsg("");
    try {
      const res = await fetch(`${API}/api/stories`);
      const data = await res.json();
      setStories(Array.isArray(data) ? data : []);
    } catch (err) {
      setMsg("Failed to load stories.");
    }
  }

  useEffect(() => {
    fetchStories();
  }, []);

  async function login() {
    setMsg("");
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
      setMsg("Login successful ✅");
    } catch (err) {
      setMsg("Login error.");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    setMsg("Logged out.");
  }

  async function createStory() {
    setMsg("");

    if (!token) {
      setMsg("Login required to create story.");
      return;
    }

    if (!title.trim()) {
      setMsg("Title is required.");
      return;
    }

    try {
      const res = await fetch(`${API}/api/stories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg(data?.message || "Create failed");
        return;
      }

      setTitle("");
      setDescription("");
      setMsg("Story created ✅");
      fetchStories();
    } catch (err) {
      setMsg("Create error.");
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", fontFamily: "Arial" }}>
      <h1>StoryPath (React Frontend)</h1>

      {msg && (
        <div style={{ padding: 10, background: "#f2f2f2", marginBottom: 15 }}>
          {msg}
        </div>
      )}

      <div
        style={{
          border: "1px solid #ddd",
          padding: 15,
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <h2>Login</h2>

        {user ? (
          <>
            <p>
              Logged in as: <b>{user.name}</b> ({user.email})
            </p>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                style={{ padding: 8, width: 260 }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
              />
              <input
                style={{ padding: 8, width: 260 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                type="password"
              />
              <button onClick={login}>Login</button>
            </div>
          </>
        )}
      </div>

      <div
        style={{
          border: "1px solid #ddd",
          padding: 15,
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <h2>Create Story (Protected)</h2>
        <input
          style={{ padding: 8, width: "100%", marginBottom: 10 }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Story title"
        />
        <textarea
          style={{ padding: 8, width: "100%", height: 80, marginBottom: 10 }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Story description"
        />
        <button onClick={createStory}>Create</button>
      </div>

      <div style={{ border: "1px solid #ddd", padding: 15, borderRadius: 8 }}>
        <h2>Stories (Public List)</h2>
        <button onClick={fetchStories} style={{ marginBottom: 10 }}>
          Refresh
        </button>

        {stories.length === 0 ? (
          <p>No stories yet.</p>
        ) : (
          <ul>
            {stories.map((s) => (
              <li key={s.id} style={{ marginBottom: 10 }}>
                <b>{s.title}</b>
                <div style={{ color: "#555" }}>
                  {s.description || "(no description)"}
                </div>
                <div style={{ fontSize: 12, color: "#888" }}>
                  id: {s.id} • createdAt: {s.createdAt}
                  {s.user ? ` • by: ${s.user.name}` : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
