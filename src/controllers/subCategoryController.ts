import { Request, Response, NextFunction } from "express";
import { ApiResponseUtil } from "../utils/apiResponse";

import { SubCategoryService } from "../services/subCategoryService";

export class SubCategoryController {

  static async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await SubCategoryService.create(req.body);
      ApiResponseUtil.success(
        res,
        "Category created successfully",
        result,
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async getAll(
    req: Request<{}, {}>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await SubCategoryService.getAll();
      ApiResponseUtil.success(
        res,
        "Fetched Sub-Category  successfully",
        result,
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await SubCategoryService.getById(req.params.id);
      ApiResponseUtil.success(
        res,
        "Fetched Category  successfully",
        result,
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async getSubCategoriesByCategoryId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await SubCategoryService.getSubCategoriesByCategoryId(req.params.id);
      ApiResponseUtil.success(
        res,
        "Fetched Category  successfully",
        result,
        201
      );
    } catch (error) {
      next(error);
    }
  }


  static async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await SubCategoryService.update(req.params.id, req.body);
      ApiResponseUtil.success(
        res,
        "Fetched Category  successfully",
        result,
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await SubCategoryService.delete(req.params.id);
      ApiResponseUtil.success(
        res,
        " Category deleted  successfully",
        result,
        201
      );
    } catch (error) {
      next(error);
    }
  }




}
