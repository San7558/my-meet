// server/middleware/verifyToken.js
import admin from "../config/firebaseAdmin.js";

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("[Auth] No token in Authorization header");
      return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    console.log("[Auth] Verified user", decoded.uid);
    next();
  } catch (error) {
    console.error("[Auth] Token verification failed", error);
    return res.status(401).json({ success: false, message: "Unauthorized: Invalid token", error: error.message });
  }
};

export default verifyToken;
