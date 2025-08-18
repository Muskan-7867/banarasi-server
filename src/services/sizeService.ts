import prisma from "../config/database";
import {  SizeCreateRequest, SizeT } from "../types";
import {
  ConflictError,
  NotFoundError,
} from "../utils/errors";

export class SizeService {
  static async create(data: SizeCreateRequest): Promise<SizeT> {
    const { name, categoryId } = data;

 
    const existingSize = await prisma.size.findFirst({
      where: { name },
    });

    if (existingSize) {
      throw new ConflictError("Size with this email already exists");
    }
    // Create user
    const size = await prisma.size.create({
      data: {
        name,
        categoryId,
      },
    });

    return size;
  }

  static async getAll() {
    const sizes = await prisma.size.findMany({
      include: {
        category: true,
      },
    });
    return sizes;
  }

  static async getAllByCategoryId(categoryId: string) {
    const sizes = await prisma.size.findMany({
      where: { categoryId },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });
    return sizes;
  }

  static async update(id: string, data: { name: string; categoryId: string }) {
    const size = await prisma.size.findUnique({
      where: { id },
    });
    if (!size) {
      throw new NotFoundError("size not found");
    }
    const updatedSize = await prisma.size.update({
      where: { id },
      data,
    });
    return updatedSize;
  }

  static async getById(id: string) {
    const size = await prisma.size.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
    if (!size) {
      throw new NotFoundError("size not found");
    }
    return size;
  }

  static async delete(id: string) {
    const size = await prisma.size.findUnique({
      where: { id },
    });
    if (!size) {
      throw new NotFoundError("size not found");
    }
    await prisma.size.delete({
      where: { id },
    });
  }
}
