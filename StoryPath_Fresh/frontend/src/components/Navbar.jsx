/**
 * Navigation Bar Component
 * 
 * Header navigation displayed on all pages.
 * Shows different links based on authentication state:
 * - Authenticated: Dashboard, Logout, User profile chip
 * - Unauthenticated: Login, Register links
 * 
 * Features:
 * - Brand/logo with app title
 * - Active route highlighting for current page
 * - Responsive navigation items
 */

import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Navbar Component
 * Displays header with brand and navigation, adapting to authentication state
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  /**
   * Helper function to determine if a route is currently active
   * Adds 'active' CSS class to active link for visual highlighting
   */
  const isActive = (path) => (pathname === path ? "navLink active" : "navLink");

  return (
    <header className="navBar">
      <div className="navInner">
        {/* App brand/logo section with title */}
        <Link to="/" className="brand">
          <span className="brandMark" />
          <div className="brandText">
            <div className="brandTitle">STORYPATH</div>
            <div className="brandSub">Interactive Story Builder</div>
          </div>
        </Link>

        {/* Navigation links section */}
        <nav className="navRight">
          {/* Public navigation links - visible to all users */}
          <Link className={isActive("/")} to="/">Home</Link>
          <Link className={isActive("/stories")} to="/stories">Stories</Link>

          {/* Conditional navigation based on authentication state */}
          {user ? (
            <>
              {/* Dashboard link for authenticated creators */}
              <Link className={isActive("/dashboard")} to="/dashboard">Dashboard</Link>
              
              {/* User profile chip displaying current user's name */}
              <div className="chip">
                <span className="chipDot" />
                {user.name}
              </div>
              
              {/* Logout button for authenticated users */}
              <button className="btn btnGhost" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              {/* Login and Register links for unauthenticated users */}
              <Link className={isActive("/login")} to="/login">Login</Link>
              <Link className="btn btnPrimary" to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
      {/* Decorative glow effect element */}
      <div className="navGlow" />
    </header>
  );
}
