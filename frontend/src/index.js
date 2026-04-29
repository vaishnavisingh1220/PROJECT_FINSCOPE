// src/index.js
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import AuthProvider from "./context/AuthContext";   // keep if you already created it
import KpiProvider from "./context/KpiContext";     // <-- ensures KpiContext exists
import "./index.css";

const root = createRoot(document.getElementById("root"));

root.render(
  <AuthProvider>
    <KpiProvider>
      <App />
    </KpiProvider>
  </AuthProvider>
);
