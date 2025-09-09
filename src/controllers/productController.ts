import { Request, Response, NextFunction } from "express";
import { ApiResponseUtil } from "../utils/apiResponse";
import { productService } from "../services/productService";
import { MulterRequest } from "../types";
import fs from "fs";
import { ValidationError } from "../utils/errors";
export class productController {
static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
  let filesArray: Express.Multer.File[] = [];

  try {
    // Normalize files to array
    const files = (req as MulterRequest).files;
    if (files) {
      if (Array.isArray(files)) {
        filesArray = files; // upload.array()
      } else {
        // upload.fields()
        for (const key in files) {
          filesArray.push(...(files[key] as Express.Multer.File[]));
        }
      }
    }

    const result = await productService.create(req.body, filesArray);

    // Clean up temporary files
    filesArray.forEach((file) => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });

    ApiResponseUtil.success(res, "Product created successfully", result, 201);
  } catch (error) {
    // Clean up on error
    filesArray.forEach((file) => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });
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

  // static async getProductByTag(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ) {
  //   try {
  //     const { tag } = req.params;
  //     const { size, color, priceRange, minPrice, maxPrice } = req.query;

  //     let filter: any = {
  //       size: size as string,
  //       color: color as string
  //     };

  //     // 🎚️ Dual slider values
  //     if (minPrice || maxPrice) {
  //       filter.minPrice = minPrice ? Number(minPrice) : undefined;
  //       filter.maxPrice = maxPrice ? Number(maxPrice) : undefined;
  //     }

  //     // 🎯 Dropdown fallback
  //     if (priceRange) {
  //       switch (priceRange) {
  //         case "Under 50K":
  //           filter.maxPrice = 50000;
  //           break;
  //         case "50K - 150K":
  //           filter.minPrice = 50000;
  //           filter.maxPrice = 150000;
  //           break;
  //         case "150K and above":
  //           filter.minPrice = 150000;
  //           break;
  //       }
  //     }

  //     const products = await productService.getByTag(tag, filter);

  //     return res.status(200).json(products);
  //   } catch (error) {
  //     return next(error);
  //   }
  // }

  static async getCartProducts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids)) {
        res.status(400).json({ message: "IDs must be provided as an array" });
        return;
      }

      const products = await productService.getCartProductsByIds(ids);

      res.status(200).json({
        products,
        message: "Products fetched successfully"
      });
    } catch (error) {
      console.error("Error fetching cart products:", error);
      next(error); // forward to error middleware
    }
  }

  static async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { category, search, page, limit } = req.query;

      const result = await productService.getAll(
        category as string,
        search as string,
        page ? parseInt(page as string) : undefined,
        limit ? parseInt(limit as string) : undefined
      );

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

static async update(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
  let filesArray: Express.Multer.File[] = [];

  try {
    // Normalize files to array
    const files = (req as MulterRequest).files;
    if (files) {
      if (Array.isArray(files)) {
        filesArray = files; // upload.array()
      } else {
        // upload.fields()
        for (const key in files) {
          filesArray.push(...(files[key] as Express.Multer.File[]));
        }
      }
    }

    const result = await productService.update(req.params.id, req.body, filesArray);

    // Clean up temporary files
    filesArray.forEach((file) => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });

    ApiResponseUtil.success(res, "Product updated successfully", result);
  } catch (error) {
    // Clean up on error
    filesArray.forEach((file) => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });
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

static async getProductsByCategory(req: Request, res: Response) {
    try {
      const { category } = req.params;
      const { size, color, minPrice, maxPrice, page, limit } = req.query;

      if (!category) {
        throw new ValidationError("Category is required");
      }

      const result = await productService.getByCategory(category, {
        size: size as string,
        color: color as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 16
      });

      return res.status(200).json({
        success: true,
        message: `Products in category ${category} retrieved successfully`,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Error fetching products by category:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch products"
      });
    }
  }

static async getWomenProductsByTag(req: Request, res: Response) {
  try {
    const { tag } = req.query;

    if (!tag || typeof tag !== "string") {
      return res.status(400).json({ error: "Tag is required" });
    }

    const filters = {
      size: req.query.size as string,
      color: req.query.color as string,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await productService.getWomenProductsByTag(tag, filters);

    return res.status(200).json({
      success: true,
      message: "Women products fetched successfully",
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

}
