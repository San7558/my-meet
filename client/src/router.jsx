// src/router.jsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SessionPage from "./pages/SessionPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import { SessionProvider } from "./context/SessionContext";

const AppRouter = () => {
  const location = useLocation();
  console.log("[Router] Current path:", location.pathname, "| state:", location.state);
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/session"
        element={
          <ProtectedRoute>
            <SessionProvider>
              <SessionPage />
            </SessionProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRouter;
