// server/controllers/auth.controller.js
import User from "../models/User.model.js";

/**
 * Save or update a user after Google sign‑in.
 * Expected body: { uid, name, email, photo }
 */
export const saveUser = async (req, res) => {
  try {
    const { uid, name = "", email = "", photo = "" } = req.body;
    if (!uid) {
      return res.status(400).json({ success: false, message: "uid is required" });
    }

    const user = await User.findOneAndUpdate(
      { uid },
      { name, email, photo },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({ success: true, user });
  } catch (error) {
    console.error("saveUser error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
