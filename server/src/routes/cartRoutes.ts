import { Router } from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
} from "../controllers/cartController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.use(requireAuth);

router.get("/", getCart);
router.post("/", addToCart);
router.patch("/:productId", updateCartItem);
router.delete("/:productId", removeFromCart);

export default router;
