import express from "express";

const router = express.Router();
import * as reportController from "../controllers/reportController.js";
router.get("/", reportController.getAll);

export default router;
