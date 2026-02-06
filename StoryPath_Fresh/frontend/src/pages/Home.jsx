import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="container">
      <section className="hero">
        <div className="heroLeft">
          <div className="kicker">JEDI-STYLE STORY EXPERIENCE</div>
          <h1 className="heroTitle">
            Build branching stories.
            <span className="accent"> Play them like a game.</span>
          </h1>
          <p className="heroText">
            Create stories, add nodes & choices, and let players explore multiple outcomes —
            with a cinematic UI inspired by modern action-adventure games.
          </p>

          <div className="heroActions">
            <Link className="btn btnPrimary" to="/stories">Explore Stories</Link>
            {user ? (
              <Link className="btn btnGhost" to="/dashboard">Go to Dashboard</Link>
            ) : (
              <Link className="btn btnGhost" to="/login">Login to Create</Link>
            )}
          </div>

          <div className="heroStats">
            <div className="statCard">
              <div className="statTop">Flow</div>
              <div className="statValue">Nodes</div>
              <div className="statSub">Build story paths</div>
            </div>
            <div className="statCard">
              <div className="statTop">Choice</div>
              <div className="statValue">Routes</div>
              <div className="statSub">Multiple endings</div>
            </div>
            <div className="statCard">
              <div className="statTop">Play</div>
              <div className="statValue">Mode</div>
              <div className="statSub">Cinematic reading</div>
            </div>
          </div>
        </div>

        <div className="heroRight">
          <div className="holoPanel">
            <div className="holoHeader">
              <div className="holoTitle">Mission Panel</div>
              <div className="holoBadge">LIVE</div>
            </div>
            <div className="holoBody">
              <div className="holoLine">
                <span className="dot dotBlue" />
                <span>Register / Login</span>
              </div>
              <div className="holoLine">
                <span className="dot dotCyan" />
                <span>Create Story (Protected)</span>
              </div>
              <div className="holoLine">
                <span className="dot dotAmber" />
                <span>Edit Nodes → Add choices</span>
              </div>
              <div className="holoLine">
                <span className="dot dotRed" />
                <span>Play story from start</span>
              </div>
              <div className="divider" />
              <div className="holoHint">
                Tip: Keep nodes short. Choices should feel like “next move”.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid2">
        <div className="panel animIn">
          <h2 className="panelTitle">Public Stories</h2>
          <p className="panelText">Anyone can browse & play stories from the list.</p>
          <Link className="btn btnGhost" to="/stories">Open Public List</Link>
        </div>

        <div className="panel animIn delay1">
          <h2 className="panelTitle">Creator Dashboard</h2>
          <p className="panelText">Logged-in users can create stories and manage nodes.</p>
          <Link className="btn btnPrimary" to={user ? "/dashboard" : "/login"}>
            {user ? "Open Dashboard" : "Login First"}
          </Link>
        </div>
      </section>
    </div>
  );
}
