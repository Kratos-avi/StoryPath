import axios from "axios";

console.log("[API Client] Environment variables:", {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  NODE_ENV: import.meta.env.MODE,
});

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

// Primary source: explicit environment variable configuration
const configuredBaseUrl = normalizeApiBaseUrl(
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL
);

// Fallback: runtime URL detection
const apiBaseCandidates = configuredBaseUrl
  ? [configuredBaseUrl]
  : getRuntimeCandidateBaseUrls();

console.log("[API Client] Initial candidates:", apiBaseCandidates);

let activeBaseUrlIndex = 0;
const getActiveBaseUrl = () => {
  const url = apiBaseCandidates[activeBaseUrlIndex] || "";
  console.log(`[API Client] Using base URL index ${activeBaseUrlIndex}: ${url}`);
  return url;
};

const apiBaseUrl = normalizeApiBaseUrl(
  getActiveBaseUrl()
);

console.log("[API Client] Final API base URL:", apiBaseUrl);

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS || 10000),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`[API Client] Request =>`, config.method.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`[API Client] Response ✓`, response.status, response.config.url);
    return response;
  },
  async (error) => {
    const config = error?.config;
    const status = error?.response?.status;
    const errorMessage = error?.response?.data?.message || error?.message;

    console.error(`[API Client] Error ✗`, {
      status,
      url: config?.url,
      message: errorMessage,
      corsError: error?.message?.includes("CORS"),
      networkError: !error?.response,
    });

    // Handle 401 Unauthorized - clear token and redirect
    if (status === 401) {
      console.log("[API Client] Clearing auth token due to 401");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Optional: dispatch auth event to trigger UI update
      window.dispatchEvent(new Event("auth:logout"));
    }

    // Retry with next candidate URL if current one failed (404/500/network error)
    // But only if we haven't already retried this request
    if (
      config &&
      !config.__retriedWithNextBase &&
      activeBaseUrlIndex < apiBaseCandidates.length - 1 &&
      (!error.response || error.response.status === 404 || error.response.status >= 500)
    ) {
      console.log(
        `[API Client] Retrying with next candidate (index ${activeBaseUrlIndex + 1}/${apiBaseCandidates.length - 1})`
      );
      activeBaseUrlIndex += 1;
      config.__retriedWithNextBase = true;
      config.baseURL = getActiveBaseUrl();
      return api.request(config);
    }

    return Promise.reject(error);
  }
);

export default api;
