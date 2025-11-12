/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://alaml-theta.vercel.app",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard"],
      },
    ],
  },
  // Additional paths for dynamic routes (products and categories)
  additionalPaths: async (config) => {
    const result = [];
    const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

    try {
      // Fetch products
      const productsRes = await fetch(`${API_BASE_URL}/product`, {
        next: { revalidate: 86400 },
      });
      const productsData = productsRes.ok
        ? await productsRes.json()
        : { data: [] };
      const products = (productsData.data || []).filter(
        (product) =>
          product.slug &&
          typeof product.slug === "string" &&
          product.slug.trim() !== ""
      );

      // Fetch categories
      const categoriesRes = await fetch(`${API_BASE_URL}/categories`, {
        next: { revalidate: 86400 },
      });
      const categoriesData = categoriesRes.ok
        ? await categoriesRes.json()
        : { data: [] };
      const categories = (categoriesData.data || []).filter(
        (category) =>
          category.seoTitle &&
          typeof category.seoTitle === "string" &&
          category.seoTitle.trim() !== ""
      );

      // Add product routes
      products.forEach((product) => {
        result.push({
          loc: `/products/${product.slug}`,
          changefreq: "weekly",
          priority: 0.8,
          lastmod: product.updatedAt || product.createdAt,
        });
      });

      // Add category routes
      categories.forEach((category) => {
        result.push({
          loc: `/categories/${category.seoTitle}`,
          changefreq: "weekly",
          priority: 0.8,
          lastmod: category.updatedAt || category.createdAt,
        });
      });
    } catch (error) {
      console.error("Error fetching data for sitemap:", error);
    }

    return result;
  },
  // Transform function for static routes
  transform: async (config, path) => {
    // Custom priorities and frequencies for different route types
    const pathConfig = {
      "/": { priority: 1.0, changefreq: "weekly" },
      "/products": { priority: 0.9, changefreq: "daily" },
      "/cart": { priority: 0.7, changefreq: "monthly" },
      "/checkout": { priority: 0.7, changefreq: "monthly" },
      "/order": { priority: 0.6, changefreq: "weekly" },
      "/order-success": { priority: 0.5, changefreq: "monthly" },
      "/custom-order": { priority: 0.7, changefreq: "monthly" },
      "/contact": { priority: 0.6, changefreq: "monthly" },
    };

    const routeConfig = pathConfig[path] || {
      priority: 0.8,
      changefreq: "weekly",
    };

    return {
      loc: path,
      changefreq: routeConfig.changefreq,
      priority: routeConfig.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
  // Exclude dashboard routes
  exclude: ["/dashboard/**"],
  // Output directory
  outDir: "public",
};
