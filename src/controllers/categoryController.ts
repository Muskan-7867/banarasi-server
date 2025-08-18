import { Request, Response, NextFunction } from "express";
import { ApiResponseUtil } from "../utils/apiResponse";
import { categoryCreateRequest } from "../types";

import { CategoryService } from "../services/categoryService";

export class categoryController {
  static async create(
    req: Request<{}, {}, categoryCreateRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await CategoryService.create(req.body);
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
      const result = await CategoryService.getAll();
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

  static async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await CategoryService.getById(req.params.id);
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
      const result = await CategoryService.update(req.params.id, req.body);
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
      const result = await CategoryService.delete(req.params.id);
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
