// src/pages/DashboardPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import LanguageDropdown from "../components/session/LanguageDropdown";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [language, setLanguage] = useState("en");
  const [sessionMsg, setSessionMsg] = useState("");

  // Map code → label for session context
  const langLabels = {
    en: "English", ta: "Tamil", hi: "Hindi",
    te: "Telugu",  ml: "Malayalam", kn: "Kannada",
  };

  const handleStartSession = () => {
    navigate("/session", { state: { displayLanguage: langLabels[language] || "English" } });
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-700/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-20 border-b border-white/5 backdrop-blur-md bg-slate-950/70 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </div>
          <span className="text-white font-bold text-base tracking-tight">AI Translation Room</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-400 hover:text-white border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Sign Out
        </motion.button>
      </nav>

      {/* Main content */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Welcome heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              {user?.displayName?.split(" ")[0] || "User"}
            </span>{" "}
            👋
          </h1>
          <p className="text-slate-400 mt-2">
            Configure your session and start translating in real time.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center gap-4 shadow-xl shadow-black/20"
          >
            {/* Avatar */}
            <div className="relative">
              <img
                src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || "U")}&background=6366f1&color=fff&size=80`}
                alt={user?.displayName}
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-500/40 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-950" />
            </div>

            <div>
              <h2 className="text-white font-semibold text-lg leading-tight">
                {user?.displayName || "User"}
              </h2>
              <p className="text-slate-400 text-sm mt-0.5 truncate max-w-[200px]">
                {user?.email}
              </p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-white/10" />

            <div className="w-full space-y-2 text-left">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                Status: <span className="text-green-400 font-medium">Online</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Verified with Google
              </div>
            </div>
          </motion.div>

          {/* Session Config Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl shadow-black/20"
          >
            <h3 className="text-white font-semibold text-xl mb-6">
              Session Settings
            </h3>

            <div className="space-y-6">
              {/* Language Dropdown */}
              <LanguageDropdown value={language} onChange={setLanguage} />

              {/* Info row */}
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <svg className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <p className="text-indigo-300 text-sm">
                  Your microphone audio will be transcribed by Deepgram and translated to{" "}
                  <strong className="text-indigo-200">
                    {["English","Tamil","Hindi","Telugu","Malayalam","Kannada"][["en","ta","hi","te","ml","kn"].indexOf(language)]}
                  </strong>{" "}
                  using LibreTranslate.
                </p>
              </div>

              {/* Session Message */}
              {sessionMsg && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm"
                >
                  {sessionMsg}
                </motion.div>
              )}

              {/* Start Session Button */}
              <motion.button
                onClick={handleStartSession}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl
                           bg-gradient-to-r from-indigo-600 to-violet-600
                           hover:from-indigo-500 hover:to-violet-500
                           text-white font-semibold text-base tracking-wide
                           shadow-lg shadow-indigo-500/25 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                </svg>
                Start Translation Session
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="grid grid-cols-3 gap-4 mt-6"
        >
          {[
            { label: "Sessions", value: "—", icon: "📡" },
            { label: "Languages", value: "6", icon: "🌐" },
            { label: "Gestures Detected", value: "—", icon: "✋" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-center"
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-white font-bold text-xl">{stat.value}</div>
              <div className="text-slate-500 text-xs mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardPage;
