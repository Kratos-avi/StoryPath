/**
 * StoryPath Frontend Entry Point
 * 
 * Initializes the React application with:
 * - React Router for page navigation
 * - Authentication context provider for managing user state
 * - Main stylesheet for application styling
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./styles.css";

// Render React app with providers and root setup
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Enable client-side routing with BrowserRouter */}
    <BrowserRouter>
      {/* Provide authentication context to entire app */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
