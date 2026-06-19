// server/services/libreTranslate.service.js
// ─────────────────────────────────────────────────────────────────────────────
// Translation Service
// Primary: Google Translate Free "gtx" API
// Fallback: MyMemory API
// Caching: In-memory Map-based cache (max 500 entries, LRU eviction)
// ─────────────────────────────────────────────────────────────────────────────
import axios from "axios";

const MYMEMORY_URL = "https://api.mymemory.translated.net/get";
const GOOGLE_GTX_URL = "https://translate.googleapis.com/translate_a/single";

// Cache state
const cache = new Map();
const MAX_CACHE_SIZE = 500;

/**
 * Updates or adds a value in the LRU cache.
 */
const setCache = (key, value) => {
  if (cache.has(key)) {
    cache.delete(key);
  } else if (cache.size >= MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) {
      cache.delete(oldestKey);
    }
  }
  cache.set(key, value);
};

/**
 * Translate text using Google Translate GTX (primary) and MyMemory (fallback).
 * @param {string} text - source text (assumed to be English)
 * @param {string} targetCode - ISO language code e.g. "en", "ta", "hi"
 * @returns {Promise<string>} translated text
 */
export const translateToLanguage = async (text, targetCode) => {
  if (!text || text.trim() === "") {
    throw new Error("No text provided for translation");
  }

  // 1. Same-language passthrough
  if (targetCode === "en") {
    return text;
  }

  // 2. Cache check (LRU lookup)
  const cacheKey = `${targetCode}|${text.trim().toLowerCase()}`;
  if (cache.has(cacheKey)) {
    const cachedVal = cache.get(cacheKey);
    // Refresh LRU order
    cache.delete(cacheKey);
    cache.set(cacheKey, cachedVal);
    console.log(`[Translation Cache] Hit for key: ${cacheKey}`);
    return cachedVal;
  }

  // 3. Primary Provider: Google Translate GTX
  try {
    console.log(`[GoogleTranslate] Translating: "${text.substring(0, 60)}" to ${targetCode}`);
    const response = await axios.get(GOOGLE_GTX_URL, {
      params: {
        client: "gtx",
        sl: "en",
        tl: targetCode,
        dt: "t",
        q: text,
      },
      timeout: 3000,
    });

    const data = response.data;
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translatedText = data[0]
        .map((segment) => (Array.isArray(segment) && typeof segment[0] === "string" ? segment[0] : ""))
        .join("");

      if (translatedText) {
        console.log(`[GoogleTranslate] ✅ Success: "${translatedText.substring(0, 80)}"`);
        setCache(cacheKey, translatedText);
        return translatedText;
      }
    }
    throw new Error("Invalid or empty response format from Google Translate GTX");
  } catch (googleErr) {
    console.warn(`[GoogleTranslate] ❌ Failed, falling back to MyMemory. Error: ${googleErr.message}`);

    // 4. Fallback Provider: MyMemory Translation API
    const langPair = `en|${targetCode}`;
    console.log(`[MyMemory] Translating: "${text.substring(0, 60)}" to ${targetCode} via pair ${langPair}`);

    try {
      const response = await axios.get(MYMEMORY_URL, {
        params: {
          q: text,
          langpair: langPair,
        },
        timeout: 3000,
      });

      const data = response.data;

      // MyMemory response shape: { responseStatus: 200, responseData: { translatedText: "..." } }
      if (data?.responseStatus === 200 && data?.responseData?.translatedText) {
        const result = data.responseData.translatedText;
        console.log(`[MyMemory] ✅ Success: "${result.substring(0, 80)}"`);

        // MyMemory returns "PLEASE SELECT TWO DISTINCT LANGUAGES" when same language
        if (result.includes("PLEASE SELECT TWO DISTINCT LANGUAGES")) {
          console.log("[MyMemory] Same language detected — returning original text");
          setCache(cacheKey, text);
          return text;
        }

        setCache(cacheKey, result);
        return result;
      }

      // MyMemory returns 429/403 when quota is hit
      if (data?.responseStatus === 429 || data?.responseStatus === 403) {
        console.error("[MyMemory] Quota exceeded or forbidden:", data?.responseDetails);
        throw new Error("MyMemory translation quota exceeded.");
      }

      console.error("[MyMemory] Unexpected response:", JSON.stringify(data));
      throw new Error(`MyMemory error: ${data?.responseDetails || "Unexpected response"}`);
    } catch (mymemoryErr) {
      console.error(`[MyMemory] ❌ Failed. Error: ${mymemoryErr.message}`);
      if (mymemoryErr.code === "ECONNABORTED" || mymemoryErr.code === "ETIMEDOUT") {
        throw new Error("Translation timed out — check network connection");
      }
      if (mymemoryErr.code === "ECONNREFUSED" || mymemoryErr.code === "ENOTFOUND") {
        throw new Error("Cannot reach translation APIs — check internet connection");
      }
      throw new Error(`Translation failed: ${mymemoryErr.message}`);
    }
  }
};
