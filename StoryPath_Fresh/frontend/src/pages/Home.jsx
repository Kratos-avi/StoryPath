/**
 * Home / Landing Page
 *
 * Marketing and entry point for the application.
 * Introduces StoryPath features and adapts call-to-action links
 * based on user authentication state.
 */

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Home Component
 * Displays hero section, feature overview, and quick start guide
 */
export default function Home() {
  const { user } = useAuth();

  const featuredStories = [
    {
      id: 1,
      title: "The Fallen Planet",
      author: "Public Archive",
      desc: "A stranded pilot wakes on a shattered moon where each decision changes the fate of the last surviving colony.",
      status: "Featured",
    },
    {
      id: 2,
      title: "Echoes of Steel",
      author: "Community Vault",
      desc: "A cinematic sci-fi mission through abandoned stations, hidden transmissions, and dangerous moral choices.",
      status: "Trending",
    },
    {
      id: 3,
      title: "Shadow Protocol",
      author: "Open Campaign",
      desc: "Lead a covert operation where alliances shift, secrets unfold, and every path leads to a different ending.",
      status: "New",
    },
  ];

  return (
    <div className="container">
      {/* HERO */}
      <section className="hero animIn">
        <div className="heroLeft">
          <div className="kicker">JEDI-STYLE STORY EXPERIENCE</div>

          <h1 className="heroTitle">
            Build branching stories.
            <span className="accent"> Play them like a game.</span>
          </h1>

          <p className="heroText">
            StoryPath is an interactive storytelling platform where creators
            design branching adventures and players explore different outcomes.
            Build story nodes, connect meaningful choices, and turn reading into
            a cinematic experience inspired by modern action-adventure games.
          </p>

          <div className="heroActions">
            <Link className="btn btnPrimary" to="/stories">
              Explore Stories
            </Link>

            {user ? (
              <Link className="btn btnGhost" to="/dashboard">
                Go to Dashboard
              </Link>
            ) : (
              <Link className="btn btnGhost" to="/login">
                Login to Create
              </Link>
            )}
          </div>

          <div className="heroStats">
            <div className="statCard">
              <div className="statTop">Flow</div>
              <div className="statValue">Story Nodes</div>
              <div className="statSub">
                Build connected scenes and narrative paths
              </div>
            </div>

            <div className="statCard">
              <div className="statTop">Choice</div>
              <div className="statValue">Multiple Routes</div>
              <div className="statSub">
                Create different outcomes and endings
              </div>
            </div>

            <div className="statCard">
              <div className="statTop">Play</div>
              <div className="statValue">Cinematic Mode</div>
              <div className="statSub">
                Read and explore stories like interactive missions
              </div>
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
                <span>Register or login to unlock creator access</span>
              </div>

              <div className="holoLine">
                <span className="dot dotCyan" />
                <span>Create and manage your own stories</span>
              </div>

              <div className="holoLine">
                <span className="dot dotAmber" />
                <span>Add nodes, connect choices, and shape paths</span>
              </div>

              <div className="holoLine">
                <span className="dot dotRed" />
                <span>Play every story from the starting node</span>
              </div>

              <div className="divider" />

              <div className="holoHint">
                Tip: Keep story nodes short, clear, and immersive. The best
                choices feel like the player’s next move in a mission.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ACCESS */}
      <section className="grid2" style={{ marginTop: "18px" }}>
        <div className="panel animIn">
          <div className="panelHeader">
            <div>
              <div className="kicker">Public Access</div>
              <h2 className="panelTitle">Public Stories</h2>
              <p className="panelText">
                Anyone can browse and play published stories from the story list.
              </p>
            </div>
          </div>

          <Link className="btn btnGhost" to="/stories">
            Open Public List
          </Link>
        </div>

        <div className="panel animIn delay1">
          <div className="panelHeader">
            <div>
              <div className="kicker">Creator Access</div>
              <h2 className="panelTitle">Creator Dashboard</h2>
              <p className="panelText">
                Logged-in users can create stories, manage nodes, and build
                branching adventures.
              </p>
            </div>
          </div>

          <Link className="btn btnPrimary" to={user ? "/dashboard" : "/login"}>
            {user ? "Open Dashboard" : "Login First"}
          </Link>
        </div>
      </section>

      {/* FEATURED STORIES */}
      <section className="panel animIn" style={{ marginTop: "18px" }}>
        <div className="panelHeader">
          <div>
            <div className="kicker">Featured Content</div>
            <h2 className="panelBigTitle">Explore story missions</h2>
            <p className="panelText">
              Discover immersive public stories designed to show the full
              StoryPath experience.
            </p>
          </div>
          <div className="badge">Featured</div>
        </div>

        <div className="cards">
          {featuredStories.map((story) => (
            <div className="storyCard" key={story.id}>
              <div className="storyTop">
                <div>
                  <h3 className="storyTitle">{story.title}</h3>
                  <div className="storyMeta">By {story.author}</div>
                </div>

                <div className="chip small">
                  <span className="chipDot"></span>
                  {story.status}
                </div>
              </div>

              <p className="storyDesc">{story.desc}</p>

              <div className="storyActions">
                <Link className="btn btnGhost" to="/stories">
                  View Public Stories
                </Link>
                <Link
                  className="btn btnPrimary"
                  to={user ? "/dashboard" : "/login"}
                >
                  {user ? "Start Creating" : "Login to Create"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="grid2" style={{ marginTop: "18px" }}>
        <div className="panel">
          <div className="panelHeader">
            <div>
              <div className="kicker">How It Works</div>
              <h2 className="panelTitle">For players</h2>
            </div>
          </div>

          <div className="subPanel">
            <div className="holoLine">
              <span className="dot dotBlue" />
              <span>Browse public stories from the collection</span>
            </div>
            <div className="holoLine">
              <span className="dot dotCyan" />
              <span>Read scenes and choose your next move</span>
            </div>
            <div className="holoLine">
              <span className="dot dotAmber" />
              <span>Unlock different routes and endings</span>
            </div>
            <div className="holoLine">
              <span className="dot dotRed" />
              <span>Replay adventures to discover new outcomes</span>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panelHeader">
            <div>
              <div className="kicker">Creator System</div>
              <h2 className="panelTitle">For creators</h2>
            </div>
          </div>

          <div className="subPanel">
            <div className="holoLine">
              <span className="dot dotBlue" />
              <span>Create a story with title and description</span>
            </div>
            <div className="holoLine">
              <span className="dot dotCyan" />
              <span>Add nodes and connect choices between scenes</span>
            </div>
            <div className="holoLine">
              <span className="dot dotAmber" />
              <span>Manage story flow from your dashboard</span>
            </div>
            <div className="holoLine">
              <span className="dot dotRed" />
              <span>Publish adventures for others to explore</span>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM OVERVIEW */}
      <section className="panel" style={{ marginTop: "18px" }}>
        <div className="panelHeader">
          <div>
            <div className="kicker">Platform Overview</div>
            <h2 className="panelBigTitle">Why StoryPath stands out</h2>
            <p className="panelText">
              StoryPath combines interactive writing, branching structure, and a
              cinematic user interface to make storytelling more engaging for
              both creators and readers.
            </p>
          </div>
        </div>

        <div className="grid2">
          <div className="nodeCard">
            <div className="nodeTop">
              <strong className="strong">Branching Narrative Design</strong>
              <span className="chip small">
                <span className="chipDot"></span>
                Dynamic
              </span>
            </div>
            <div className="nodeText">
              Stories are built with multiple branches so each player can follow
              a different path through the same narrative universe.
            </div>
          </div>

          <div className="nodeCard">
            <div className="nodeTop">
              <strong className="strong">Creator-Friendly Workflow</strong>
              <span className="chip small">
                <span className="chipDot"></span>
                Flexible
              </span>
            </div>
            <div className="nodeText">
              Writers can organize scenes, manage connections, and expand their
              stories one choice at a time.
            </div>
          </div>

          <div className="nodeCard">
            <div className="nodeTop">
              <strong className="strong">Public Discovery</strong>
              <span className="chip small">
                <span className="chipDot"></span>
                Open
              </span>
            </div>
            <div className="nodeText">
              Public stories make it easy for readers to discover adventures and
              for creators to share their work with the community.
            </div>
          </div>

          <div className="nodeCard">
            <div className="nodeTop">
              <strong className="strong">Immersive Interface</strong>
              <span className="chip small">
                <span className="chipDot"></span>
                Cinematic
              </span>
            </div>
            <div className="nodeText">
              A premium game-inspired presentation gives StoryPath a stronger
              atmosphere than a standard story listing application.
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="playCard" style={{ marginTop: "18px" }}>
        <div className="playGlow"></div>

        <div className="kicker">Begin Your Journey</div>

        <div className="playText">
          Enter the StoryPath universe and start building interactive worlds,
          publishing public adventures, and exploring stories where every
          decision matters.
        </div>

        <div className="choiceList">
          <Link className="btn btnPrimary choiceBtn" to={user ? "/dashboard" : "/login"}>
            {user ? "Launch Dashboard" : "Login to Begin"}
          </Link>

          <Link className="btn btnGhost choiceBtn" to="/stories">
            Browse Public Stories
          </Link>
        </div>

        <div className="footNote">
          Create. Explore. Choose your path.
        </div>
      </section>
    </div>
  );
}