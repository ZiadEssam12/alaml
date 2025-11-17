/** @type {import('next-sitemap').IConfig} */

import prisma from "./src/lib/prisma.js";

const BASE_URL = "https://alaml-theta.vercel.app";
const NOW = new Date().toISOString();

const STATIC_ROUTES = [
  { loc: "/", changefreq: "weekly", priority: 1.0 },
  { loc: "/products", changefreq: "daily", priority: 0.9 },
  { loc: "/cart", changefreq: "monthly", priority: 0.7 },
  { loc: "/checkout", changefreq: "monthly", priority: 0.7 },
  { loc: "/order", changefreq: "weekly", priority: 0.6 },
  { loc: "/order-success", changefreq: "monthly", priority: 0.5 },
  { loc: "/custom-order", changefreq: "monthly", priority: 0.7 },
  { loc: "/contact", changefreq: "monthly", priority: 0.6 },
];

export default {
  siteUrl: BASE_URL,
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/", disallow: ["/dashboard"] }],
  },
  sitemapSize: 100000,
  exclude: ["/dashboard/**"],
  outDir: "public",
  additionalPaths: async () => {
    const result = [];

    try {
      // Fetch active products and categories
      const [products, categories] = await Promise.all([
        prisma.product.findMany({
          where: { isActive: true },
          select: { slug: true, updatedAt: true },
        }),
        prisma.category.findMany({
          where: { status: "active" },
          select: { seoTitle: true, updatedAt: true },
        }),
      ]);

      // Add static routes with lastmod
      result.push(
        ...STATIC_ROUTES.map((route) => ({
          ...route,
          lastmod: NOW,
        }))
      );

      // Add category routes
      result.push(
        ...categories.map((cat) => ({
          loc: `/categories/${encodeURIComponent(cat.seoTitle)}`,
          lastmod: cat.updatedAt?.toISOString() || NOW,
          changefreq: "weekly",
          priority: 0.8,
        }))
      );

      // Add product routes
      result.push(
        ...products.map((prod) => ({
          loc: `/products/${encodeURIComponent(prod.slug)}`,
          lastmod: prod.updatedAt?.toISOString() || NOW,
          changefreq: "weekly",
          priority: 0.8,
        }))
      );

      console.log(
        `Sitemap generated: ${result.length} URLs (${STATIC_ROUTES.length} static + ${categories.length} categories + ${products.length} products)`
      );
    } catch (error) {
      console.error("Sitemap generation error:", error);
    }

    return result;
  },
};
