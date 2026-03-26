/**
 * User Login Page
 * 
 * Allows existing users to authenticate with email and password.
 * On successful login, redirects to creator dashboard.
 * Includes link to register for new users.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Login Component
 * Displays login form with email/password fields and error handling
 */
export default function Login() {
  const nav = useNavigate();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState("avinash@test.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

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
              <div className="kicker">STARPORT ACCESS</div>
              <h1 className="panelBigTitle">Enter Command Console</h1>
              <p className="panelText">Verify credentials to unlock commander features.</p>
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
                {loading ? "Authenticating..." : "Enter"}
              </button>
              <Link className="btn btnGhost" to="/register">Join Fleet</Link>
            </div>
          </form>

          <div className="footNote">
            <span className="muted">Demo:</span> avinash@test.com / password123
          </div>
        </div>
      </div>
    </div>
  );
}
