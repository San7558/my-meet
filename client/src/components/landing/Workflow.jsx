// src/components/landing/Workflow.jsx
import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Sign In with Google",
    desc: "Authenticate securely using your Google account via Firebase OAuth.",
    icon: "🔑",
  },
  {
    step: "02",
    title: "Select Target Language",
    desc: "Choose from 6 Indian & global languages. Your preference is saved per session.",
    icon: "🌐",
  },
  {
    step: "03",
    title: "Start Your Session",
    desc: "Camera and mic activate. Deepgram listens and sends final speech transcripts.",
    icon: "🎤",
  },
  {
    step: "04",
    title: "Get Instant Translation",
    desc: "Transcripts are sent to your backend which forwards to LibreTranslate and returns the result.",
    icon: "⚡",
  },
  {
    step: "05",
    title: "Gesture Safety Enforced",
    desc: "MediaPipe monitors hand gestures. 3 violations auto-terminate the session.",
    icon: "✋",
  },
  {
    step: "06",
    title: "Download Transcript",
    desc: "Export your full translated session as a formatted PDF with one click.",
    icon: "📄",
  },
];

const Workflow = () => {
  return (
    <section id="workflow" className="py-28 bg-slate-950">
      <div className="max-w-5xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-3"
          >
            How It Works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-white tracking-tight"
          >
            From speech to{" "}
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              translation in seconds
            </span>
          </motion.h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/40 via-violet-500/40 to-transparent hidden md:block" />

          <div className="flex flex-col gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex items-start gap-6 md:pl-20 relative"
              >
                {/* Step circle — sits on the vertical line */}
                <div className="hidden md:flex absolute left-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 items-center justify-center text-2xl shadow-lg shadow-indigo-500/20 flex-shrink-0">
                  {s.icon}
                </div>

                {/* Mobile icon */}
                <div className="flex md:hidden w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 items-center justify-center text-xl shadow-lg flex-shrink-0">
                  {s.icon}
                </div>

                {/* Content */}
                <div className="flex-1 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-6 py-5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-indigo-400 text-xs font-bold tracking-widest">
                      STEP {s.step}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-1">{s.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Workflow;
