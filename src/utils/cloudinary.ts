import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
  secure: true,
});

const uploadImage = async (filePath: string, folder = "src/uploads") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: "auto",
    });
    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

const uploadFile = async (filePath:string, folder = "src/uploads") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto", 
    });
    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

const uploadMultipleFiles = async (filePaths:string[], folder = "src/uploads") => {
  try {
    const uploadPromises = filePaths.map((filePath) =>
      uploadFile(filePath, folder)
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading multiple files:", error);
    throw error;
  }
};


const uploadMultipleImages = async (
  filePaths: string[],
  folder = "src/uploads"
) => {
  try {
    const uploadPromises = filePaths.map((filePath) =>
      uploadImage(filePath, folder)
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    throw error;
  }
};



const deleteImage = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(result);
    return result;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};

const deleteMultipleImages = async (data: string[]) => {
  try {
    const deletePromises = data.map((publicId) => deleteImage(publicId));
    return await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting multiple images:", error);
    throw error;
  }
};
export { uploadImage, uploadMultipleFiles, uploadFile, deleteImage, deleteMultipleImages };
