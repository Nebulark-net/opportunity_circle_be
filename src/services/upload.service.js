import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import logger from '../utils/logger.js';

const uploadOnCloudinary = async (localFilePath, folder = 'general') => {
  try {
    if (!localFilePath) return null;
    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
      folder: `opportunity-circle/${folder}`,
    });
    // file has been uploaded successfully
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation failed
    logger.error(`Cloudinary Upload Error: ${error.message}`);
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.error(`Cloudinary Delete Error: ${error.message}`);
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
