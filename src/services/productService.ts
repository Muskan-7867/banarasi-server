import { ProductCreateRequest } from "../types/index";
import prisma from "../config/database";
import {
  deleteMultipleImages,
  uploadMultipleFiles,
  uploadFile
} from "../utils/cloudinary";
import { ConflictError, NotFoundError, ValidationError } from "../utils/errors";
import fs from "fs/promises";

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
      categoryName,
      subcategoryName,
      qualityName,
      sizeName,
      colors,
      tag
    } = data;

    if (
      !name ||
      !shortDescription ||
      !detailedDescription ||
      price === undefined ||
      originalPrice === undefined
    ) {
      throw new ValidationError("Missing required fields");
    }

    const existingProduct = await prisma.product.findFirst({ where: { name } });
    if (existingProduct)
      throw new ConflictError("Product with this name already exists");

    const imageFiles =
      files?.filter((f) => f.mimetype.startsWith("image/")) || [];
    const videoFile =
      files?.find((f) => f.mimetype.startsWith("video/")) || null;

    let uploadedImages: { public_id: string; secure_url: string }[] = [];
    let uploadedVideo: { public_id: string; secure_url: string } | null = null;

    try {
      // Upload images
      if (imageFiles.length) {
        const filePaths = imageFiles.map((f) => f.path);
        uploadedImages = await uploadMultipleFiles(filePaths, "products");

        // Clean temp files
        await Promise.all(filePaths.map((path) => fs.unlink(path)));
      }

      // Upload video
      if (videoFile) {
        uploadedVideo = await uploadFile(videoFile.path, "products");

        // Clean temp file
        await fs.unlink(videoFile.path);
      }
    } catch (err) {
      // In case upload fails, try to cleanup temp files
      await Promise.allSettled([
        ...(imageFiles || []).map((f) => fs.unlink(f.path)),
        videoFile ? fs.unlink(videoFile.path) : Promise.resolve()
      ]);
      throw err;
    }

    return await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          name,
          shortDescription,
          detailedDescription,
          price: Number(price),
          originalPrice: Number(originalPrice),
          discount: discount ? Number(discount) : 0,
          tax: tax ? Number(tax) : 0,
          categoryName: categoryName || null,
          subcategoryName: subcategoryName || null,
          qualityName: qualityName || null,
          sizeName: sizeName || null,
          tag
        }
      });

      if (uploadedImages.length > 0) {
        await tx.productImage.createMany({
          data: uploadedImages.map((img, idx) => ({
            productId: newProduct.id,
            publicId: img.public_id,
            url: img.secure_url,
            rank: idx + 1
          }))
        });
      }

      if (uploadedVideo) {
        await tx.productVideo.create({
          data: {
            productId: newProduct.id,
            publicId: uploadedVideo.public_id,
            url: uploadedVideo.secure_url
          }
        });
      }

      if (colors?.length) {
        const colorList = (Array.isArray(colors) ? colors : [colors]).map((c) =>
          c.includes(",") ? c.split(",")[1].trim() : c.trim()
        );

        const existingColors = await tx.color.findMany({
          where: { name: { in: colorList } }
        });
        const existingNames = existingColors.map((c) => c.name);
        const missingNames = colorList.filter(
          (n) => !existingNames.includes(n)
        );

        if (missingNames.length > 0) {
          const newColors = await Promise.all(
            missingNames.map((name) => tx.color.create({ data: { name } }))
          );
          existingColors.push(...newColors);
        }

        await tx.product.update({
          where: { id: newProduct.id },
          data: {
            colors: { connect: existingColors.map((c) => ({ id: c.id })) }
          }
        });
      }

      return tx.product.findUnique({
        where: { id: newProduct.id },
        include: {
          colors: true,
          images: { orderBy: { rank: "asc" } },
          videos: true
        }
      });
    });
  }

static async getByTag(
  tag: string,
  filters?: {
    size?: string;
    color?: string;
    minPrice?: number;
    maxPrice?: number;
  }
) {
  if (!tag) throw new Error("Tag is required");

  const where: any = {
    tag: { equals: tag.toLowerCase() },
  };

  if (filters?.size) {
    where.sizeName = { equals: filters.size.toLowerCase() };
  }

  if (filters?.color) {
    where.colors = {
      some: { name: { equals: filters.color.toLowerCase() } },
    };
  }

  if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
  }

  return prisma.product.findMany({
    where,
    include: {
      colors: true,
      images: { orderBy: { rank: "asc" } },
      videos: true,
    },
    orderBy: { createdAt: "desc" },
  });
}


  static async getCartProductsByIds(ids: string[]) {
    if (!ids || !Array.isArray(ids)) {
      throw new Error("IDs must be provided as an array");
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: ids }
      },
      include: {
        colors: true,
        images: true
      }
    });

    return products;
  }

  static async getAll(
    category?: string,
    search?: string,
    page?: number,
    limit?: number
  ) {
    const where: any = {};

    if (category) {
      where.categoryName = category; // Changed from categoryId to categoryName
    }

    if (search) {
      where.name = { contains: search };
    }

    // Set default values for pagination
    const pageNumber = page || 1;
    const pageSize = limit || 10;

    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const [products, count] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        include: {
          colors: true,
          images: { orderBy: { rank: "asc" } },
          videos: true // Added videos relation
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.product.count({ where })
    ]);

    return {
      products,
      count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: pageNumber,
      pageSize
    };
  }

  static async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        colors: true,
        images: {
          orderBy: { rank: "asc" }
        },
        videos: true // Added videos to include
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
      include: {
        images: true,
        videos: true // Changed from video to videos
      }
    });

    if (!product) throw new NotFoundError("Product not found");

    let uploadedImages: any[] = [];
    let uploadedVideo: { public_id: string; secure_url: string } | null = null;

    if (files && files.length > 0) {
      // Separate images and video
      const imageFiles = files.filter((f) => f.mimetype.startsWith("image/"));
      const videoFile = files.find((f) => f.mimetype.startsWith("video/"));

      // Upload images
      if (imageFiles.length > 0) {
        const filePaths = imageFiles.map((f) => f.path);
        try {
          uploadedImages = await uploadMultipleFiles(filePaths, "products");
        } catch {
          throw new Error("Failed to upload images to Cloudinary");
        }
      }

      // Upload video
      if (videoFile) {
        try {
          uploadedVideo = await uploadFile(videoFile.path, "products");

          // Delete old video if exists
          if (product.videos && product.videos.length > 0) {
            await deleteMultipleImages(product.videos.map((v) => v.publicId));
            await prisma.productVideo.deleteMany({
              where: { productId: id }
            });
          }
        } catch {
          throw new Error("Failed to upload video to Cloudinary");
        }
      }
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Update product fields
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
          ...(data.price !== undefined && { price: Number(data.price) }),
          ...(data.originalPrice !== undefined && {
            originalPrice: Number(data.originalPrice)
          }),
          ...(data.discount !== undefined && {
            discount: Number(data.discount)
          }),
          ...(data.tax !== undefined && { tax: Number(data.tax) }),
          ...(data.categoryName !== undefined && {
            categoryName: data.categoryName
          }),
          ...(data.subcategoryName !== undefined && {
            subcategoryName: data.subcategoryName
          }),
          ...(data.qualityName !== undefined && {
            qualityName: data.qualityName
          }),
          ...(data.sizeName !== undefined && { sizeName: data.sizeName }),
          ...(data.tag !== undefined && { tag: data.tag })
        }
      });

      // Handle images
      if (uploadedImages.length > 0) {
        if (product.images.length > 0) {
          const publicIds = product.images.map((img) => img.publicId);
          await deleteMultipleImages(publicIds);
        }
        await tx.productImage.deleteMany({ where: { productId: id } });

        await tx.productImage.createMany({
          data: uploadedImages.map((image, idx) => ({
            productId: id,
            publicId: image.public_id,
            url: image.secure_url,
            rank: idx + 1
          }))
        });
      }

      // Handle video
      if (uploadedVideo) {
        await tx.productVideo.create({
          data: {
            productId: id,
            publicId: uploadedVideo.public_id,
            url: uploadedVideo.secure_url
          }
        });
      }

      // Handle colors
      if (data.colors) {
        const colorList = Array.isArray(data.colors)
          ? data.colors
          : [data.colors];

        const existingColors = await tx.color.findMany({
          where: { name: { in: colorList } }
        });
        const existingNames = existingColors.map((c) => c.name);

        const missingNames = colorList.filter(
          (n) => !existingNames.includes(n)
        );
        const newColors = await Promise.all(
          missingNames.map((name) => tx.color.create({ data: { name } }))
        );

        const allColors = [...existingColors, ...newColors];

        await tx.product.update({
          where: { id },
          data: {
            colors: {
              set: [], // remove old associations
              connect: allColors.map((c) => ({ id: c.id }))
            }
          }
        });
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          colors: true,
          images: { orderBy: { rank: "asc" } },
          videos: true // Changed from video to videos
        }
      });
    });

    return updatedProduct;
  }

  static async delete(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        videos: true // Include videos to delete them from Cloudinary
      }
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Delete images from Cloudinary
    if (product.images.length > 0) {
      const publicIds = product.images.map((img) => img.publicId);
      await deleteMultipleImages(publicIds);
    }

    // Delete videos from Cloudinary
    if (product.videos.length > 0) {
      const videoPublicIds = product.videos.map((video) => video.publicId);
      await deleteMultipleImages(videoPublicIds);
    }

    // Delete product (images and videos will be deleted due to cascade)
    await prisma.product.delete({
      where: { id }
    });
  }

  static async getByCategory(
    category: string,
    filters: {
      size?: string;
      color?: string;
      minPrice?: number;
      maxPrice?: number;
      page?: number;
      limit?: number;
    }
  ) {
    const where: any = {
      categoryName: category
    };

    // size filter
    if (filters.size) {
      where.sizeName = filters.size;
    }

    // color filter (relation check)
    if (filters.color) {
      where.colors = { some: { name: filters.color } };
    }

    // price filters
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined)
        where.price.gte = Number(filters.minPrice);
      if (filters.maxPrice !== undefined)
        where.price.lte = Number(filters.maxPrice);
    }

    // pagination defaults
    const page = filters.page || 1;
    const limit = filters.limit || 16;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          colors: true,
          images: { orderBy: { rank: "asc" } },
          videos: true
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.product.count({ where })
    ]);

    return {
      products,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      pageSize: limit
    };
  }
}
