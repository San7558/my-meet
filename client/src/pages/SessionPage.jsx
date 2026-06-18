// src/pages/SessionPage.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useSession } from "../context/SessionContext";
import { useAuth } from "../context/AuthContext";
import useDeepgram from "../hooks/useDeepgram";
import useMediaPipe from "../hooks/useMediaPipe";
import useGestureAlert from "../hooks/useGestureAlert";
import CameraPreview from "../components/session/CameraPreview";
import VideoAudioControls from "../components/session/VideoAudioControls";
import DescriptionBox from "../components/session/DescriptionBox";
import GestureCounter from "../components/session/GestureCounter";
import { LANGUAGES } from "../constants/languages";
import { downloadPDF } from "../services/pdf";

const SessionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { displayLanguage, setDisplayLanguage, descriptionLines, addLine, clearLines } =
    useSession();
  const { user } = useAuth();

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [permissionError, setPermissionError] = useState("");
  // BUG FIX: Start as true — spinner shows while getUserMedia is pending.
  // We flip to false ONLY after we have the stream, so the <video> element
  // is guaranteed to be in the DOM before we call videoRef.current.srcObject = stream.
  const [loading, setLoading] = useState(true);

  // ── Initialise language from dashboard router state ──────────────────────
  useEffect(() => {
    const lang = location.state?.displayLanguage;
    if (lang) setDisplayLanguage(lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Deepgram ─────────────────────────────────────────────────────────────
  const { startListening, stopListening, isListening } = useDeepgram({
    displayLanguage,
    onTranslated: addLine,
  });

  // ── MediaPipe + gesture alert ─────────────────────────────────────────────
  const onSessionEndRef = useRef(null);

  const { warningCount, handleGestureDetected, resetAlerts } = useGestureAlert({
    addLine,
    onSessionEnd: () => onSessionEndRef.current?.(),
  });

  const { initMediaPipe, stopMediaPipe, isReady } = useMediaPipe({
    onGestureDetected: handleGestureDetected,
  });

  // ── Step 1: Request camera + mic ──────────────────────────────────────────
  // We only store the stream here. Attaching to <video> happens in Step 2
  // because the <video> element doesn't exist while loading=true.
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        console.log("[Session] Requesting getUserMedia…");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        console.log(
          "[Session] Stream acquired:",
          stream.id,
          "| video tracks:", stream.getVideoTracks().length,
          "| audio tracks:", stream.getAudioTracks().length
        );
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        // Flip loading → false. This causes React to unmount the spinner
        // and render the main layout (which includes <CameraPreview> with the <video> ref).
        setLoading(false);
      } catch (err) {
        console.error("[Session] getUserMedia error:", err.name, err.message);
        if (!mounted) return;
        setPermissionError(
          err.name === "NotAllowedError"
            ? "Camera / microphone permission was denied. Click the camera icon in your browser's address bar and allow access, then refresh."
            : `Could not access camera/microphone: ${err.message}`
        );
        setLoading(false);
      }
    };
    init();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Unmount cleanup — fires on every navigate-away ────────────────────────
  // Ensures camera/mic tracks, MediaPipe rAF loop, and Deepgram WS are all
  // stopped even if the user clicks the browser back button.
  useEffect(() => {
    return () => {
      console.log("[Session] Unmounting — releasing all resources");
      stopListening();
      stopMediaPipe();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Step 2: Attach stream to <video> element once it is in the DOM ────────
  // This effect runs when loading flips to false (main layout rendered).
  // At that point videoRef.current is the real <video> DOM node.
  useEffect(() => {
    if (loading || permissionError || !streamRef.current) return;
    if (!videoRef.current) {
      console.warn("[Session] videoRef is still null after loading=false — unexpected");
      return;
    }
    console.log("[Session] Attaching stream to videoRef…");
    videoRef.current.srcObject = streamRef.current;
    videoRef.current
      .play()
      .then(() => console.log("[Session] Video playing ✅"))
      .catch((e) => console.warn("[Session] video.play() error:", e));

    // Give the video element a moment to paint first frame, then init MediaPipe
    const timer = setTimeout(() => {
      if (videoRef.current) {
        console.log("[Session] Initialising MediaPipe…");
        initMediaPipe(videoRef.current);
      }
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, permissionError]);

  // ── Session-end handler ───────────────────────────────────────────────────
  const handleEndSession = useCallback(
    (opts = {}) => {
      stopListening();
      stopMediaPipe();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setVideoOn(false);
      setAudioOn(false);
      setSessionEnded(true);
      if (opts.addSystemLine !== false) {
        addLine("⚠ System Alert: Session ended.");
      }
    },
    [stopListening, stopMediaPipe, addLine]
  );

  useEffect(() => {
    onSessionEndRef.current = () =>
      handleEndSession({ addSystemLine: false });
  }, [handleEndSession]);

  // ── Toggle video tracks ───────────────────────────────────────────────────
  const handleToggleVideo = useCallback(() => {
    if (!streamRef.current) return;
    const newState = !videoOn;
    streamRef.current.getVideoTracks().forEach((t) => (t.enabled = newState));
    setVideoOn(newState);
  }, [videoOn]);

  // ── Toggle audio — starts/stops Deepgram ─────────────────────────────────
  const handleToggleAudio = useCallback(() => {
    if (!streamRef.current) {
      console.warn("[Session] No stream yet — cannot toggle audio");
      return;
    }
    if (!audioOn) {
      console.log("[Session] Starting Deepgram…");
      startListening(streamRef.current);
    } else {
      console.log("[Session] Stopping Deepgram…");
      stopListening();
    }
    setAudioOn((prev) => !prev);
  }, [audioOn, startListening, stopListening]);

  // ── Manual stop session button ────────────────────────────────────────────
  const handleStopSession = useCallback(() => {
    handleEndSession();
    resetAlerts();
  }, [handleEndSession, resetAlerts]);

  const handleBackToDashboard = () => {
    clearLines();
    navigate("/dashboard");
  };

  const handleDownloadPDF = () => {
    downloadPDF({
      userName: user?.displayName || "Unknown User",
      displayLanguage,
      lines: descriptionLines,
    });
  };

  // ── Loading / Error states ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Requesting camera &amp; microphone…</p>
        </div>
      </div>
    );
  }

  if (permissionError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
        <div className="max-w-md text-center backdrop-blur-xl bg-white/5 border border-red-500/30 rounded-3xl p-10 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-white font-semibold text-xl mb-2">Permission Required</h2>
          <p className="text-slate-400 text-sm mb-6">{permissionError}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-700/10 rounded-full blur-3xl pointer-events-none" />

      <GestureCounter count={warningCount} />

      <nav className="relative z-20 border-b border-white/5 backdrop-blur-md bg-slate-950/70 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </div>
          <span className="text-white font-bold text-base tracking-tight">AI Translation Room</span>
          <span className="text-xs text-slate-500 border border-white/10 px-2 py-0.5 rounded-full">Session</span>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-slate-400 text-xs">Translate to:</label>
          <select
            value={displayLanguage}
            onChange={(e) => setDisplayLanguage(e.target.value)}
            disabled={isListening || sessionEnded}
            className="bg-white/5 border border-white/10 text-white text-sm rounded-xl px-3 py-1.5
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
                       cursor-pointer disabled:opacity-50"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.label} className="bg-slate-900">
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-72px)]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-4"
        >
          <CameraPreview videoRef={videoRef} videoOn={videoOn} />

          <div className="flex items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
            <VideoAudioControls
              videoOn={videoOn}
              audioOn={audioOn}
              onToggleVideo={handleToggleVideo}
              onToggleAudio={handleToggleAudio}
              disabled={sessionEnded}
            />

            <div className="flex items-center gap-4">
              {isListening && (
                <div className="flex items-center gap-2 text-green-400 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Listening…
                </div>
              )}
              {isReady && (
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  Gesture AI
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            {!sessionEnded ? (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleStopSession}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl
                           bg-red-600/20 border border-red-500/40 text-red-300
                           hover:bg-red-600/30 font-medium text-sm transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
                </svg>
                Stop Session
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleBackToDashboard}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl
                           bg-indigo-600/20 border border-indigo-500/40 text-indigo-300
                           hover:bg-indigo-600/30 font-medium text-sm transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back to Dashboard
              </motion.button>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleDownloadPDF}
              disabled={descriptionLines.length === 0}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl
                         bg-emerald-600/20 border border-emerald-500/40 text-emerald-300
                         hover:bg-emerald-600/30 font-medium text-sm transition-all
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              PDF
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col"
        >
          <DescriptionBox lines={descriptionLines} sessionEnded={sessionEnded} />
        </motion.div>
      </main>
    </div>
  );
};

export default SessionPage;
