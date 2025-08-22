import prisma from "../config/database";
import {   } from "../types";
import {
  ConflictError,
  NotFoundError,
} from "../utils/errors";

export class qualityService {
  static async create(data: {name:string}): Promise<any> {
    const { name,  } = data;

 
    const existingquality = await prisma.quality.findFirst({
      where: { name },
    });

    if (existingquality) {
      throw new ConflictError("quality with this name already exists");
    }
    
    const quality = await prisma.quality.create({
      data: {
        name,
      },
    });

    return quality;
  }

  static async getAll() {
    const qualities = await prisma.quality.findMany();
    return qualities;
  }



  static async update(id: string, data: { name: string }) {
    const quality = await prisma.quality.findUnique({
      where: { id },
    });
    if (!quality) {
      throw new NotFoundError("quality not found");
    }
    const updatedquality = await prisma.quality.update({
      where: { id },
      data,
    });
    return updatedquality;
  }

  static async getById(id: string) {
    const quality = await prisma.quality.findUnique({
      where: { id }
    });
    if (!quality) {
      throw new NotFoundError("quality not found");
    }
    return quality;
  }

  static async delete(id: string) {
    const quality = await prisma.quality.findUnique({
      where: { id },
    });
    if (!quality) {
      throw new NotFoundError("quality not found");
    }
    await prisma.quality.delete({
      where: { id },
    });
  }
}



