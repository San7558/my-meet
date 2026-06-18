// src/context/SessionContext.jsx
import React, { createContext, useContext, useState } from "react";

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  // Display language – stores full label like "English", "Tamil", etc.
  // Persisted in localStorage so it survives page refreshes
  const [displayLanguage, setDisplayLanguageState] = useState(() => {
    return localStorage.getItem("displayLanguage") || "English";
  });

  const setDisplayLanguage = (lang) => {
    localStorage.setItem("displayLanguage", lang);
    setDisplayLanguageState(lang);
  };

  // Transcript / translated lines shown in the description box
  const [descriptionLines, setDescriptionLines] = useState([]);

  const addLine = (line) => {
    setDescriptionLines((prev) => [...prev, line]);
  };

  const clearLines = () => {
    setDescriptionLines([]);
  };

  return (
    <SessionContext.Provider
      value={{ displayLanguage, setDisplayLanguage, descriptionLines, addLine, clearLines }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
};
