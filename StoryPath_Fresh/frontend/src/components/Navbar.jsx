import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  const isActive = (path) => (pathname === path ? "navLink active" : "navLink");

  return (
    <header className="navBar">
      <div className="navInner">
        <Link to="/" className="brand">
          <span className="brandMark" />
          <div className="brandText">
            <div className="brandTitle">STORYPATH</div>
            <div className="brandSub">Interactive Story Builder</div>
          </div>
        </Link>

        <nav className="navRight">
          <Link className={isActive("/")} to="/">Home</Link>
          <Link className={isActive("/stories")} to="/stories">Stories</Link>

          {user ? (
            <>
              <Link className={isActive("/dashboard")} to="/dashboard">Dashboard</Link>
              <div className="chip">
                <span className="chipDot" />
                {user.name}
              </div>
              <button className="btn btnGhost" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link className={isActive("/login")} to="/login">Login</Link>
              <Link className="btn btnPrimary" to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
      <div className="navGlow" />
    </header>
  );
}
