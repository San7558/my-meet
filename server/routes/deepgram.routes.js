// server/routes/deepgram.routes.js
import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { getDeepgramToken } from "../controllers/deepgram.controller.js";

const router = express.Router();

// GET /api/deepgram/token
// Returns a short-lived Deepgram temp token for the browser client.
// Protected: user must be authenticated.
router.get("/token", verifyToken, getDeepgramToken);

export default router;
