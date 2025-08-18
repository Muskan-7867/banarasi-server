import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { validateRequest } from "../middleware/validation";
import { authenticate } from "../middleware/auth";
import { registerSchema, loginSchema } from "../utils/validation";

const router = Router();

// Public routes
router.post(
  "/register",
  validateRequest(registerSchema),
  AuthController.register
);
router.post("/login", validateRequest(loginSchema), AuthController.login);

router.get("/profile", authenticate, AuthController.getProfile);

export default router;
