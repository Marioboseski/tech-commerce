import { Router } from "express";
import { login, logout, me, register } from "../controllers/authController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
// requireAuth runs first; me only runs for a logged-in user.
router.get("/me", requireAuth, me);
router.post("/logout", logout);

export default router;
