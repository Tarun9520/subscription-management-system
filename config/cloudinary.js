const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a base64 / data URI image string to Cloudinary.
 * @param {string} fileStr - data URI or remote url
 * @param {string} folder
 */
const uploadImage = async (fileStr, folder = "subscription-platform") => {
  const result = await cloudinary.uploader.upload(fileStr, {
    folder,
    resource_type: "image",
  });
  return { url: result.secure_url, publicId: result.public_id };
};

const deleteImage = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
};

module.exports = { cloudinary, uploadImage, deleteImage };
