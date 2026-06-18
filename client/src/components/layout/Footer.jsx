// src/components/layout/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-slate-950 py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </div>
          <span className="text-white font-bold tracking-tight">AI Translation Room</span>
        </div>

        <p className="text-slate-500 text-sm text-center">
          © {new Date().getFullYear()} AI Translation Room. Built with React, LibreTranslate &amp; Deepgram.
        </p>

        <div className="flex items-center gap-6 text-sm text-slate-500">
          <Link to="/login" className="hover:text-white transition-colors duration-200">Sign In</Link>
          <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
          <a href="#tech-stack" className="hover:text-white transition-colors duration-200">Tech Stack</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
