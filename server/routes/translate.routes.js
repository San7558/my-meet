// server/routes/translate.routes.js
import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { ping, translateText } from "../controllers/translate.controller.js";

const router = express.Router();

router.get("/ping", ping);
router.post("/", verifyToken, translateText);

export default router;
