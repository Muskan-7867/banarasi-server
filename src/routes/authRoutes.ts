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
router.get("/admin", AuthController.getAdminProfile);

router.post("/admin/register", AuthController.registerAdmin);
router.post("/admin/login", AuthController.loginAdmin);

router.get("/profile", authenticate, AuthController.getProfile);
router.get("/users", authenticate, AuthController.getAllUsers);





export default router;
