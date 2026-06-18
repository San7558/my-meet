// server/controllers/violation.controller.js
import Violation from "../models/Violation.model.js";

/**
 * Log a violation for the authenticated user.
 * Expected body: { warningCount, message }
 */
export const logViolation = async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }
    const { warningCount = 0, message = "" } = req.body;

    const violation = await Violation.create({ uid, warningCount, message });
    return res.status(201).json({ success: true, violation });
  } catch (error) {
    console.error("logViolation error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
