// src/components/session/GestureCounter.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Fixed top-right badge showing warning count.
 * 0 → gray, 1-2 → yellow, 3 → red (pulsing)
 *
 * Props: count (number)
 */
const GestureCounter = ({ count }) => {
  const color =
    count === 0
      ? { bg: "bg-white/5", border: "border-white/10", text: "text-slate-400", dot: "bg-slate-500" }
      : count < 3
      ? { bg: "bg-amber-500/15", border: "border-amber-500/40", text: "text-amber-300", dot: "bg-amber-400" }
      : { bg: "bg-red-500/20", border: "border-red-500/50", text: "text-red-300", dot: "bg-red-500" };

  return (
    <AnimatePresence>
      <motion.div
        key={count}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={`fixed top-20 right-5 z-50 flex items-center gap-2 px-3.5 py-2 rounded-xl border backdrop-blur-md shadow-lg ${color.bg} ${color.border}`}
      >
        <span
          className={`w-2 h-2 rounded-full ${color.dot} ${count === 3 ? "animate-pulse" : ""}`}
        />
        <span className={`text-xs font-semibold tracking-wide ${color.text}`}>
          Warnings: {count}/3
        </span>
      </motion.div>
    </AnimatePresence>
  );
};

export default GestureCounter;
