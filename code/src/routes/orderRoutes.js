import express from "express";

const router = express.Router();

import * as orderController from "../controllers/orderController.js";

router.post("/", orderController.create);
router.get("/", orderController.getAll);
router.patch("/:id/status", orderController.updateStatus);
router.post("/:id/payment/success", (req, res) => {
  req.body = { ...(req.body || {}), paymentSuccess: true };
  return orderController.updateStatus(req, res);
});
router.get("/:id", orderController.getById);

export default router;
