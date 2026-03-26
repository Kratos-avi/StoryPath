/**
 * Authentication Context & Provider
 * 
 * Global state management for user authentication.
 * Handles:
 * - User login/logout operations
 * - User registration
 * - Persistent auth state across page refreshes
 * - Loading and initialization states
 * 
 * Context provides: user, loading, initialized, login, register, logout
 */

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

// Create React Context for authentication
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * 
 * Wraps the entire application to provide authentication context.
 * Restores auth state from localStorage on mount.
 */
export function AuthProvider({ children }) {
  // State management
  const [user, setUser] = useState(null);              // Currently logged-in user
  const [loading, setLoading] = useState(false);       // Loading state for auth operations
  const [initialized, setInitialized] = useState(false); // Whether auth state is restored from storage

  // ============= INITIALIZATION =============

  /**
   * Restore authentication state from localStorage on component mount
   * Checks for valid token and matching user data
   */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const hasValidToken = token && token !== "undefined" && token !== "null";

    try {
      // Restore user if both token and user data exist
      if (storedUser && hasValidToken) {
        setUser(JSON.parse(storedUser));
      } 
      // Clear orphaned data (has one but not both)
      else if (storedUser || token) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    } catch {
      // Handle JSON parse errors by clearing corrupted data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      // Mark initialization complete (enables ProtectedRoute checks)
      setInitialized(true);
    }
  }, []);

  // ============= LOGIN =============

  /**
   * Login user with email and password
   * 
   * Params:
   * - email: User email address
   * - password: Plain text password
   * 
   * Returns: { ok: boolean, message?: string }
   * On success: Sets user and token in state and localStorage
   * On failure: Returns error message from API
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      
      // Store token and user data in localStorage for persistence
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      // Update auth state
      setUser(res.data.user);
      
      return { ok: true };
    } catch (e) {
      // Extract error message from API response
      const msg = e?.response?.data?.message || "Login failed";
      return { ok: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // ============= REGISTER =============

  /**
   * Register new user with name, email, and password
   * 
   * Params:
   * - name: User display name
   * - email: User email address
   * - password: Plain text password
   * 
   * Returns: { ok: boolean, message?: string }
   * On success: Sets user and token in state and localStorage
   * On failure: Returns error message from API
   */
  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", { name, email, password });
      
      // Store token and user data in localStorage for persistence
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      // Update auth state
      setUser(res.data.user);
      
      return { ok: true };
    } catch (e) {
      // Extract error message from API response
      const msg = e?.response?.data?.message || "Register failed";
      return { ok: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // ============= LOGOUT =============

  /**
   * Logout user and clear authentication state
   * Removes token and user data from localStorage and state
   */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // ============= CONTEXT VALUE =============

  /**
   * Memoize context value to prevent unnecessary re-renders
   * Dependencies: any state that should trigger context updates
   */
  const value = useMemo(
    () => ({ user, loading, initialized, login, register, logout }),
    [user, loading, initialized]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============= CUSTOM HOOK =============

/**
 * useAuth Hook
 * 
 * Custom hook to access authentication context
 * Usage: const { user, login, logout } = useAuth();
 * 
 * Throws error if used outside AuthProvider
 */
export function useAuth() {
  return useContext(AuthContext);
}
