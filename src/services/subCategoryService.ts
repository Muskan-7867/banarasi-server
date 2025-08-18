import { SubCategory } from "./../../node_modules/.prisma/client/index.d";
import prisma from "../config/database";
import { SubCategoryCreateRequest, SubCategoryUpdateRequest } from "../types";
import { ConflictError, NotFoundError } from "../utils/errors";

export class SubCategoryService {
  static async create(data: SubCategoryCreateRequest): Promise<any> {
    const { name, parentCategoryId } = data;

    const existingSubCategory = await prisma.subCategory.findUnique({
      where: { name },
    });
    if (existingSubCategory) {
      throw new ConflictError("Category already exists");
    }

    const SubCategory = await prisma.subCategory.create({
      data: {
        name,
        parentCategory: parentCategoryId,
      },
    });

    return SubCategory;
  }

  static async getAll() {
    const SubCategories = await prisma.subCategory.findMany({
      include: {
        category: true,
        Product: true,
      },
    });
    return SubCategories;
  }

  static async update(id: string, data: any) {
    const SubCategory = await prisma.subCategory.findUnique({
      where: { id },
    });
    if (!SubCategory) {
      throw new NotFoundError("Sub-Category not found");
    }
    const updatedSubCategory = await prisma.subCategory.update({
      where: { id },
      data,
    });
    return updatedSubCategory;
  }

  static async getSubCategoriesByCategoryId(categoryId: string) {
    const subcategories = await prisma.subCategory.findMany({
      where: { parentCategory: categoryId },
      include: {
        Product: true,
        category: true,
      },
    });
    return subcategories;
  }

  static async getById(id: string) {
    const SubCategory = await prisma.subCategory.findUnique({
      where: { id },
      include: {
        Product: true,
      },
    });
    if (!SubCategory) {
      throw new NotFoundError("Sub Category not found");
    }
    return SubCategory;
  }

  static async delete(id: string) {
    const category = await prisma.subCategory.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundError("Category not found");
    }
    await prisma.subCategory.delete({
      where: { id },
    });
  }
}
