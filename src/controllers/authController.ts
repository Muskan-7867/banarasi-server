import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";
import { ApiResponseUtil } from "../utils/apiResponse";
import { RegisterRequest, LoginRequest } from "../types";
import { AuthenticatedRequest } from "../middleware/auth";

export class AuthController {
  static async register(
    req: Request<{}, {}, RegisterRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuthService.register(req.body);
      ApiResponseUtil.success(res, "User registered successfully", result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(
    req: Request<{}, {}, LoginRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuthService.login(req.body);
      ApiResponseUtil.success(res, "Login successful", result);
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await AuthService.getUserById(req.user!.userId);
      ApiResponseUtil.success(res, "Profile retrieved successfully", user);
    } catch (error) {
      next(error);
    }
  }

   static async getAllUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const users = await AuthService.getAllUsers();
      ApiResponseUtil.success(res, "Users retrieved successfully", users);
    } catch (error) {
      next(error);
    }
  }

   static async registerAdmin(
    req: Request<{}, {}, RegisterRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuthService.registerAdmin(req.body); // new service method
      ApiResponseUtil.success(res, "Admin registered successfully", result, 201);
    } catch (error) {
      next(error);
    }
  }

  // Admin Login
  static async loginAdmin(
    req: Request<{}, {}, LoginRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuthService.loginAdmin(req.body); // new service method
      ApiResponseUtil.success(res, "Admin login successful", result);
    } catch (error) {
      next(error);
    }
  }

    static async getAllAdmins(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const admins = await AuthService.getAllAdmins();
      ApiResponseUtil.success(res, "Admins retrieved successfully", admins);
    } catch (error) {
      next(error);
    }
  }

  static async getAdminProfile(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "Authorization header missing" });
      }

      const token = authHeader.split(" ")[1]; // Bearer <token>
      const admin = await AuthService.getAdminByToken(token);

      return res.json({ admin });
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({ message: err.message });
    }
  }
}
