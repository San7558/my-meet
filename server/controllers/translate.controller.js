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
  console.log("[Backend] translate request — user:", req.user?.uid,
    "| body:", JSON.stringify(req.body));

  try {
    const { text, targetLanguage } = req.body;

    if (!text || typeof text !== "string") {
      console.warn("[Backend] translate — invalid/missing 'text'");
      return res.status(400).json({ success: false, message: "Invalid or missing 'text'" });
    }
    if (!targetLanguage || typeof targetLanguage !== "string") {
      console.warn("[Backend] translate — invalid/missing 'targetLanguage'");
      return res.status(400).json({ success: false, message: "Invalid or missing 'targetLanguage'" });
    }

    const targetCode = languageMap[targetLanguage];
    if (!targetCode) {
      console.warn("[Backend] translate — unsupported language:", targetLanguage);
      return res.status(400).json({
        success: false,
        message: `Unsupported target language: ${targetLanguage}. Supported: ${Object.keys(languageMap).join(", ")}`,
      });
    }

    console.log("[Backend] translate — calling LibreTranslate:",
      text.substring(0, 60), "→", targetLanguage, `(${targetCode})`);

    const translatedText = await translateToLanguage(text, targetCode);

    console.log("[Backend] translation success — result:", translatedText?.substring(0, 80));
    res.json({ translatedText });
  } catch (error) {
    console.error("[Backend] translation failed:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Translation failed",
    });
  }
};
