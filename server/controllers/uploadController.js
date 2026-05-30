import { Readable } from 'stream';
import { getCloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

const uploadFromBuffer = (buffer) => {
  const cloudinary = getCloudinary();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER || 'smart-canteen',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
};

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
export const uploadToCloudinary = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided' });
  }

  if (!isCloudinaryConfigured()) {
    return res.status(500).json({
      message:
        'Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to server/.env',
    });
  }

  try {
    const result = await uploadFromBuffer(req.file.buffer);
    res.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Cloudinary upload failed' });
  }
};
