import { productController } from "../controllers/productController";
import { Router } from "express";
import upload from "../middleware/multer";

const router = Router();

// Public routes
router.post("/", upload.array("images", 10), productController.create);
router.get("/", productController.getAll);
router.get("/:id", productController.getById);
router.put("/:id", upload.array("images", 10), productController.update);
router.delete("/:id", productController.delete);
router.get("/tag/:tag", productController.getProductByTag)

export default router;
