// src/components/session/DescriptionBox.jsx
import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Displays translated transcript lines.
 * - System Alert lines (starting with "⚠") appear in red.
 * - Normal lines appear in light text.
 * - Auto-scrolls to bottom as new lines arrive.
 *
 * Props: lines (string[]), sessionEnded (bool)
 */
const DescriptionBox = ({ lines = [], sessionEnded = false }) => {
  const bottomRef = useRef(null);

  // Auto scroll to latest line
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const isAlert = (line) =>
    line.startsWith("⚠") || line.toLowerCase().startsWith("system alert");

  return (
    <div className="flex flex-col h-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10 bg-white/5">
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
        <span className="text-white font-semibold text-sm tracking-wide">
          Live Transcript
        </span>
        {sessionEnded && (
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
            Session Ended
          </span>
        )}
      </div>

      {/* Lines */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {lines.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center py-12">
            <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-indigo-400/60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <p className="text-slate-500 text-sm">
              Translations will appear here as you speak.
            </p>
            <p className="text-slate-600 text-xs">
              Enable the microphone to start.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {lines.map((line, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`text-sm leading-relaxed px-4 py-2.5 rounded-xl border ${
                  isAlert(line)
                    ? "bg-red-500/10 border-red-500/30 text-red-300"
                    : "bg-white/5 border-white/5 text-slate-200"
                }`}
              >
                {line}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default DescriptionBox;
