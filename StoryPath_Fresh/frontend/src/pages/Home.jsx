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
      <section className="crawlScene animIn">
        <div className="crawlStars" aria-hidden="true" />
        <div className="crawlTitleWrap">
          <div className="crawlOverline">A long time ago in a distant digital galaxy...</div>
          <div className="crawlLogo">STORYPATH</div>
          <div className="crawlSubLogo">INTERACTIVE SAGA COMMAND</div>
        </div>
        <div className="crawlPerspective" aria-hidden="true">
          <div className="crawlText">
            Citizens of the fleet, your mission begins now. Build branching campaigns,
            command story nodes, and send players across dangerous sectors where every
            decision changes fate. The archive is open. The command deck is online.
            Choose your path between order and chaos.
          </div>
        </div>
      </section>

      {/* HERO */}
      <section className="hero animIn">
        <div className="heroLeft">
          <div className="kicker">GALACTIC SAGA EXPERIENCE</div>

          <h1 className="heroTitle">
            Command living storylines.
            <span className="accent"> Navigate destiny among the stars.</span>
          </h1>

          <p className="heroText">
            StoryPath is an interactive storytelling platform where creators
            design branching adventures and players explore different outcomes.
            Build story nodes, connect meaningful choices, and turn reading into
            a cinematic mission log inside a vast galactic frontier.
          </p>

          <div className="heroActions">
            <Link className="btn btnPrimary" to="/stories">
              Enter Star Archive
            </Link>

            {user ? (
              <Link className="btn btnGhost" to="/dashboard">
                Open Mission Bay
              </Link>
            ) : (
              <Link className="btn btnGhost" to="/login">
                Enter to Create
              </Link>
            )}
          </div>

          <div className="heroStats">
            <div className="statCard">
              <div className="statTop">Flow</div>
              <div className="statValue">Mission Nodes</div>
              <div className="statSub">
                Build connected sectors and branching routes
              </div>
            </div>

            <div className="statCard">
              <div className="statTop">Choice</div>
              <div className="statValue">Starlane Routes</div>
              <div className="statSub">
                Trigger alternate outcomes and final transmissions
              </div>
            </div>

            <div className="statCard">
              <div className="statTop">Play</div>
              <div className="statValue">Bridge Simulation</div>
              <div className="statSub">
                Experience stories like tactical deep-space operations
              </div>
            </div>
          </div>
        </div>

        <div className="heroRight">
          <div className="holoPanel">
            <div className="holoHeader">
              <div className="holoTitle">Bridge Console</div>
              <div className="holoBadge">ONLINE</div>
            </div>

            <div className="holoBody">
              <div className="holoLine">
                <span className="dot dotBlue" />
                <span>Join the fleet to unlock command permissions</span>
              </div>

              <div className="holoLine">
                <span className="dot dotCyan" />
                <span>Draft and manage your own saga campaigns</span>
              </div>

              <div className="holoLine">
                <span className="dot dotAmber" />
                <span>Link mission nodes, choices, and branching starlanes</span>
              </div>

              <div className="holoLine">
                <span className="dot dotRed" />
                <span>Deploy every campaign from its launch node</span>
              </div>

              <div className="divider" />

              <div className="holoHint">
                Tip: Keep story nodes short, clear, and immersive. The best
                choices should feel like a commander's next decisive maneuver.
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
              <h2 className="panelTitle">Public Star Archive</h2>
              <p className="panelText">
                Any traveler can scan and play published campaigns.
              </p>
            </div>
          </div>

          <Link className="btn btnGhost" to="/stories">
            Open Archive
          </Link>
        </div>

        <div className="panel animIn delay1">
          <div className="panelHeader">
            <div>
              <div className="kicker">Creator Access</div>
              <h2 className="panelTitle">Commander Mission Bay</h2>
              <p className="panelText">
                Authorized commanders can create campaigns, manage nodes, and
                shape branching operations.
              </p>
            </div>
          </div>

          <Link className="btn btnPrimary" to={user ? "/dashboard" : "/login"}>
            {user ? "Open Mission Bay" : "Enter Console"}
          </Link>
        </div>
      </section>

      {/* FEATURED STORIES */}
      <section className="panel animIn" style={{ marginTop: "18px" }}>
        <div className="panelHeader">
          <div>
            <div className="kicker">Featured Content</div>
            <h2 className="panelBigTitle">Explore galactic campaigns</h2>
            <p className="panelText">
              Discover immersive public campaigns designed to show the full
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
                  View Star Archive
                </Link>
                <Link
                  className="btn btnPrimary"
                  to={user ? "/dashboard" : "/login"}
                >
                  {user ? "Launch New Campaign" : "Enter to Create"}
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
              <h2 className="panelTitle">For explorers</h2>
            </div>
          </div>

          <div className="subPanel">
            <div className="holoLine">
              <span className="dot dotBlue" />
              <span>Browse campaigns from the public archive</span>
            </div>
            <div className="holoLine">
              <span className="dot dotCyan" />
              <span>Read each transmission and choose your next maneuver</span>
            </div>
            <div className="holoLine">
              <span className="dot dotAmber" />
              <span>Unlock alternate routes and endgame outcomes</span>
            </div>
            <div className="holoLine">
              <span className="dot dotRed" />
              <span>Replay operations to discover hidden paths</span>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panelHeader">
            <div>
              <div className="kicker">Creator System</div>
              <h2 className="panelTitle">For commanders</h2>
            </div>
          </div>

          <div className="subPanel">
            <div className="holoLine">
              <span className="dot dotBlue" />
              <span>Create a campaign with codename and briefing</span>
            </div>
            <div className="holoLine">
              <span className="dot dotCyan" />
              <span>Add nodes and connect choices between sectors</span>
            </div>
            <div className="holoLine">
              <span className="dot dotAmber" />
              <span>Manage mission flow from your command deck</span>
            </div>
            <div className="holoLine">
              <span className="dot dotRed" />
              <span>Publish campaigns for the fleet to explore</span>
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
              cinematic command interface to make interactive campaigns more
              engaging for both commanders and explorers.
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
              Campaigns are built with multiple branches so each explorer can
              travel a different route through the same galactic timeline.
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
              Commanders can organize sectors, tune mission links, and expand
              campaigns one decision at a time.
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
              Public campaigns make it easy for travelers to discover missions
              and for commanders to share their saga with the fleet.
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
              A premium bridge-style presentation gives StoryPath a stronger
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
          Enter the StoryPath galaxy and start building living campaigns,
          publishing public operations, and exploring worlds where every
          decision redirects the stars.
        </div>

        <div className="choiceList">
          <Link className="btn btnPrimary choiceBtn" to={user ? "/dashboard" : "/login"}>
            {user ? "Launch Mission Bay" : "Enter to Begin"}
          </Link>

          <Link className="btn btnGhost choiceBtn" to="/stories">
            Browse Star Archive
          </Link>
        </div>

        <div className="footNote">
          Command. Explore. Choose your route.
        </div>
      </section>
    </div>
  );
}