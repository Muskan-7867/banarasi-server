import { Router } from "express";
import { categoryController } from "../controllers/categoryController";

const router = Router();

// Public routes
router.post("/", categoryController.create);
router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getById);
router.put("/:id", categoryController.update);
router.delete("/:id", categoryController.delete);

export default router;
