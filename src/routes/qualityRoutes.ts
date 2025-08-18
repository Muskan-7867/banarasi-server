import { qualityController } from "../controllers/qualityController";
import { Router } from "express";

const router = Router();

// Public routes
router.post("/", qualityController.create);
router.get("/", qualityController.getqualities);
router.get("/:id", qualityController.getById);
router.put("/:id", qualityController.update);
router.delete("/:id", qualityController.delete);

export default router;
