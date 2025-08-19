import { Request, Response, NextFunction } from "express";
import { ApiResponseUtil } from "../utils/apiResponse";
import { productService } from "../services/productService";
import { MulterRequest } from "../types";
import fs from "fs";

export class productController {
  static async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const files = (req as MulterRequest).files as Express.Multer.File[];
      const result = await productService.create(req.body, files);

      // Clean up temporary files
      if (files) {
        files.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }

      ApiResponseUtil.success(res, "Product created successfully", result, 201);
    } catch (error) {
      // Clean up temporary files on error
      const files = req.files as Express.Multer.File[];
      if (files) {
        files.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      next(error);
    }
  }

static async getProductByTag(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { tag } = req.params; 
    const products = await productService.getByTag(tag);

    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ message: `No products found for tag: ${tag}` });
    }

    return res.status(200).json(products);
  } catch (error) {
    return next(error);
  }
}


  static async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await productService.getAll();
      ApiResponseUtil.success(res, "Products retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }

  static async getById(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await productService.getById(req.params.id);
      ApiResponseUtil.success(res, "Product retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }

  static async update(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const files = (req as MulterRequest).files as Express.Multer.File[];
      const result = await productService.update(
        req.params.id,
        req.body,
        files
      );

      // Clean up temporary files
      if (files) {
        files.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }

      ApiResponseUtil.success(res, "Product updated successfully", result);
    } catch (error) {
      // Clean up temporary files on error
      const files = req.files as Express.Multer.File[];
      if (files) {
        files.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      next(error);
    }
  }

  static async delete(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await productService.delete(req.params.id);
      ApiResponseUtil.success(res, "Product deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
