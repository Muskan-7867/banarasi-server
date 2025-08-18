import { Router } from "express";
import { categoryController } from "../controllers/categoryController";
import { sizeController } from "../controllers/sizeController";

const router = Router();

// Public routes
router.post("/", sizeController.create);
router.get("/category/:id", sizeController.getSizesByCategoryId);
router.get("/", sizeController.getSizes);
router.get("/:id", sizeController.getSizesById);
router.put("/:id", sizeController.update);
router.delete("/:id", sizeController.delete);

export default router;
