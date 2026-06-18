// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "../services/firebase";
import { saveUser } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // ── Verify only the four env vars actually used by firebase.js ──────────────
  useEffect(() => {
    const required = [
      "VITE_FIREBASE_API_KEY",
      "VITE_FIREBASE_AUTH_DOMAIN",
      "VITE_FIREBASE_PROJECT_ID",
      "VITE_FIREBASE_APP_ID",
    ];
    const missing = required.filter((k) => !import.meta.env[k]);
    if (missing.length) {
      const msg = `Missing Firebase env vars: ${missing.join(", ")}`;
      console.error(`[Auth] ${msg}`);
      console.error(
        "[Auth] Add the missing values to client/.env  " +
        "(copy client/.env.example and fill in your Firebase project settings)"
      );
      setAuthError(msg);
    } else {
      console.log("[Auth] ✅ All required Firebase env vars present");
    }
  }, []);

  // ── Auth-state listener ──────────────────────────────────────────────────────
  useEffect(() => {
    if (window.isTestingMode) {
      console.log("[Auth] Testing mode active — bypass Firebase auth");
      const testUser = {
        uid: "test-uid",
        displayName: "Sudhan Test",
        email: "test@example.com",
        photoURL: "https://ui-avatars.com/api/?name=Sudhan+Test",
        getIdToken: async () => "test-token"
      };
      setUser(testUser);
      setLoading(false);
      // Still sync user to DB so that saveUser endpoint is validation-tested
      saveUser({
        uid: testUser.uid,
        name: testUser.displayName,
        email: testUser.email,
        photo: testUser.photoURL,
      });
      return;
    }

    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        console.log("[Auth] onAuthStateChanged — user signed in:", currentUser.uid);
        // Sync user profile to MongoDB
        saveUser({
          uid: currentUser.uid,
          name: currentUser.displayName || "",
          email: currentUser.email || "",
          photo: currentUser.photoURL || "",
        });
      } else {
        console.log("[Auth] onAuthStateChanged — no user");
      }
    });
    return () => unsub();
  }, []);

  // ── ID-token refresh listener ────────────────────────────────────────────────
  useEffect(() => {
    if (window.isTestingMode) return;
    const unsub = auth.onIdTokenChanged((newUser) => {
      setUser(newUser);
      if (newUser) {
        console.log("[Auth] onIdTokenChanged — token refreshed for:", newUser.uid);
      }
    });
    return () => unsub();
  }, []);

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = async () => {
    setAuthError(null); // clear stale errors before each attempt
    if (window.isTestingMode) {
      console.log("[Auth] Login bypassed in testing mode");
      return;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("[Auth] Login success:", result.user.uid);
    } catch (err) {
      // Ignore the "popup closed" case — user just dismissed it
      if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
        console.error("[Auth] Login error", err.code, err.message);
        setAuthError(err.message);
      }
      throw err;
    }
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await signOut(auth);
      console.log("[Auth] Signed out");
    } catch (err) {
      console.error("[Auth] Logout error", err);
      setAuthError(err.message);
    }
  };

  const value = { user, loading, login, logout, authError };

  // NOTE: No global error banner here — authError is surfaced per-page
  // (LoginPage reads it from context and renders it inline).
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
