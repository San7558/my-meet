// src/hooks/useMediaPipe.js
import { useRef, useState } from "react";

/**
 * Hook that initialises MediaPipe Hands (loaded via CDN as window.Hands)
 * and runs inference on a <video> element.
 *
 * @param {{ onGestureDetected: () => void }} options
 */
const useMediaPipe = ({ onGestureDetected }) => {
  const [isReady, setIsReady] = useState(false);
  const handsRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTriggerRef = useRef(0);          // cooldown tracking
  const COOLDOWN_MS = 2500;

  /**
   * Returns true when the hand landmarks indicate a middle-finger gesture:
   *   - middle finger extended   (tip above MCP)
   *   - index folded             (tip below PIP)
   *   - ring folded              (tip below PIP)
   *   - pinky folded             (tip below PIP)
   */
  const isMiddleFingerGesture = (lm) => {
    const middleExtended = lm[12].y < lm[9].y;
    const indexFolded    = lm[8].y  > lm[6].y;
    const ringFolded     = lm[16].y > lm[14].y;
    const pinkyFolded    = lm[20].y > lm[18].y;
    return middleExtended && indexFolded && ringFolded && pinkyFolded;
  };

  const initMediaPipe = (videoElement) => {
    if (!window.Hands) {
      console.error("[MediaPipe] window.Hands not found — CDN scripts may not have loaded yet.");
      return;
    }
    if (handsRef.current) return; // already initialised

    const hands = new window.Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results) => {
      if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return;

      const landmarks = results.multiHandLandmarks[0];
      if (!isMiddleFingerGesture(landmarks)) return;

      const now = Date.now();
      if (now - lastTriggerRef.current < COOLDOWN_MS) return;

      lastTriggerRef.current = now;
      console.log("[MediaPipe] Middle-finger gesture detected");
      onGestureDetected();
    });

    handsRef.current = hands;

    // Run inference frame-by-frame
    const processFrame = async () => {
      if (!handsRef.current || !videoElement || videoElement.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }
      try {
        await handsRef.current.send({ image: videoElement });
      } catch (err) {
        console.error("[MediaPipe] send error:", err);
      }
      animFrameRef.current = requestAnimationFrame(processFrame);
    };

    setIsReady(true);
    animFrameRef.current = requestAnimationFrame(processFrame);
  };

  const stopMediaPipe = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (handsRef.current) {
      handsRef.current.close?.();
      handsRef.current = null;
    }
    setIsReady(false);
    console.log("[MediaPipe] stopped");
  };

  return { initMediaPipe, stopMediaPipe, isReady };
};

export default useMediaPipe;
