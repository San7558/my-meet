// client/src/services/api.js
import axios from "axios";
import { auth } from "./firebase";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/**
 * Get Firebase ID token for the currently signed-in user.
 * @returns {Promise<string>} Bearer token
 */
export const getToken = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }
  return await user.getIdToken();
};

/**
 * Get auth header for requests.
 * @returns {Promise<Object>} Authorization header object
 */
export const getAuthHeader = async () => {
  const token = await getToken();
  return { Authorization: `Bearer ${token}` };
};

/**
 * Translate text via the backend LibreTranslate wrapper.
 * @param {string} text           Source text to translate
 * @param {string} targetLanguage Display name e.g. "English", "Tamil"
 * @returns {Promise<string>}     Translated text
 */
export const translateText = async (text, targetLanguage) => {
  const headers = await getAuthHeader();

  const response = await axios.post(
    `${API_BASE_URL}/api/translate`,
    { text, targetLanguage },
    {
      headers,
    }
  );

  return response.data.translatedText;
};

/**
 * Log a gesture violation to the backend.
 * @param {number} warningCount  Current warning number (1–3)
 * @param {string} message       Human-readable alert message
 */
export const logViolation = async (warningCount, message) => {
  try {
    const headers = await getAuthHeader();
    await axios.post(
      `${API_BASE_URL}/api/violations`,
      { warningCount, message },
      { headers }
    );
  } catch (err) {
    // Non-critical — log but don't break the session
    console.error("[api] logViolation error:", err);
  }
};

/**
 * Save/update user profile in the backend database.
 * @param {{ uid: string, name: string, email: string, photo: string }} userData
 */
export const saveUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/save`, userData);
    console.log("[api] User synced to DB:", response.data);
    return response.data;
  } catch (err) {
    console.error("[api] saveUser error:", err);
  }
};

/**
 * Get a short-lived (30s) Deepgram temporary token from our backend.
 * The backend mints this via POST https://api.deepgram.com/v1/auth/grant.
 * The browser must use this token as a WebSocket sub-protocol:
 *   new WebSocket(url, ["token", tempToken])
 *
 * This is the ONLY reliable cross-browser auth method since browsers cannot
 * set custom Authorization headers on WebSocket connections.
 *
 * @returns {Promise<string>} Deepgram temporary token
 */
export const getDeepgramToken = async () => {
  const headers = await getAuthHeader();
  console.log("[api] Requesting Deepgram temp token from backend…");
  const response = await axios.get(
    `${API_BASE_URL}/api/deepgram/token`,
    { headers }
  );
  const token = response.data?.token;
  if (!token) throw new Error("Backend returned no Deepgram token");
  console.log("[api] Deepgram temp token received — first 8 chars:", token.substring(0, 8) + "…");
  return token;
};
