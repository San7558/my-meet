// server/services/libreTranslate.service.js
import axios from "axios";
import languageMap from "../utils/languageMap.js";

/**
 * Translate text using LibreTranslate.
 * @param {string} text - source text
 * @param {string} targetCode - LibreTranslate language code (e.g. "en")
 * @returns {Promise<string>} translated text
 */
export const translateToLanguage = async (text, targetCode) => {
  const baseUrl = process.env.LIBRETRANSLATE_URL;
  if (!baseUrl) {
    throw new Error("LIBRETRANSLATE_URL not defined in environment");
  }

  const payload = {
    q: text,
    source: "auto",
    target: targetCode,
    format: "text",
  };

  if (process.env.LIBRETRANSLATE_API_KEY) {
    payload.api_key = process.env.LIBRETRANSLATE_API_KEY;
  }

  try {
    const response = await axios.post(`${baseUrl}/translate`, payload);
    const data = response.data;
    // Expected shape: { translatedText: "..." }
    if (data && typeof data.translatedText === "string") {
      return data.translatedText;
    }
    // Fallback for older versions that return an array
    if (Array.isArray(data) && typeof data[0] === "string") {
      return data[0];
    }
    throw new Error("Unexpected response format from LibreTranslate");
  } catch (err) {
    const msg = err.response?.data?.error || err.message;
    throw new Error(`LibreTranslate error: ${msg}`);
  }
};
