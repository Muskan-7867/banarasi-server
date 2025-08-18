import { Request, Response, NextFunction } from "express";
import { ApiResponseUtil } from "../utils/apiResponse";
import { SizeCreateRequest, } from "../types";
import { SizeService } from "../services/sizeService";

export class sizeController {

  static async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await SizeService.delete(req.params.id);
      ApiResponseUtil.success(res, "size deleted successfully", result);
    } catch (error) {
      next(error);
    }
  }
  static async create(
    req: Request<{}, {}, SizeCreateRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await SizeService.create(req.body);
      ApiResponseUtil.success(res, "size created successfully", result, 201);
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
      const result = await SizeService.getAll();
      ApiResponseUtil.success(res, "Login successful", result);
    } catch (error) {
      next(error);
    }
  }

  static async getSizesByCategoryId(
    req: Request<{}, {}>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const categoryId = req.query.categoryId as string;
      const result = await SizeService.getAllByCategoryId(categoryId);
      ApiResponseUtil.success(res, "Data Fetched successful", result);
    } catch (error) {
      next(error);
    }
  }

  static async getSizesById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await SizeService.getById(req.params.id);
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
      const result = await SizeService.update(req.params.id, req.body);
      ApiResponseUtil.success(res, "Login successful", result);
    } catch (error) {
      next(error);
    }
  }

}
