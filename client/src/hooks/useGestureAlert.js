// src/hooks/useGestureAlert.js
import { useState, useRef, useCallback } from "react";
import { logViolation } from "../services/api";

const MAX_WARNINGS = 3;

/**
 * Manages gesture-warning state and session-termination logic.
 *
 * @param {{ addLine: (line: string) => void, onSessionEnd: () => void }} options
 */
const useGestureAlert = ({ addLine, onSessionEnd }) => {
  // State drives re-render; ref avoids stale-closure bug inside callbacks
  const [warningCount, setWarningCount] = useState(0);
  const warningCountRef = useRef(0);

  const handleGestureDetected = useCallback(async () => {
    // Guard: already at max warnings
    if (warningCountRef.current >= MAX_WARNINGS) return;

    const newCount = warningCountRef.current + 1;
    warningCountRef.current = newCount;
    setWarningCount(newCount);

    const alertMsg = `⚠ System Alert: User 1 showed an inappropriate gesture. Warning ${newCount}/${MAX_WARNINGS}.`;
    addLine(alertMsg);

    // Log violation to backend (fire-and-forget, errors swallowed in api.js)
    await logViolation(newCount, alertMsg);

    // Third strike — end session
    if (newCount === MAX_WARNINGS) {
      const finalMsg =
        "⚠ System Alert: User 1 was removed from the session due to repeated inappropriate gestures.";
      addLine(finalMsg);
      onSessionEnd();
    }
  }, [addLine, onSessionEnd]);

  const resetAlerts = useCallback(() => {
    warningCountRef.current = 0;
    setWarningCount(0);
  }, []);

  return { warningCount, handleGestureDetected, resetAlerts };
};

export default useGestureAlert;
