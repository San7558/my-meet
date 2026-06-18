// src/components/session/CameraPreview.jsx
import React, { useEffect } from "react";

/**
 * Renders the webcam video element.
 * Shows a "Camera Off" overlay when videoOn is false.
 *
 * FIX: Some browsers (especially on Windows) block autoplay even with muted=true.
 * We imperatively call video.play() whenever srcObject changes to guarantee playback.
 */
const CameraPreview = ({ videoRef, videoOn }) => {
  // Ensure playback starts when srcObject is set programmatically
  useEffect(() => {
    const video = videoRef?.current;
    if (!video) return;

    const handleCanPlay = () => {
      video.play().catch((e) => {
        // Ignore AbortError (e.g., element removed before play resolved)
        if (e.name !== "AbortError") {
          console.warn("[CameraPreview] play() error:", e.name, e.message);
        }
      });
    };

    video.addEventListener("canplay", handleCanPlay);
    return () => video.removeEventListener("canplay", handleCanPlay);
  }, [videoRef]);

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl shadow-black/40">
      {/* Video element — always rendered so srcObject stays attached */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          videoOn ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Camera-off overlay */}
      {!videoOn && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3l18 18"
              />
            </svg>
          </div>
          <p className="text-slate-500 text-sm font-medium">Camera Off</p>
        </div>
      )}

      {/* Live badge */}
      {videoOn && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/80 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-white text-xs font-semibold tracking-wide">LIVE</span>
        </div>
      )}
    </div>
  );
};

export default CameraPreview;
