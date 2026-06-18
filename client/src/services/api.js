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
