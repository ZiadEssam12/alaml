/**
 * Generate a tiny blurred placeholder using Cloudinary transformations
 * This works on both client and server without heavy dependencies
 */
export function generateBlurPlaceholder(cloudinaryUrl) {
  if (!cloudinaryUrl) return null;

  const uploadIndex = cloudinaryUrl.indexOf("/upload/");
  if (uploadIndex === -1) return cloudinaryUrl;

  const baseUrl = cloudinaryUrl.substring(0, uploadIndex + 8);
  const imagePath = cloudinaryUrl.substring(uploadIndex + 8);

  return `${baseUrl}f_auto,q_auto,e_blur:1000,w_12/${imagePath}`;
}
