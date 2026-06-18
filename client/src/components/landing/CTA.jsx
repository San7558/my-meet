// src/components/landing/CTA.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../ui/Button";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-28 px-6 bg-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto relative rounded-3xl overflow-hidden"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-violet-600/20 to-purple-600/30" />
        <div className="absolute inset-0 backdrop-blur-sm border border-white/10 rounded-3xl" />

        {/* Glow orbs */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center gap-6 py-20 px-8">
          <span className="text-4xl">🚀</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            Ready to break the
            <br />
            <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-purple-300 bg-clip-text text-transparent">
              language barrier?
            </span>
          </h2>
          <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
            Join AI Translation Room today. Free to use, open-source, and built
            for real-time multilingual communication.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-2">
            <Button size="lg" onClick={() => navigate("/login")}>
              Get Started Free
            </Button>
            <Button variant="secondary" size="lg" onClick={() => window.open("https://github.com", "_blank")}>
              View on GitHub
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default CTA;
