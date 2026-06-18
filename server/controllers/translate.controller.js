// server/controllers/translate.controller.js
import { translateToLanguage } from "../services/libreTranslate.service.js";
import languageMap from "../utils/languageMap.js";

/**
 * Ping route – confirms backend is reachable.
 */
export const ping = (req, res) => {
  res.json({ message: "LibreTranslate API ready" });
};

/**
 * Translate text using LibreTranslate.
 * Expected body: { text: string, targetLanguage: string }
 */
export const translateText = async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ success: false, message: "Invalid or missing 'text'" });
    }
    if (!targetLanguage || typeof targetLanguage !== "string") {
      return res.status(400).json({ success: false, message: "Invalid or missing 'targetLanguage'" });
    }
    const targetCode = languageMap[targetLanguage];
    if (!targetCode) {
      return res.status(400).json({ success: false, message: `Unsupported target language: ${targetLanguage}` });
    }
    const translatedText = await translateToLanguage(text, targetCode);
    res.json({ translatedText });
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ success: false, message: error.message || "Translation failed" });
  }
};
