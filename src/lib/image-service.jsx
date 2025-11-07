class ImageService {
  constructor() {
    this.config = {
      cloudName:
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "maktabat-alamal",
      apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "",
      apiSecret: process.env.CLOUDINARY_API_SECRET || "",
    };
  }

  async uploadImage(file, folder = "products") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "maktabat_alamal");
    formData.append("folder", folder);
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.config.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      return data.secure_url;
      //      return {
      //   secureUrl: data.secure_url,
      //   publicId: data.public_id,
      // };
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("فشل في رفع الصورة");
    }
  }

  // إنشاء رابط صورة محسن
  generateOptimizedUrl(publicId, transformations = {}) {
    const {
      width = 400,
      height = 400,
      quality = 80,
      format = "webp",
      crop = "fill",
    } = transformations;

    return `https://res.cloudinary.com/${this.config.cloudName}/image/upload/w_${width},h_${height},c_${crop},q_${quality},f_${format}/${publicId}`;
  }

  generateBlurredPlaceholder(publicId) {
    return `https://res.cloudinary.com/${this.config.cloudName}/image/upload/e_blur:200,q_10/${publicId}`;
  }

  generateResponsiveUrls(publicId) {
    return {
      thumbnail: this.generateOptimizedUrl(publicId, {
        width: 150,
        height: 150,
      }),
      small: this.generateOptimizedUrl(publicId, { width: 300, height: 300 }),
      medium: this.generateOptimizedUrl(publicId, { width: 600, height: 600 }),
      large: this.generateOptimizedUrl(publicId, { width: 800, height: 800 }),
      placeholder: this.generateBlurredPlaceholder(publicId),
      original: `https://res.cloudinary.com/${this.config.cloudName}/image/upload/${publicId}`,
    };
  }

  extractPublicId(url) {
    if (!url || typeof url !== "string") return "";
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
    return matches ? matches[1] : "";
  }
}

export const imageService = new ImageService();
