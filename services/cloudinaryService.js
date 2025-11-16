import { v2 as cloudinaryService } from "cloudinary";

cloudinaryService.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ----------------- IMAGE -----------------

// Upload an image
export const uploadImage = async (filePath, folder = "default") => {
  try {
    const result = await cloudinaryService.uploader.upload(filePath, {
      folder,
      resource_type: "image",
    });
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return { success: false, error };
  }
};

// Delete an image by public_id
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinaryService.uploader.destroy(publicId, {
      resource_type: "image",
    });
    return { success: true, result };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return { success: false, error };
  }
};

// ----------------- VIDEO -----------------

// Upload a video
export const uploadVideo = async (filePath, folder = "default") => {
  try {
    const result = await cloudinaryService.uploader.upload(filePath, {
      folder,
      resource_type: "video",
    });
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary video upload error:", error);
    return { success: false, error };
  }
};

// Delete a video by public_id
export const deleteVideo = async (publicId) => {
  try {
    const result = await cloudinaryService.uploader.destroy(publicId, {
      resource_type: "video",
    });
    return { success: true, result };
  } catch (error) {
    console.error("Cloudinary video delete error:", error);
    return { success: false, error };
  }
};
