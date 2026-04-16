import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

// ProtectedRoute blocks access until auth state is known and redirects unauthenticated users.
export default function ProtectedRoute({ children }) {
  const { user, initializing } = useAuth();

  if (initializing) {
    // Show a simple loading state while the saved session is being restored.
    return (
      <div className="container">
        <div className="panel">Checking session...</div>
      </div>
    );
  }

  // If no user exists, force a login before the protected page renders.
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
