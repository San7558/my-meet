// src/components/landing/TechStack.jsx
import React from "react";
import { motion } from "framer-motion";

const stack = [
  { name: "React 18", category: "Frontend", color: "bg-cyan-500/10 border-cyan-500/25 text-cyan-300" },
  { name: "Vite", category: "Frontend", color: "bg-yellow-500/10 border-yellow-500/25 text-yellow-300" },
  { name: "Tailwind CSS", category: "Frontend", color: "bg-sky-500/10 border-sky-500/25 text-sky-300" },
  { name: "Framer Motion", category: "Frontend", color: "bg-pink-500/10 border-pink-500/25 text-pink-300" },
  { name: "React Three Fiber", category: "Frontend", color: "bg-orange-500/10 border-orange-500/25 text-orange-300" },
  { name: "React Router v6", category: "Frontend", color: "bg-red-500/10 border-red-500/25 text-red-300" },
  { name: "Node.js + Express", category: "Backend", color: "bg-green-500/10 border-green-500/25 text-green-300" },
  { name: "MongoDB", category: "Backend", color: "bg-emerald-500/10 border-emerald-500/25 text-emerald-300" },
  { name: "Firebase Auth", category: "Backend", color: "bg-amber-500/10 border-amber-500/25 text-amber-300" },
  { name: "Deepgram STT", category: "Services", color: "bg-purple-500/10 border-purple-500/25 text-purple-300" },
  { name: "LibreTranslate", category: "Services", color: "bg-indigo-500/10 border-indigo-500/25 text-indigo-300" },
  { name: "MediaPipe", category: "Services", color: "bg-teal-500/10 border-teal-500/25 text-teal-300" },
];

const categories = ["Frontend", "Backend", "Services"];

const TechStack = () => {
  return (
    <section id="tech-stack" className="py-28 bg-slate-950 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-purple-400 text-sm font-semibold tracking-widest uppercase mb-3"
          >
            Built With
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-white tracking-tight"
          >
            A modern, production-ready{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              tech stack
            </span>
          </motion.h2>
        </div>

        {/* Categories */}
        <div className="space-y-10">
          {categories.map((cat, ci) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: ci * 0.1, duration: 0.5 }}
            >
              <p className="text-slate-500 text-xs font-semibold tracking-widest uppercase mb-4">
                {cat}
              </p>
              <div className="flex flex-wrap gap-3">
                {stack
                  .filter((t) => t.category === cat)
                  .map((tech, i) => (
                    <motion.span
                      key={tech.name}
                      initial={{ opacity: 0, scale: 0.85 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: ci * 0.1 + i * 0.06 }}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium ${tech.color}`}
                    >
                      {tech.name}
                    </motion.span>
                  ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;
