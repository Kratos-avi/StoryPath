import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Stories from "./pages/Stories.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PlayStory from "./pages/PlayStory.jsx";
import EditStoryNodes from "./pages/EditStoryNodes.jsx";

// App defines the public pages plus the auth-protected dashboard and editor routes.
export default function App() {
  return (
    <div className="appRoot">
      <Navbar />
      <div className="pageWrap">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/stories/:id/play" element={<PlayStory />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes (authentication required) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/stories/:id/edit"
            element={
              <ProtectedRoute>
                <EditStoryNodes />
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      <footer className="siteFooter">
        <div className="footerInner">
          <div className="footerBrand">StoryPath Studio Edition</div>
          <div className="footerText">Design branching narratives with clear structure.</div>
        </div>
      </footer>
    </div>
  );
}
