import { ProductCreateRequest } from "../types/index";
import prisma from "../config/database";
import {
  uploadMultipleImages,
  deleteMultipleImages
} from "../utils/cloudinary";
import { ConflictError, NotFoundError, ValidationError } from "../utils/errors";
import fs from "fs";
export class productService {
  static async create(
    data: ProductCreateRequest,
    files?: Express.Multer.File[]
  ): Promise<any> {
    const {
      name,
      shortDescription,
      detailedDescription,
      price,
      originalPrice,
      discount,
      tax,
      categoryId,
      subcategoryId,
      qualityId,
      colors,
    } = data;

    // Validate required fields
    if (
      !name ||
      !shortDescription ||
      !detailedDescription ||
      !price ||
      !originalPrice
    ) {
      throw new ValidationError("Missing required fields");
    }

    // Check if product with same name exists
    const existingProduct = await prisma.product.findFirst({
      where: { name },
    });

    if (existingProduct) {
      throw new ConflictError("Product with this name already exists");
    }

    let uploadedImages: any[] = [];

    // Upload images to Cloudinary if files are provided
    if (files && files.length > 0) {
      try {
        const filePaths = files.map((file) => file.path);
        uploadedImages = await uploadMultipleImages(filePaths, "products");
      } catch (error) {
        throw new Error("Failed to upload images to Cloudinary");
      }
    }

    // Create product with transaction
    const product = await prisma.$transaction(async (tx) => {
      // Validate foreign key relationships
      if (categoryId) {
        const categoryExists = await tx.category.findUnique({
          where: { id: categoryId },
        });
        if (!categoryExists) {
          throw new ValidationError(`Category with ID ${categoryId} not found`);
        }
      }

      if (subcategoryId) {
        const subcategoryExists = await tx.subCategory.findUnique({
          where: { id: subcategoryId },
        });
        if (!subcategoryExists) {
          throw new ValidationError(
            `Subcategory with ID ${subcategoryId} not found`
          );
        }
      }

      if (qualityId) {
        const qualityExists = await tx.quality.findUnique({
          where: { id: qualityId },
        });
        if (!qualityExists) {
          throw new ValidationError(`Quality with ID ${qualityId} not found`);
        }
      }

      // Create the product
      const newProduct = await tx.product.create({
        data: {
          name,
          shortDescription,
          detailedDescription,
          price: parseFloat(price.toString()),
          originalPrice: parseFloat(originalPrice.toString()),
          discount: discount ? parseFloat(discount.toString()) : 0,
          tax: tax ? parseFloat(tax.toString()) : 0,
          categoryId: categoryId || null,
          subcategoryId: subcategoryId || null,
          qualityId: qualityId || null,
        },
      });

      // Create product images
      if (uploadedImages.length > 0) {
        const imageData = uploadedImages.map((image, index) => ({
          productId: newProduct.id,
          publicId: image.public_id,
          url: image.secure_url,
          rank: index + 1,
        }));

        await tx.productImage.createMany({
          data: imageData,
        });
      }

      // Connect colors if provided
      if (colors && colors.length > 0) {
        const colorIds = Array.isArray(colors) ? colors : [colors];

        // Validate that all color IDs exist
        const existingColors = await tx.color.findMany({
          where: { id: { in: colorIds } },
          select: { id: true },
        });

        const existingColorIds = existingColors.map((color) => color.id);
        const invalidColorIds = colorIds.filter(
          (id) => !existingColorIds.includes(id)
        );

        if (invalidColorIds.length > 0) {
          throw new ValidationError(
            `Invalid color IDs: ${invalidColorIds.join(", ")}`
          );
        }

        await tx.product.update({
          where: { id: newProduct.id },
          data: {
            colors: {
              connect: colorIds.map((colorId) => ({ id: colorId })),
            },
          },
        });
      }

      // Return product with relations
      return await tx.product.findUnique({
        where: { id: newProduct.id },
        include: {
          category: true,
          subcategory: true,
          quality: true,
          colors: true,
          images: true,
        },
      });
    });

    return product;
  }

  // static async create(
  //   data: ProductCreateRequest,
  //   files?: Express.Multer.File[]
  // ): Promise<any> {
  //   const {
  //     name,
  //     shortDescription,
  //     detailedDescription,
  //     price,
  //     originalPrice,
  //     discount,
  //     tax,
  //     categoryId,
  //     subcategoryId,
  //     qualityId,
  //     colors
  //   } = data;

  //   // Validate required fields
  //   if (
  //     !name ||
  //     !shortDescription ||
  //     !detailedDescription ||
  //     !price ||
  //     !originalPrice
  //   ) {
  //     throw new ValidationError("Missing required fields");
  //   }

  //   // Check if product with same name exists
  //   const existingProduct = await prisma.product.findFirst({
  //     where: { name }
  //   });

  //   if (existingProduct) {
  //     throw new ConflictError("Product with this name already exists");
  //   }

  //   let uploadedImages: any[] = [];
  //   const filePaths = files?.map((file) => file.path) || [];

  //   try {
  //     // Upload images to Cloudinary if files are provided
  //     if (files && files.length > 0) {
  //       uploadedImages = await uploadMultipleImages(filePaths, "products");
  //     }

  //     // Create product with transaction
  //     const product = await prisma.$transaction(async (tx) => {
  //       // Validate foreign key relationships
  //       if (categoryId) {
  //         const categoryExists = await tx.category.findUnique({
  //           where: { id: categoryId }
  //         });
  //         if (!categoryExists) {
  //           throw new ValidationError(
  //             `Category with ID ${categoryId} not found`
  //           );
  //         }
  //       }

  //       if (subcategoryId) {
  //         const subcategoryExists = await tx.subCategory.findUnique({
  //           where: { id: subcategoryId }
  //         });
  //         if (!subcategoryExists) {
  //           throw new ValidationError(
  //             `Subcategory with ID ${subcategoryId} not found`
  //           );
  //         }
  //       }

  //       if (qualityId) {
  //         const qualityExists = await tx.quality.findUnique({
  //           where: { id: qualityId }
  //         });
  //         if (!qualityExists) {
  //           throw new ValidationError(`Quality with ID ${qualityId} not found`);
  //         }
  //       }

  //       // Create the product
  //       const newProduct = await tx.product.create({
  //         data: {
  //           name,
  //           shortDescription,
  //           detailedDescription,
  //           price: parseFloat(price.toString()),
  //           originalPrice: parseFloat(originalPrice.toString()),
  //           discount: discount ? parseFloat(discount.toString()) : 0,
  //           tax: tax ? parseFloat(tax.toString()) : 0,

  //           categoryId: categoryId || null,
  //           subcategoryId: subcategoryId || null,
  //           qualityId: qualityId || null
  //         }
  //       });

  //       // Create product images
  //       if (uploadedImages.length > 0) {
  //         const imageData = uploadedImages.map((image, index) => ({
  //           productId: newProduct.id,
  //           publicId: image.public_id,
  //           url: image.secure_url,
  //           rank: index + 1
  //         }));

  //         await tx.productImage.createMany({
  //           data: imageData
  //         });
  //       }

  //       // Update category's products array if category is provided
  //       if (categoryId) {
  //         await tx.category.update({
  //           where: { id: categoryId },
  //           data: {
  //             Product: {
  //               connect: { id: newProduct.id }
  //             }
  //           }
  //         });
  //       }

  //       // Connect colors if provided
  //       if (colors && colors.length > 0) {
  //         const colorIds = Array.isArray(colors) ? colors : [colors];

  //         // Validate that all color IDs exist
  //         const existingColors = await tx.color.findMany({
  //           where: { id: { in: colorIds } },
  //           select: { id: true }
  //         });

  //         const existingColorIds = existingColors.map((color) => color.id);
  //         const invalidColorIds = colorIds.filter(
  //           (id) => !existingColorIds.includes(id)
  //         );

  //         if (invalidColorIds.length > 0) {
  //           throw new ValidationError(
  //             `Invalid color IDs: ${invalidColorIds.join(", ")}`
  //           );
  //         }

  //         await tx.product.update({
  //           where: { id: newProduct.id },
  //           data: {
  //             colors: {
  //               connect: colorIds.map((colorId) => ({ id: colorId }))
  //             }
  //           }
  //         });
  //       }

  //       // Return product with relations
  //       return await tx.product.findUnique({
  //         where: { id: newProduct.id },
  //         include: {
  //           category: true,
  //           subcategory: true,
  //           quality: true,
  //           colors: true,
  //           images: true
  //         }
  //       });
  //     });

  //     return product;
  //   } catch (error) {
  //     // Clean up uploaded images if product creation fails
  //     if (uploadedImages.length > 0) {
  //       await deleteMultipleImages(uploadedImages.map((img) => img.public_id));
  //     }
  //     throw error;
  //   } finally {
  //     // Clean up temp files
  //     this.cleanupTempFiles(filePaths);
  //   }
  // }

  // private static cleanupTempFiles(filePaths: string[]) {
  //   if (!filePaths) return;

  //   for (const filePath of filePaths) {
  //     try {
  //       if (fs.existsSync(filePath)) {
  //         fs.unlinkSync(filePath);
  //       }
  //     } catch (error) {
  //       console.error(`Error deleting temporary file ${filePath}:`, error);
  //     }
  //   }
  // }

  static async getAll() {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        subcategory: true,
        quality: true,
        colors: true,
        images: {
          orderBy: { rank: "asc" }
        }
      }
    });
    return products;
  }

  static async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        subcategory: true,
        quality: true,
        colors: true,
        images: {
          orderBy: { rank: "asc" }
        }
      }
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    return product;
  }

  static async update(
    id: string,
    data: Partial<ProductCreateRequest>,
    files?: Express.Multer.File[]
  ) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true }
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    let uploadedImages: any[] = [];

    // Upload new images if files are provided
    if (files && files.length > 0) {
      try {
        const filePaths = files.map((file) => file.path);
        uploadedImages = await uploadMultipleImages(filePaths, "products");
      } catch (error) {
        throw new Error("Failed to upload images to Cloudinary");
      }
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Update product data
      const updated = await tx.product.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.shortDescription && {
            shortDescription: data.shortDescription
          }),
          ...(data.detailedDescription && {
            detailedDescription: data.detailedDescription
          }),
          ...(data.price && { price: parseFloat(data.price.toString()) }),
          ...(data.originalPrice && {
            originalPrice: parseFloat(data.originalPrice.toString())
          }),
          ...(data.discount !== undefined && {
            discount: parseFloat(data.discount.toString())
          }),
          ...(data.tax !== undefined && {
            tax: parseFloat(data.tax.toString())
          }),
          ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
          ...(data.subcategoryId !== undefined && {
            subcategoryId: data.subcategoryId
          }),
          ...(data.qualityId !== undefined && { qualityId: data.qualityId })
        }
      });

      // Handle new images
      if (uploadedImages.length > 0) {
        // Delete old images from Cloudinary
        if (product.images.length > 0) {
          const publicIds = product.images.map((img) => img.publicId);
          await deleteMultipleImages(publicIds);
        }

        // Delete old image records
        await tx.productImage.deleteMany({
          where: { productId: id }
        });

        // Create new image records
        const imageData = uploadedImages.map((image, index) => ({
          productId: id,
          publicId: image.public_id,
          url: image.secure_url,
          rank: index + 1
        }));

        await tx.productImage.createMany({
          data: imageData
        });
      }

      // Update colors if provided
      if (data.colors) {
        const colorIds = Array.isArray(data.colors)
          ? data.colors
          : [data.colors];

        // Validate that all color IDs exist
        const existingColors = await tx.color.findMany({
          where: { id: { in: colorIds } },
          select: { id: true }
        });

        const existingColorIds = existingColors.map((color) => color.id);
        const invalidColorIds = colorIds.filter(
          (id) => !existingColorIds.includes(id)
        );

        if (invalidColorIds.length > 0) {
          throw new ValidationError(
            `Invalid color IDs: ${invalidColorIds.join(", ")}`
          );
        }

        await tx.product.update({
          where: { id },
          data: {
            colors: {
              set: colorIds.map((colorId) => ({ id: colorId }))
            }
          }
        });
      }

      return await tx.product.findUnique({
        where: { id },
        include: {
          category: true,
          subcategory: true,
          quality: true,
          colors: true,
          images: {
            orderBy: { rank: "asc" }
          }
        }
      });
    });

    return updatedProduct;
  }

  static async delete(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true }
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Delete images from Cloudinary
    if (product.images.length > 0) {
      const publicIds = product.images.map((img) => img.publicId);
      await deleteMultipleImages(publicIds);
    }

    // Delete product (images will be deleted due to cascade)
    await prisma.product.delete({
      where: { id }
    });
  }
}
