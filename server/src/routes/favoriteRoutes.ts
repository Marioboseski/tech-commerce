import { Router } from "express";
import { getFavorites, addFavorite, removeFavorite } from "../controllers/favoritesController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.use(requireAuth);

router.get("/", getFavorites);
router.post("/", addFavorite);
router.delete("/:productId", removeFavorite);

export default router;