import express from "express";
import * as ingredientController from "../controllers/ingredientController.js";
const router = express.Router();
router.get("/", ingredientController.getAll);
router.post("/", ingredientController.create);
router.put("/:id", ingredientController.update);
// router.delete("/:id", ingredientController.delete);
export default router;
