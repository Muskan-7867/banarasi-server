import { Request, Response, NextFunction } from "express";
import { ApiResponseUtil } from "../utils/apiResponse";
import { SizeCreateRequest } from "../types";
import { ColorService } from "../services/colorServices";

export class colorController {

  static async create(
    req: Request<{}, {}, SizeCreateRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ColorService.create(req.body);
      ApiResponseUtil.success(res, "color created successfully", result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getSizes(
    req: Request<{}, {}>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ColorService.getAll();
      ApiResponseUtil.success(res, "data fetched successful", result);
    } catch (error) {
      next(error);
    }
  }

  static async getColorById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ColorService.getById(req.params.id);
      ApiResponseUtil.success(res, "Data Fetched successful", result);
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
      const result = await ColorService.update(req.params.id, req.body);
      ApiResponseUtil.success(res, "color updated", result);
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
      const result = await ColorService.delete(req.params.id);
      ApiResponseUtil.success(res, "color deleted successfully", result);
    } catch (error) {
      next(error);
    }
  }
}
