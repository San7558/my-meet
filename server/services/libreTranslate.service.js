// server/services/libreTranslate.service.js
// ─────────────────────────────────────────────────────────────────────────────
// Uses MyMemory Translation API (https://mymemory.translated.net)
// - Completely FREE, no API key required for basic use
// - 5000 chars/day free tier (add &de=your@email.com to raise to 10000)
// - Works without Docker, without local services
// - Supports all required Indian languages (Tamil, Hindi, Telugu, etc.)
// ─────────────────────────────────────────────────────────────────────────────
import axios from "axios";

const MYMEMORY_URL = "https://api.mymemory.translated.net/get";

/**
 * Translate text using MyMemory free API.
 * @param {string} text - source text (auto-detected language)
 * @param {string} targetCode - ISO language code e.g. "en", "ta", "hi"
 * @returns {Promise<string>} translated text
 */
export const translateToLanguage = async (text, targetCode) => {
  if (!text || text.trim() === "") {
    throw new Error("No text provided for translation");
  }

  // MyMemory langpair format: "en|ta" or "auto|ta"
  // Using "en|<target>" works well since Deepgram transcribes primarily in English
  const langPair = `en|${targetCode}`;

  console.log("[MyMemory] Translating:", text.substring(0, 60),
    "| langPair:", langPair);

  try {
    const response = await axios.get(MYMEMORY_URL, {
      params: {
        q: text,
        langpair: langPair,
        // Optional: add your email to get 10,000 chars/day instead of 5,000
        // de: "your@email.com",
      },
      timeout: 8000,
    });

    const data = response.data;

    // MyMemory response shape: { responseStatus: 200, responseData: { translatedText: "..." } }
    if (data?.responseStatus === 200 && data?.responseData?.translatedText) {
      const result = data.responseData.translatedText;
      console.log("[MyMemory] ✅ Translation success:", result.substring(0, 80));

      // MyMemory returns "PLEASE SELECT TWO DISTINCT LANGUAGES" when same language
      if (result.includes("PLEASE SELECT TWO DISTINCT LANGUAGES")) {
        console.log("[MyMemory] Same language detected — returning original text");
        return text;
      }

      return result;
    }

    // MyMemory returns 429/403 when quota is hit
    if (data?.responseStatus === 429 || data?.responseStatus === 403) {
      console.error("[MyMemory] Quota exceeded or forbidden:", data?.responseDetails);
      throw new Error(
        "MyMemory translation quota exceeded. Add &de=your@email.com to increase limit."
      );
    }

    console.error("[MyMemory] Unexpected response:", JSON.stringify(data));
    throw new Error(`MyMemory error: ${data?.responseDetails || "Unexpected response"}`);
  } catch (err) {
    if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") {
      throw new Error("MyMemory translation timed out — check network connection");
    }
    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
      throw new Error("Cannot reach MyMemory API — check internet connection");
    }
    // Re-throw already-formatted errors
    if (err.message.startsWith("MyMemory")) throw err;
    throw new Error(`Translation failed: ${err.message}`);
  }
};
