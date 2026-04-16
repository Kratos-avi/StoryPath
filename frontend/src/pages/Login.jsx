import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

// Login page sends credentials to the auth context and redirects after success.
export default function Login() {
  const nav = useNavigate();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Submit the form and hand off session creation to the auth provider.
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await login(email, password);
    if (!res.ok) return setError(res.message);
    nav("/dashboard");
  };

  return (
    <div className="container">
      <div className="centerWrap">
        <div className="panel wide animIn">
          <div className="panelHeader">
            <div>
              <div className="kicker">ACCESS PORTAL</div>
              <h1 className="panelBigTitle">Login</h1>
              <p className="panelText">Sign in to access your story creator tools.</p>
            </div>
            <div className="badge">SECURE</div>
          </div>

          {error ? <div className="alert error">{error}</div> : null}

          <form onSubmit={onSubmit} className="form">
            <div className="field">
              <label>Email</label>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="rowBtns">
              <button className="btn btnPrimary" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
              <Link className="btn btnGhost" to="/register">Create account</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
