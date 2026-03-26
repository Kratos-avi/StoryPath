/**
 * StoryPath Main Application Component
 * 
 * Defines the core application structure and routing:
 * - Navigation bar header
 * - Route definitions for all pages
 * - Protected routes that require authentication
 * - Public routes accessible to all users
 */

import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Page imports
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Stories from "./pages/Stories.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PlayStory from "./pages/PlayStory.jsx";
import EditStoryNodes from "./pages/EditStoryNodes.jsx";

/**
 * Main App Component
 * 
 * Renders navigation and routes all pages.
 * Routes are organized as:
 * - Public routes: Home, Stories, Login, Register, PlayStory, UserProfile
 * - Protected routes: Dashboard, EditStoryNodes (require authentication)
 * - Catch-all: Redirects unknown routes to home
 */
export default function App() {
  return (
    <div className="appRoot">
      {/* Navigation bar displayed on all pages */}
      <Navbar />
      <div className="pageWrap">
        <Routes>
          {/* ========== PUBLIC ROUTES ========== */}

          {/* Home/Landing page */}
          <Route path="/" element={<Home />} />

          {/* Public stories browsing and discovery */}
          <Route path="/stories" element={<Stories />} />

          {/* Public story playback */}
          <Route path="/stories/:id/play" element={<PlayStory />} />

          {/* Public user profile viewing */}
          <Route path="/users/:userId/profile" element={<UserProfile />} />

          {/* ========== AUTHENTICATION ROUTES ========== */}

          {/* User login page */}
          <Route path="/login" element={<Login />} />

          {/* User registration page */}
          <Route path="/register" element={<Register />} />

          {/* ========== PROTECTED ROUTES (Authentication Required) ========== */}

          {/* Creator dashboard - create and manage stories */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Story editor - add and edit nodes (story pages) */}
          <Route
            path="/stories/:id/edit"
            element={
              <ProtectedRoute>
                <EditStoryNodes />
              </ProtectedRoute>
            }
          />

          {/* ========== CATCH-ALL ROUTE ========== */}

          {/* Redirect unknown routes to home page */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}
