import bcrypt from "bcryptjs";
import { RegisterRequest, LoginRequest, AuthResponse } from "../types";
import { JwtUtil } from "../utils/jwt";
import {
  ConflictError,
  AuthenticationError,
  NotFoundError
} from "../utils/errors";
import prisma from "../config/database";

export class AuthService {
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const { username, email, password, phone } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || "12");
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        phone
      }
    });

    // Generate token
    const token = JwtUtil.generateToken({
      userId: user.id,
      email: user.email
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone
      },
      token
    };
  }

  static async login(data: LoginRequest): Promise<AuthResponse> {
    const { email, password } = data;
    console.log("email", email);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid credentials");
    }

    // Generate token
    const token = JwtUtil.generateToken({
      userId: user.id,
      email: user.email
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone
      },
      token
    };
  }

  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  static async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        orders: true,
        address: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  static async registerAdmin(data: RegisterRequest): Promise<AuthResponse> {
    const { username, email, password, phone } = data;

    const existingAdmin = await prisma.user.findUnique({ where: { email } });
    if (existingAdmin)
      throw new ConflictError("Admin with this email already exists");

    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_ROUNDS || "12")
    );

    const admin = await prisma.user.create({
      data: { email, password: hashedPassword, username, phone, role: "ADMIN" }
    });

    const token = JwtUtil.generateToken({
      userId: admin.id,
      email: admin.email,
      role: admin.role
    });

    return {
      user: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        phone: admin.phone
      },
      token
    };
  }

  static async loginAdmin(data: LoginRequest): Promise<AuthResponse> {
    const { email, password , username} = data;

    const admin = await prisma.user.findUnique({ where: { email } });
    if (!admin) throw new NotFoundError("Admin not found");

    if (admin.role !== "ADMIN")
      throw new AuthenticationError("Not authorized as admin");

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) throw new AuthenticationError("Invalid credentials");

    const token = JwtUtil.generateToken({
      userId: admin.id,
      email: admin.email,
      username: admin.username,
      role: admin.role
    });

    return {
      user: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        phone: admin.phone
      },
      token
    };
  }

  static async getAllAdmins() {
    return prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, email: true, username: true, phone: true, createdAt: true, updatedAt: true }
    });
  }

  static async getAdminByToken(token: string) {
  try {
    // 1. Verify and decode token
    const decoded = JwtUtil.verifyToken(token) as { userId: string; role: string };

    if (!decoded || decoded.role !== "ADMIN") {
      throw new AuthenticationError("Not authorized as admin");
    }

    // 2. Find admin in DB
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      throw new NotFoundError("Admin not found");
    }

    return admin;
  } catch (err) {
    throw new AuthenticationError("Invalid or expired token");
  }
}

}
