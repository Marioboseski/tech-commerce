import { Router } from "express";
import { createOrder, getOrder, getOrders } from "../controllers/ordersController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

// Every orders route needs a logged-in user.
router.use(requireAuth);

router.post("/", createOrder);
router.get("/", getOrders);
// The name after ":" must match req.params.orderId in the controller.
router.get("/:orderId", getOrder);

export default router;
