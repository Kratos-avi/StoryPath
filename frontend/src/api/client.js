import axios from "axios";

console.log("[API Client] Initializing with environment:", {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  MODE: import.meta.env.MODE,
  origin: window.location.origin,
});

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
    console.log("[API Client] Using environment URL:", envUrl);
    return normalizeApiBaseUrl(envUrl);
  }

  // For unified deployment (recommended): use same-origin /api
  const { origin, hostname } = window.location;
  
  // Local development
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    console.log("[API Client] Using localhost for development");
    return "http://localhost:5000/api";
  }

  // Production: same-origin is best (backend serves both frontend + API)
  console.log("[API Client] Using same-origin /api");
  return `${origin}/api`;
}

const apiBaseUrl = getApiBaseUrl();

console.log("[API Client] Final API base URL:", apiBaseUrl);

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS || 10000),
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Add JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`[API Client] ${config.method.toUpperCase()} ${config.url}`);
  return config;
});

// Response interceptor: Handle responses and errors
api.interceptors.response.use(
  (response) => {
    console.log(`[API Client] ✓ ${response.status} ${response.config.url}`);
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
      console.log("[API Client] Clearing auth token (401 Unauthorized)");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth:logout"));
    }

    return Promise.reject(error);
  }
);

export default api;
