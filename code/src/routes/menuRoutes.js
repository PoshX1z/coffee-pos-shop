import express from "express";

const router = express.Router();
import * as menuController from "../controllers/menuController.js";

router.get("/", menuController.getAll);
router.get("/:id/recipe", menuController.getRecipe);
router.put("/:id/recipe", menuController.saveRecipe);
router.get("/:id", menuController.getById);
router.post("/", menuController.create);
router.put("/:id", menuController.update);
router.delete("/:id", menuController.deleteMenu);

export default router;
