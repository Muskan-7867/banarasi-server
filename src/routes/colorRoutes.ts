import { colorController } from "../controllers/colorController";
import { Router } from "express";

const router = Router();

// Public routes
router.post("/", colorController.create);
router.get("/", colorController.getSizes);
router.get("/:id", colorController.getColorById);
router.put("/:id", colorController.update);
router.delete("/:id", colorController.delete);

export default router;
