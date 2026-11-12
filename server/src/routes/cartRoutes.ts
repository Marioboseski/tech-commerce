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
// The name after ":" must match req.params.productId in the controller.
router.patch("/:productId", updateCartItem);
router.delete("/:productId", removeFromCart);

export default router;
