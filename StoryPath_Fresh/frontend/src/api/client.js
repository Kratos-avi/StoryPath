/**
 * API Client - Axios Configuration
 * 
 * Centralized HTTP client for all API requests with:
 * - Automatic JWT token attachment to Authorization headers
 * - Base URL normalization from environment variables
 * - Automatic token cleanup on 401 (Unauthorized) responses
 * 
 * Environment Variables:
 * - VITE_API_URL: Backend API URL (e.g., http://localhost:5000)
 */

import axios from "axios";

// ============= BASE URL CONFIGURATION =============

// Read API URL from environment, trim whitespace
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

// Normalize base URL: remove trailing slashes
const normalizedBase = configuredApiUrl
  ? configuredApiUrl.replace(/\/+$/, "")
  : "http://localhost:5000";

// Ensure API URL ends with /api suffix (required by backend)
const apiBaseUrl = normalizedBase.endsWith("/api")
  ? normalizedBase
  : `${normalizedBase}/api`;

// Create axios instance with configured base URL
const api = axios.create({
  baseURL: apiBaseUrl,
});

// ============= REQUEST INTERCEPTOR =============

/**
 * Attach JWT token to every request
 * Reads token from localStorage and adds it to Authorization header
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  
  // Only attach token if it exists and is valid (not "undefined" or "null" strings)
  if (token && token !== "undefined" && token !== "null") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// ============= RESPONSE INTERCEPTOR =============

/**
 * Handle 401 (Unauthorized) responses by clearing stale credentials
 * Prevents infinite retry loops with expired tokens
 */
api.interceptors.response.use(
  // Success response - pass through unchanged
  (response) => response,
  
  // Error response - handle 401 by clearing auth data
  (error) => {
    if (error?.response?.status === 401) {
      // Clear invalid/expired token and user data from storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export default api;
