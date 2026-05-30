import { v2 as cloudinary } from 'cloudinary';

let configured = false;

export const getCloudinaryConfig = () => ({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const isCloudinaryConfigured = () => {
  const { cloud_name, api_key, api_secret } = getCloudinaryConfig();
  return Boolean(cloud_name && api_key && api_secret);
};

export const getCloudinary = () => {
  const { cloud_name, api_key, api_secret } = getCloudinaryConfig();

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      'Cloudinary credentials missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in server/.env'
    );
  }

  if (!configured) {
    cloudinary.config({ cloud_name, api_key, api_secret });
    configured = true;
  }

  return cloudinary;
};

export default getCloudinary;
