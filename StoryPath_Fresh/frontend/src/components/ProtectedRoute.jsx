/**
 * Protected Route Component
 * 
 * Wraps routes that require user authentication.
 * Redirects unauthenticated users to login page.
 * Waits for auth initialization to prevent flickering redirects.
 * 
 * Usage:
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute Component
 * 
 * Renders children if user is authenticated, otherwise redirects to login.
 * Returns null while auth state is initializing to prevent flicker.
 */
export default function ProtectedRoute({ children }) {
  const { user, initialized } = useAuth();

  // Wait for auth hydration before redirecting to prevent UI flicker
  if (!initialized) return null;
  
  // Redirect to login if no authenticated user
  if (!user) return <Navigate to="/login" replace />;
  
  // Render protected content
  return children;
}
