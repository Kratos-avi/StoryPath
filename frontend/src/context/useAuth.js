import { useContext } from "react";
import { AuthContext } from "./auth-context";

// Small helper hook so components can read auth state without importing context directly.
export function useAuth() {
  return useContext(AuthContext);
}
