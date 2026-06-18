// src/hooks/useDeepgram.js
import { useRef, useState } from "react";
import { translateText } from "../services/api";

// ── Supported mimeTypes ordered by preference ──────────────────────────────
// audio/webm;codecs=opus  → best for Deepgram, supported on Chrome/Edge
// audio/webm              → fallback without codec spec
// audio/ogg;codecs=opus   → Firefox
const PREFERRED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
];

const getSupportedMimeType = () => {
  for (const type of PREFERRED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(type)) {
      console.log("[Deepgram] Using mimeType:", type);
      return type;
    }
  }
  console.warn("[Deepgram] No preferred mimeType supported — using browser default");
  return ""; // browser decides
};

/**
 * Hook that manages Deepgram WebSocket + MediaRecorder.
 *
 * FIX: Deepgram browser auth must be done via ?token= query param in the URL,
 * NOT as a WebSocket sub-protocol. Passing the key as a sub-protocol
 * (["token", apiKey]) is rejected by browsers and Deepgram servers.
 *
 * @param {{ displayLanguage: string, onTranslated: (line: string) => void }} options
 */
const useDeepgram = ({ displayLanguage, onTranslated }) => {
  const [isListening, setIsListening] = useState(false);
  const wsRef = useRef(null);
  const recorderRef = useRef(null);
  // Keep a live ref to displayLanguage to avoid stale closure in ws.onmessage
  const langRef = useRef(displayLanguage);
  langRef.current = displayLanguage;

  const startListening = (stream) => {
    if (wsRef.current) {
      console.warn("[Deepgram] Already listening — ignoring duplicate start");
      return;
    }

    const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY;
    if (!apiKey) {
      console.error("[Deepgram] VITE_DEEPGRAM_API_KEY is not set in .env");
      return;
    }

    // ── FIXED: Deepgram v1 browser auth uses ?access_token= NOT ?token= ─────────
    // Using ?token= results in a 401 or silent WebSocket close (code 1006).
    const url =
      `wss://api.deepgram.com/v1/listen` +
      `?model=nova-2` +
      `&language=multi` +
      `&interim_results=false` +
      `&punctuate=true` +
      `&access_token=${apiKey}`;

    console.log("[Deepgram] Opening WebSocket…");
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[Deepgram] ✅ WebSocket connected");

      const mimeType = getSupportedMimeType();
      let recorder;
      try {
        recorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);
      } catch (err) {
        console.error("[Deepgram] MediaRecorder creation failed:", err);
        ws.close();
        return;
      }
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (ws.readyState === WebSocket.OPEN && e.data && e.data.size > 0) {
          ws.send(e.data);
        }
      };

      recorder.onerror = (e) => {
        console.error("[Deepgram] MediaRecorder error:", e);
      };

      recorder.start(250); // send audio chunks every 250ms
      setIsListening(true);
      console.log("[Deepgram] 🎙️ MediaRecorder started, state:", recorder.state);
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);

        // Log every message in dev to help debug
        if (import.meta.env.DEV) {
          console.log("[Deepgram] Message:", data.type, "| is_final:", data?.is_final);
        }

        if (!data?.is_final) return;

        const transcript = data?.channel?.alternatives?.[0]?.transcript;
        if (!transcript || transcript.trim() === "") return;

        console.log("[Deepgram] 📝 Transcript:", transcript);

        try {
          const translated = await translateText(transcript, langRef.current);
          if (translated) {
            onTranslated(`User 1: ${translated}`);
          }
        } catch (translateErr) {
          console.error("[Deepgram] Translation API error:", translateErr.message);
          // Show original transcript if translation fails
          onTranslated(`User 1 (untranslated): ${transcript}`);
        }
      } catch (err) {
        console.error("[Deepgram] Message parsing error:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("[Deepgram] ❌ WebSocket error:", err);
    };

    ws.onclose = (event) => {
      console.log(
        `[Deepgram] WebSocket closed — code: ${event.code}, reason: ${event.reason || "(none)"}`
      );
      setIsListening(false);
    };
  };

  const stopListening = () => {
    console.log("[Deepgram] Stopping…");
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    recorderRef.current = null;

    if (wsRef.current) {
      wsRef.current.close(1000, "Session ended");
    }
    wsRef.current = null;

    setIsListening(false);
  };

  return { startListening, stopListening, isListening };
};

export default useDeepgram;
