export const isCloudinaryUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.hostname === 'res.cloudinary.com';
  } catch {
    return false;
  }
};

export const assertCloudinaryImage = (image) => {
  if (!image?.trim()) {
    const error = new Error('Image URL is required');
    error.statusCode = 400;
    throw error;
  }
  if (!isCloudinaryUrl(image)) {
    const error = new Error('Image URL is invalid');
    error.statusCode = 400;
    throw error;
  }
  return image.trim();
};
