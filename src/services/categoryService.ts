import prisma from "../config/database";
import { categoryCreateRequest } from "../types";
import { ConflictError, NotFoundError } from "../utils/errors";

export class CategoryService {
  static async create(data: categoryCreateRequest): Promise<any> {
    const { name } = data;

    // Check if the category already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name },
    });
    if (existingCategory) {
      throw new ConflictError("Category already exists");
    }

    const category = await prisma.category.create({
      data: {
        name,
      },
    });

    return category;
  }

  static async getAll() {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: true,
        Size: true,
        Product: true,
      },
    });
    return categories;
  }

  static async update(id: string, data: { name: string }) {
    const category = await prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundError("Category not found");
    }
    const updatedCategory = await prisma.category.update({
      where: { id },
      data,
    });
    return updatedCategory;
  }

  static async getById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: true,
        Size: true,
        Product: true,
      },
    });
    if (!category) {
      throw new NotFoundError("Category not found");
    }
    return category;
  }

  static async delete(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundError("Category not found");
    }
    await prisma.category.delete({
      where: { id },
    });
  }
}
