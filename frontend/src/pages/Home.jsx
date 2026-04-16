import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="container">
      <section className="hero">
        <div className="heroLeft">
          <div className="kicker">Structured Story Design</div>
          <h1 className="heroTitle">
            Design branching stories.
            <span className="accent"> Play every path.</span>
          </h1>
          <p className="heroText">
            StoryPath helps you build interactive narratives with a clear, modular workflow:
            define stories, connect nodes, and shape outcomes through meaningful choices.
          </p>

          <div className="heroActions">
            <Link className="btn btnPrimary" to="/stories">Explore Stories</Link>
            {user ? (
              <Link className="btn btnSecondary" to="/dashboard">Open Dashboard</Link>
            ) : (
              <Link className="btn btnGhost" to="/login">Login to Create</Link>
            )}
          </div>

          <div className="heroStats">
            <div className="statCard">
              <div className="statTop">Structure</div>
              <div className="statValue">Nodes</div>
              <div className="statSub">Build story routes</div>
            </div>
            <div className="statCard">
              <div className="statTop">Decision</div>
              <div className="statValue">Branches</div>
              <div className="statSub">Multiple outcomes</div>
            </div>
            <div className="statCard">
              <div className="statTop">Replay</div>
              <div className="statValue">Paths</div>
              <div className="statSub">Explore every ending</div>
            </div>
          </div>
        </div>

        <div className="heroRight">
          <div className="holoPanel">
            <div className="holoHeader">
              <div className="holoTitle">Workflow Overview</div>
              <div className="holoBadge">LIVE</div>
            </div>
            <div className="holoBody">
              <div className="holoLine">
                <span className="dot dotBlue" />
                <span>Register or Login</span>
              </div>
              <div className="holoLine">
                <span className="dot dotCyan" />
                <span>Create New Story</span>
              </div>
              <div className="holoLine">
                <span className="dot dotAmber" />
                <span>Link Nodes and Choices</span>
              </div>
              <div className="holoLine">
                <span className="dot dotRed" />
                <span>Play from Start Node</span>
              </div>
              <div className="divider" />
              <div className="holoHint">
                Tip: Keep each node concise so choices stay clear and easy to follow.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="homeBand animIn">
        <div className="homeBandHeader blue">
          <h2 className="panelTitle">Public Library</h2>
          <p className="panelText">Browse public stories and jump into play mode instantly.</p>
        </div>
        <div className="homeBandBody">
          <div className="grid2">
            <div className="subPanel">
              <h3 className="subTitle">Read and Play</h3>
              <p className="panelText">
                Public stories are visible to everyone. Start from the first node and explore every route.
              </p>
              <Link className="btn btnYellow" to="/stories">Open Stories</Link>
            </div>

            <div className="subPanel">
              <h3 className="subTitle">Create and Manage</h3>
              <p className="panelText">
                Use the dashboard to create new stories and keep improving your node structure.
              </p>
              <Link className="btn btnPrimary" to={user ? "/dashboard" : "/register"}>
                {user ? "Open Dashboard" : "Register to Start"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="homeBand animIn delay1">
        <div className="homeBandHeader red">
          <h2 className="panelTitle">Workflow</h2>
          <p className="panelText">Build path by path with a clear narrative workflow.</p>
        </div>
        <div className="homeBandBody">
          <div className="grid2">
            <div className="subPanel">
              <h3 className="subTitle">01. Define Story</h3>
              <p className="panelText">Create a clear title and short description from your dashboard.</p>
            </div>
            <div className="subPanel">
              <h3 className="subTitle">02. Add Nodes</h3>
              <p className="panelText">Write node content and assign exactly one start node.</p>
            </div>
            <div className="subPanel">
              <h3 className="subTitle">03. Link Branches</h3>
              <p className="panelText">Connect nodes with choices so each route carries real consequences.</p>
            </div>
            <div className="subPanel">
              <h3 className="subTitle">04. Playtest</h3>
              <p className="panelText">Run the story from start and verify pacing, clarity, and flow.</p>
            </div>
          </div>

          <div className="ctaRow">
            <Link className="btn btnYellow" to={user ? "/dashboard" : "/login"}>
              {user ? "Continue Building" : "Login to Build"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
