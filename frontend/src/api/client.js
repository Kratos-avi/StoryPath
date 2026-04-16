import axios from "axios";

function normalizeApiBaseUrl(value) {
  const trimmed = String(value || "").trim();

  if (!trimmed) return "";

  // Accept both .../api and .../api/ without duplicating the segment.
  if (/\/api\/?$/i.test(trimmed)) {
    return trimmed.replace(/\/+$/, "");
  }

  return `${trimmed.replace(/\/+$/, "")}/api`;
}

function getRuntimeDefaultBaseUrl() {
  const { hostname, origin } = window.location;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

  if (isLocalhost) return "http://localhost:5000/api";

  // If frontend is on a separate Render static service, default to backend web service.
  if (hostname.endsWith(".onrender.com") && hostname !== "storypath-app.onrender.com") {
    return "https://storypath-app.onrender.com/api";
  }

  // Same-origin API works when frontend is served by backend web service.
  return `${origin}/api`;
}

const runtimeDefaultBaseUrl = getRuntimeDefaultBaseUrl();

const apiBaseUrl = normalizeApiBaseUrl(
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  runtimeDefaultBaseUrl
);

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS || 10000),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export default api;
