// src/components/session/LanguageDropdown.jsx
import React from "react";
import { LANGUAGES } from "../../constants/languages";

const LanguageDropdown = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-slate-400 font-medium tracking-wide">
        Target Language
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                   transition-all duration-200 cursor-pointer backdrop-blur-sm
                   hover:bg-white/10 appearance-none"
        style={{ backgroundImage: "none" }}
      >
        {LANGUAGES.map((lang) => (
          <option
            key={lang.code}
            value={lang.code}
            className="bg-slate-900 text-white"
          >
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageDropdown;
