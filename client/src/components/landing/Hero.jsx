// src/components/landing/Hero.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CanvasWrapper from "./CanvasWrapper";
import Button from "../ui/Button";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-950 pt-24">
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-indigo-700/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-violet-700/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text side */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col gap-6"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold tracking-wider uppercase"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            AI-Powered Real-time Translation
          </motion.div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight">
            Break Language
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              Barriers Live
            </span>
          </h1>

          {/* Sub-heading */}
          <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
            Speak in any language. Get instant translation using AI speech recognition,
            gesture detection, and LibreTranslate — all in one private room.
          </p>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: "🌐", label: "6 Languages" },
              { icon: "🎤", label: "Deepgram STT" },
              { icon: "✋", label: "Gesture Safety" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm"
              >
                <span>{stat.icon}</span>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mt-2">
            <Button size="lg" onClick={() => navigate("/login")}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
              Start for Free
            </Button>
            <Button variant="secondary" size="lg" onClick={() => { document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }); }}>
              See How It Works
            </Button>
          </div>
        </motion.div>

        {/* 3D Globe side */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="h-[420px] lg:h-[540px] w-full"
        >
          <CanvasWrapper />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-slate-600 text-xs tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-px h-8 bg-gradient-to-b from-slate-600 to-transparent"
        />
      </motion.div>
    </section>
  );
};

export default Hero;
