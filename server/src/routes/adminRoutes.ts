import { Router } from "express";
import { getStats } from "../controllers/adminController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

// Order matters: first "who are you" (401), then "are you an admin" (403).
router.use(requireAuth, requireAdmin);

router.get("/stats", getStats);

export default router;
