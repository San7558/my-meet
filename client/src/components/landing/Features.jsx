// src/components/landing/Features.jsx
import React from "react";
import { motion } from "framer-motion";
import Card from "../ui/Card";

const features = [
  {
    icon: "🎤",
    title: "Real-time Speech Recognition",
    desc: "Powered by Deepgram's industry-leading STT engine. Captures only final transcripts for accuracy.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: "🌐",
    title: "LibreTranslate Integration",
    desc: "Open-source translation engine supporting English, Tamil, Hindi, Telugu, Malayalam, and Kannada.",
    color: "from-indigo-500 to-violet-500",
  },
  {
    icon: "✋",
    title: "Gesture-based Safety System",
    desc: "MediaPipe hand detection identifies inappropriate gestures. Three warnings auto-stop the session.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: "🔒",
    title: "Secure Firebase Auth",
    desc: "Google OAuth 2.0 login with Firebase. Every API call is verified with a Bearer token.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: "🌏",
    title: "3D Immersive Interface",
    desc: "React Three Fiber globe animation in the hero section for a premium, modern feel.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: "📄",
    title: "PDF Transcript Export",
    desc: "Download your entire translated session as a formatted PDF using jsPDF — one click.",
    color: "from-rose-500 to-orange-500",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const Features = () => {
  return (
    <section id="features" className="py-28 bg-slate-950 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-3"
          >
            Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-white tracking-tight"
          >
            Everything you need for
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              seamless translation
            </span>
          </motion.h2>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
            >
              <Card hover className="p-6 h-full flex flex-col gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl shadow-lg`}>
                  {f.icon}
                </div>
                <h3 className="text-white font-semibold text-lg">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
