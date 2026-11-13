import { Router } from "express";
import { getStats } from "../controllers/adminController.js";
import {
  createProduct,
  getCategorySpecFields,
  getProduct,
  listProducts,
  setProductStatus,
  updateProduct,
} from "../controllers/adminProductsController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

// Order matters: first "who are you" (401), then "are you an admin" (403).
router.use(requireAuth, requireAdmin);

router.get("/stats", getStats);

router.get("/category-spec-fields", getCategorySpecFields);
router.get("/products", listProducts);
router.post("/products", createProduct);
router.get("/products/:id", getProduct);
router.put("/products/:id", updateProduct);
router.patch("/products/:id/status", setProductStatus);

export default router;
