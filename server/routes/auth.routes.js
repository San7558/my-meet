// server/routes/auth.routes.js
import express from "express";
import { saveUser } from "../controllers/auth.controller.js";

const router = express.Router();

// Save or update user data after Google sign‑in
router.post("/save", saveUser);

export default router;
