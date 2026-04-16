import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/useAuth";

// Navbar shows public links, auth links, and a responsive mobile menu.
export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Highlight the current route so navigation feels obvious.
  const isActive = (path) => (pathname === path ? "navLink active" : "navLink");

  // Close the menu after navigation on small screens.
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="navBar">
      <div className="navInner">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brandMark" aria-hidden="true">
            <span className="markCircle" />
            <span className="markSquare" />
            <span className="markTriangle" />
          </span>
          <div className="brandText">
            <div className="brandTitle">STORYPATH</div>
            <div className="brandSub">Interactive Story Studio</div>
          </div>
        </Link>

        <button
          className="btn navToggle"
          type="button"
          aria-label="Toggle menu"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          Menu
        </button>

        <nav className={`navRight ${isOpen ? "open" : ""}`}>
          <Link className={isActive("/")} to="/" onClick={closeMenu}>Home</Link>
          <Link className={isActive("/stories")} to="/stories" onClick={closeMenu}>Stories</Link>

          {user ? (
            <>
              <Link className={isActive("/dashboard")} to="/dashboard" onClick={closeMenu}>Dashboard</Link>
              <div className="chip">
                <span className="chipDot" />
                {user.name}
              </div>
              <button className="btn btnGhost" onClick={() => { closeMenu(); logout(); }}>Logout</button>
            </>
          ) : (
            <>
              <Link className={isActive("/login")} to="/login" onClick={closeMenu}>Login</Link>
              <Link className="btn btnPrimary" to="/register" onClick={closeMenu}>Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
