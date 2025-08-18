import { Router } from "express";
import authRoutes from "./authRoutes";
import categoryRoutes from "./categoryRoutes";
import subCategoryRoutes from "./subcategoryRoutes";
import sizeRoutes from "./sizeRoutes";
import colorRoutes from "./colorRoutes";
import qualityRoutes from "./qualityRoutes";
import productRoutes from "./productRoutes";
import { ApiResponseUtil } from "../utils/apiResponse";

const router = Router();

// Health check
router.get("/health", (_req, res) => {
  ApiResponseUtil.success(res, "Server is running", {
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
router.use("/auth", authRoutes);
router.use("/category", categoryRoutes);
router.use("/subCategory", subCategoryRoutes);
router.use("/size", sizeRoutes);
router.use("/color", colorRoutes);
router.use("/quality", qualityRoutes);
router.use("/product", productRoutes);

export default router;
