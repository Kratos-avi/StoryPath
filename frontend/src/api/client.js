import axios from "axios";

function normalizeApiBaseUrl(value) {
  const trimmed = String(value || "").trim();

  if (!trimmed) return "";
  if (trimmed.endsWith("/api")) return trimmed;
  return `${trimmed.replace(/\/$/, "")}/api`;
}

const runtimeDefaultBaseUrl =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : "https://storypath-backend.onrender.com/api";

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
