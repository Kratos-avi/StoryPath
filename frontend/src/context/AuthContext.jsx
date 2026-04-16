import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { AuthContext } from "./auth-context";

// AuthProvider stores the current user, session state, and login/register actions.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, name, email }
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Restore the last saved user session from localStorage after refresh.
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setInitializing(false);
    }
  }, []);

  const login = async (email, password) => {
    // Login stores the JWT and user profile when the backend accepts the credentials.
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      return { ok: true };
    } catch (e) {
      const msg = e?.response?.data?.message || "Login failed";
      return { ok: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    // Register follows the same session flow as login so the new user lands signed in.
    setLoading(true);
    try {
      const res = await api.post("/auth/register", { name, email, password });
      if (!res.data?.token || !res.data?.user) {
        return { ok: false, message: "Registration response missing token or user." };
      }
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      return { ok: true };
    } catch (e) {
      const msg = e?.response?.data?.message || "Register failed";
      return { ok: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear both session tokens so the UI and backend stay in sync.
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, initializing, login, register, logout }),
    [user, loading, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
