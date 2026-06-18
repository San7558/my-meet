// src/hooks/useDeepgram.js
// ─────────────────────────────────────────────────────────────────────────────
// Auth fix: Deepgram browser WebSocket requires the API key to be passed as a
// WebSocket sub-protocol — browsers cannot set a custom Authorization header.
//
// The CORRECT pattern (per Deepgram docs):
//   1. Call our backend: GET /api/deepgram/token → short-lived temp token (30s)
//   2. Open WebSocket with: new WebSocket(url, ["bearer", tempToken])
//
// The OLD pattern that was failing:
//   new WebSocket(`wss://...?access_token=${apiKey}`)
//   → returns HTTP 401 during WS upgrade → browser sees close code 1006
// ─────────────────────────────────────────────────────────────────────────────
import { useRef, useState } from "react";
import { translateText, getDeepgramToken } from "../services/api";

// ── Supported mimeTypes ordered by preference ──────────────────────────────
// audio/webm;codecs=opus  → best for Deepgram (Chrome/Edge)
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
 * Auth method: Backend-issued temporary token via Sec-WebSocket-Protocol.
 * This is the only reliable cross-browser method for Deepgram auth.
 *
 * @param {{ displayLanguage: string, onTranslated: (line: string) => void }} options
 */
const useDeepgram = ({ displayLanguage, onTranslated }) => {
  const [isListening, setIsListening] = useState(false);
  const wsRef = useRef(null);
  const recorderRef = useRef(null);
  // Keep a live ref to avoid stale closure inside ws.onmessage
  const langRef = useRef(displayLanguage);
  langRef.current = displayLanguage;

  const startListening = async (stream) => {
    console.log("[Deepgram] startListening called");
    console.log("[Deepgram] Auth method: backend-issued temp token via Sec-WebSocket-Protocol");

    // ── Guard: already running ─────────────────────────────────────────────
    if (wsRef.current) {
      console.warn("[Deepgram] Already listening — ignoring duplicate start");
      return;
    }

    // ── Guard: stream must exist ───────────────────────────────────────────
    if (!stream) {
      console.error("[Deepgram] startListening received null/undefined stream");
      return;
    }
    const audioTracks = stream.getAudioTracks();
    console.log("[Deepgram] Audio tracks in stream:", audioTracks.length,
      audioTracks.map(t => `${t.label} (enabled:${t.enabled}, muted:${t.muted})`));
    if (audioTracks.length === 0) {
      console.error("[Deepgram] Stream has no audio tracks — cannot start");
      return;
    }

    // ── Step 1: Get temp token from backend ────────────────────────────────
    let tempToken;
    try {
      console.log("[Deepgram] Fetching temp token from backend…");
      tempToken = await getDeepgramToken();
      console.log("[Deepgram] Key type: temporary (30s TTL, backend-issued)");
      console.log("[Deepgram] Temp token received — first 8 chars:", tempToken?.substring(0, 8) + "…");
    } catch (tokenErr) {
      console.error("[Deepgram] Failed to get temp token:", tokenErr.message);
      console.error("[Deepgram] Make sure DEEPGRAM_API_KEY is set in server/.env and backend is running");
      return;
    }

    // ── Step 2: Build WSS URL (NO access_token in URL) ────────────────────
    const wsUrl =
      `wss://api.deepgram.com/v1/listen` +
      `?model=nova-2` +
      `&language=multi` +
      `&interim_results=false` +
      `&punctuate=true`;

    console.log("[Deepgram] WS URL:", wsUrl);
    console.log("[Deepgram] Opening WebSocket with sub-protocol auth: [\"bearer\", <tempToken>]");

    // ── Step 3: Open WebSocket with sub-protocol ["bearer", tempToken] ─────
    // This is the CORRECT browser auth method. The temp token is only needed
    // during the handshake — once connected, the session stays open.
    const ws = new WebSocket(wsUrl, ["bearer", tempToken]);
    wsRef.current = ws;

    // ── WebSocket open ─────────────────────────────────────────────────────
    ws.onopen = () => {
      console.log("[Deepgram] ✅ WS opened — connection response received, handshake succeeded");
      console.log("[Deepgram] Connection response: authenticated via sub-protocol bearer");

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        console.error("[Deepgram] No audio tracks found in stream to record.");
        ws.close();
        return;
      }

      // Extract audio-only stream to avoid NotSupportedError with video tracks
      const audioStream = new MediaStream(audioTracks);
      const mimeType = getSupportedMimeType();

      let recorder;
      const setupRecorder = (useMime) => {
        const options = useMime && mimeType ? { mimeType } : undefined;
        const rec = new MediaRecorder(audioStream, options);

        rec.ondataavailable = (e) => {
          console.log("[Deepgram] Audio chunk size:", e.data?.size ?? 0, "| WS state:", ws.readyState);
          if (ws.readyState === WebSocket.OPEN && e.data && e.data.size > 0) {
            ws.send(e.data);
          } else if (e.data?.size === 0) {
            console.warn("[Deepgram] Empty audio chunk — mic may be silent or disabled");
          }
        };

        rec.onstart = () => {
          console.log("[Deepgram] 🎙️ Recording started — state:", rec.state, "— mimeType:", rec.mimeType);
        };

        rec.onerror = (errEvent) => {
          console.error("[Deepgram] MediaRecorder error:", errEvent.error ?? errEvent);
        };

        rec.onstop = () => {
          console.log("[Deepgram] Recording stopped");
        };

        return rec;
      };

      try {
        recorder = setupRecorder(true);
        recorderRef.current = recorder;
        recorder.start(250);
        setIsListening(true);
      } catch (err) {
        console.warn("[Deepgram] MediaRecorder start with custom mimeType failed, trying fallback default:", err.message);
        try {
          recorder = setupRecorder(false);
          recorderRef.current = recorder;
          recorder.start(250);
          setIsListening(true);
        } catch (fallbackErr) {
          console.error("[Deepgram] MediaRecorder default fallback start failed:", fallbackErr.message);
          ws.close();
        }
      }
    };

    // ── Incoming messages (transcripts) ────────────────────────────────────
    ws.onmessage = async (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (err) {
        console.error("[Deepgram] Failed to parse WS message:", err.message);
        return;
      }

      // Log every message shape in dev
      console.log("[Deepgram] Message type:", data?.type,
        "| channel:", !!data?.channel,
        "| is_final:", data?.is_final,
        "| speech_final:", data?.speech_final);

      // Deepgram sends "Results" type messages with transcripts
      if (data?.type !== "Results") return;

      if (!data?.is_final) {
        console.log("[Deepgram] Interim result — skipping (waiting for is_final)");
        return;
      }

      const transcript = data?.channel?.alternatives?.[0]?.transcript;
      console.log("[Deepgram] Transcript received:", JSON.stringify(transcript));

      if (!transcript || transcript.trim() === "") {
        console.log("[Deepgram] Empty transcript — no speech detected");
        return;
      }

      console.log("[Deepgram] 📝 Final transcript:", transcript,
        "| Target lang:", langRef.current);

      // ── Send to translation backend ──────────────────────────────────────
      console.log("[Deepgram] Sending translation request for:", transcript);
      try {
        const translated = await translateText(transcript, langRef.current);
        console.log("[Deepgram] Translation response:", translated);
        if (translated) {
          onTranslated(`User 1: ${translated}`);
        }
      } catch (translateErr) {
        console.error("[Deepgram] Translation API error:", translateErr.message);
        // Always show something to the user even if translation fails
        onTranslated(`User 1: ${transcript}`);
      }
    };

    // ── WS error / close ───────────────────────────────────────────────────
    ws.onerror = (err) => {
      console.error("[Deepgram] ❌ WS error:", err);
    };

    ws.onclose = (event) => {
      console.log(
        `[Deepgram] WS closed — code: ${event.code}, reason: ${event.reason || "(none)"}`,
        "| wasClean:", event.wasClean
      );
      if (event.code === 1006) {
        console.error("[Deepgram] Code 1006 = abnormal closure. Check network connectivity and that backend issued a valid token.");
      }
      if (event.code === 1008 || event.code === 1003) {
        console.error("[Deepgram] Auth/policy failure — check DEEPGRAM_API_KEY in server/.env");
      }
      setIsListening(false);
      wsRef.current = null;
    };
  };

  // ── Stop ────────────────────────────────────────────────────────────────
  const stopListening = () => {
    console.log("[Deepgram] stopListening called");
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    recorderRef.current = null;

    if (wsRef.current) {
      wsRef.current.close(1000, "Session ended");
      wsRef.current = null;
    }

    setIsListening(false);
  };

  return { startListening, stopListening, isListening };
};

export default useDeepgram;
