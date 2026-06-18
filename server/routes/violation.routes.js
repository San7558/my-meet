// server/routes/violation.routes.js
import express from "express";
import { logViolation } from "../controllers/violation.controller.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Protected route – logs a violation for the authenticated user
router.post("/", verifyToken, logViolation);

export default router;
