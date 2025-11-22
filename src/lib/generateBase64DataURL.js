/**
 * Generate a base64 data URL from an image URL
 * Source - https://stackoverflow.com/a (Modified)
 * License - CC BY-SA 4.0
 */
export async function generateBlurPlaceholder(cloudinaryUrl) {
  if (!cloudinaryUrl) return null;

  try {
    // Use a smaller/blurred version from Cloudinary to reduce fetch size
    const uploadIndex = cloudinaryUrl.indexOf("/upload/");
    let fetchUrl = cloudinaryUrl;

    if (uploadIndex !== -1) {
      const baseUrl = cloudinaryUrl.substring(0, uploadIndex + 8);
      const imagePath = cloudinaryUrl.substring(uploadIndex + 8);
      // Fetch tiny, blurred version (10px wide, heavily blurred)
      fetchUrl = `${baseUrl}e_blur:500,q_100,w_100/${imagePath}`;
    }

    const data = await fetch(fetchUrl);
    const blob = await data.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
    });
  } catch (error) {
    console.error("Failed to generate blur placeholder:", error);
    return null;
  }
}
