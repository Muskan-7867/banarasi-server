import { productController } from "../controllers/productController";
import { Router } from "express";
import upload from "../middleware/multer";

const router = Router();

router.post("/", 
  upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'video', maxCount: 1 }
  ]), 
  productController.create
);
router.get("/", productController.getAll);
router.get("/:id", productController.getById);
// Accept multiple images and a single video
router.put(
  "/:id",
  upload.fields([
    { name: "images", maxCount: 10 },   // multiple images
    { name: "video", maxCount: 1 }      // single video
  ]),
  productController.update
);

router.delete("/:id", productController.delete);
router.get("/tag/:tag", productController.getProductByTag);
router.post("/cartproducts", productController.getCartProducts);
router.get("/filter", productController.getProductByTag);
router.get('/category/:category', productController.getProductsByCategory);

router.get("/women/products/tag", productController.getWomenProductsByTag);


export default router;
