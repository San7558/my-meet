// src/components/session/VideoAudioControls.jsx
import React from "react";
import { motion } from "framer-motion";

/**
 * Camera + Mic toggle buttons for the session page.
 * Props:
 *   videoOn, audioOn, onToggleVideo, onToggleAudio, disabled
 */
const VideoAudioControls = ({
  videoOn,
  audioOn,
  onToggleVideo,
  onToggleAudio,
  disabled = false,
}) => {
  const btnBase =
    "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 border disabled:opacity-40 disabled:cursor-not-allowed";

  const activeClass =
    "bg-white/10 border-white/20 text-white hover:bg-white/15";
  const inactiveClass =
    "bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30";

  return (
    <div className="flex items-center gap-3">
      {/* Camera toggle */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onToggleVideo}
        disabled={disabled}
        className={`${btnBase} ${videoOn ? activeClass : inactiveClass}`}
        title={videoOn ? "Turn Camera Off" : "Turn Camera On"}
      >
        {videoOn ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75zM3 3l18 18" />
          </svg>
        )}
        {videoOn ? "Camera On" : "Camera Off"}
      </motion.button>

      {/* Mic toggle */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onToggleAudio}
        disabled={disabled}
        className={`${btnBase} ${audioOn ? activeClass : inactiveClass}`}
        title={audioOn ? "Mute Mic" : "Unmute Mic"}
      >
        {audioOn ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
        )}
        {audioOn ? "Mic On" : "Mic Off"}
      </motion.button>
    </div>
  );
};

export default VideoAudioControls;
