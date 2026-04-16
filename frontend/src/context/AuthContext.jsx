import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, name, email }
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
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
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      console.log("[Auth] Login response:", { status: res.status, data: res.data });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      return { ok: true };
    } catch (e) {
      console.error("[Auth] Login error:", { status: e?.response?.status, data: e?.response?.data, message: e.message });
      const msg = e?.response?.data?.message || "Login failed";
      return { ok: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", { name, email, password });
      console.log("[Auth] Register response:", { status: res.status, data: res.data });
      if (!res.data?.token || !res.data?.user) {
        console.error("[Auth] Register response missing token or user:", res.data);
        return { ok: false, message: "Registration response missing token or user. Check browser console." };
      }
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      return { ok: true };
    } catch (e) {
      console.error("[Auth] Register error:", { status: e?.response?.status, data: e?.response?.data, message: e.message });
      const msg = e?.response?.data?.message || "Register failed";
      return { ok: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
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
