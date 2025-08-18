import prisma from "../config/database";
import {
  ConflictError,
  NotFoundError,
} from "../utils/errors";

export class ColorService {


  static async create(data: {name:string}) {
    const { name } = data;

 
    const existingColor = await prisma.color.findFirst({
      where: { name },
    });

    if (existingColor) {
      throw new ConflictError("Size with this email already exists");
    }
    const color = await prisma.color.create({
      data: {
        name,
      },
    });

    return color;
  }

  static async getAll() {
    const color = await prisma.color.findMany();
    return color;
  }

 
  static async update(id: string, data: { name: string;  }) {
    const color = await prisma.color.findUnique({
      where: { id },
    });
    if (!color) {
      throw new NotFoundError("color not found");
    }
    const updatedColor = await prisma.color.update({
      where: { id },
      data,
    });
    return updatedColor;
  }

  static async getById(id: string) {
    const color = await prisma.color.findUnique({
      where: { id }
    });
    if (!color) {
      throw new NotFoundError("size not found");
    }
    return color;
  }

  static async delete(id: string) {
    const color = await prisma.color.findUnique({
      where: { id },
    });
    if (!color) {
      throw new NotFoundError("size not found");
    }
    await prisma.color.delete({
      where: { id },
    });
  }
}
