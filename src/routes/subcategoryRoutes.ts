import { SubCategoryController } from "../controllers/subCategoryController";
import { Router } from "express";

const router = Router();

// Public routes
router.post("/", SubCategoryController.create);
router.get("/", SubCategoryController.getAll);
router.get("/:id", SubCategoryController.getById);
router.get("/category/:id", SubCategoryController.getSubCategoriesByCategoryId);
router.put("/:id", SubCategoryController.update);
router.delete("/:id", SubCategoryController.delete);

export default router;
