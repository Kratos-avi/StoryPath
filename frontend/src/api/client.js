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

function getRuntimeCandidateBaseUrls() {
  const { hostname, origin } = window.location;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
  const candidates = [];

  if (isLocalhost) {
    candidates.push("http://localhost:5000/api");
    return candidates;
  }

  // Same-origin API works when frontend is served by backend web service.
  candidates.push(`${origin}/api`);

  if (hostname.endsWith(".onrender.com")) {
    // Common service naming patterns used in this project/history.
    candidates.push("https://storypath-app.onrender.com/api");
    candidates.push("https://storypath-backend.onrender.com/api");

    if (hostname.includes("frontend")) {
      candidates.push(`https://${hostname.replace("frontend", "backend")}/api`);
      candidates.push(`https://${hostname.replace("frontend", "app")}/api`);
    }
  }

  return [...new Set(candidates.map(normalizeApiBaseUrl).filter(Boolean))];
}

const configuredBaseUrl = normalizeApiBaseUrl(
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL
);

const apiBaseCandidates = configuredBaseUrl
  ? [configuredBaseUrl]
  : getRuntimeCandidateBaseUrls();

let activeBaseUrlIndex = 0;
const getActiveBaseUrl = () => apiBaseCandidates[activeBaseUrlIndex] || "";

const apiBaseUrl = normalizeApiBaseUrl(
  getActiveBaseUrl()
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
  async (error) => {
    const config = error?.config;

    // Retry once against the next candidate when current host fails (404/network).
    if (
      config &&
      !config.__retriedWithNextBase &&
      activeBaseUrlIndex < apiBaseCandidates.length - 1 &&
      (!error.response || error.response.status === 404 || error.response.status >= 500)
    ) {
      activeBaseUrlIndex += 1;
      config.__retriedWithNextBase = true;
      config.baseURL = getActiveBaseUrl();
      return api.request(config);
    }

    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export default api;
