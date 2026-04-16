import axios from "axios";

// Axios wrapper keeps API URL resolution, auth headers, and error handling in one place.
/**
 * Normalize API base URL - ensure it ends with /api but not //api
 */
function normalizeApiBaseUrl(value) {
  const trimmed = String(value || "").trim();

  if (!trimmed) return "";

  // If already ends with /api or /api/, normalize to just /api
  if (/\/api\/?$/i.test(trimmed)) {
    return trimmed.replace(/\/+$/, "");
  }

  // Add /api suffix
  return `${trimmed.replace(/\/+$/, "")}/api`;
}

/**
 * Get API base URL with intelligent fallback strategy
 * Priority:
 * 1. Environment variable (VITE_API_URL)
 * 2. Same-origin /api (best for unified deployment)
 * 3. Localhost for local dev
 * 4. Render service names as last resort
 */
function getApiBaseUrl() {
  // If explicitly configured via environment, use it
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (envUrl) {
    return normalizeApiBaseUrl(envUrl);
  }

  // For unified deployment (recommended): use same-origin /api
  const { origin, hostname } = window.location;
  
  // Local development
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5000/api";
  }

  // Production: same-origin is best (backend serves both frontend + API)
  return `${origin}/api`;
}

const apiBaseUrl = getApiBaseUrl();

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS || 10000),
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach the JWT token automatically when the user is signed in.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: keep API errors centralized and clear the session on 401.
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url;
    const message = error?.response?.data?.message || error?.message;

    console.error(`[API Client] ✗ Error:`, {
      status,
      url,
      message,
      type: !error?.response ? "Network Error" : `HTTP ${status}`,
    });

    // Handle 401 Unauthorized - clear auth and redirect
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth:logout"));
    }

    return Promise.reject(error);
  }
);

export default api;
