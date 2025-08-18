import { Request, Response, NextFunction } from "express";
import { ApiResponseUtil } from "../utils/apiResponse";
import { qualityService } from "../services/qualityService";

export class qualityController {

  static async create(
    req: Request<{}, {}>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await qualityService.create(req.body);
      ApiResponseUtil.success(res, "quality created successfully", result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getqualities(
    req: Request<{}, {}>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await qualityService.getAll();
      ApiResponseUtil.success(res, "data fetched successful", result);
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
      const result = await qualityService.getById(req.params.id);
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
      const result = await qualityService.update(req.params.id, req.body);
      ApiResponseUtil.success(res, "data updated", result);
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
      const result = await qualityService.delete(req.params.id);
      ApiResponseUtil.success(res, "data deleted successfully", result);
    } catch (error) {
      next(error);
    }
  }
}
