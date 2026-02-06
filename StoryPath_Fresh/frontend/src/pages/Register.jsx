import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const nav = useNavigate();
  const { register, loading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await register(name, email, password);
    if (!res.ok) return setError(res.message);
    nav("/dashboard");
  };

  return (
    <div className="container">
      <div className="centerWrap">
        <div className="panel wide animIn">
          <div className="panelHeader">
            <div>
              <div className="kicker">NEW OPERATIVE</div>
              <h1 className="panelBigTitle">Register</h1>
              <p className="panelText">Create your account to build stories & nodes.</p>
            </div>
            <div className="badge">INIT</div>
          </div>

          {error ? <div className="alert error">{error}</div> : null}

          <form onSubmit={onSubmit} className="form">
            <div className="field">
              <label>Name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

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
                {loading ? "Creating..." : "Create Account"}
              </button>
              <Link className="btn btnGhost" to="/login">Already have account</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
