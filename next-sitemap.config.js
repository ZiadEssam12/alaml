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
  // Set a high sitemapSize to keep all URLs in a single sitemap.xml
  sitemapSize: 100000,
  // Additional paths for dynamic routes (products and categories)
  additionalPaths: async (config) => {
    const result = [];

    // Dynamic import of Prisma for proper ES6 module support
    const { default: prisma } = await import("./src/lib/prisma.js");

    console.log(
      "Next-sitemap: Starting to fetch products and categories from database"
    );

    // Comprehensive URL encoding for sitemap XML - handles ALL special characters
    function encodeUrlPath(path) {
      if (!path || typeof path !== "string") {
        return "";
      }

      // Remove any leading/trailing whitespace
      path = path.trim();

      // Convert to string and handle edge cases
      if (path === "") return "";

      // Use encodeURIComponent for most characters, then handle XML-specific issues
      let encoded = encodeURIComponent(path);

      // Handle characters that encodeURIComponent doesn't encode but could cause issues
      const xmlUnsafeChars = {
        // XML reserved characters
        "&": "%26",
        "<": "%3C",
        ">": "%3E",
        '"': "%22",
        "'": "%27",

        // URI reserved characters that might not be encoded
        ":": "%3A",
        "/": "%2F",
        "?": "%3F",
        "#": "%23",
        "[": "%5B",
        "]": "%5D",
        "@": "%40",

        // Additional problematic characters
        "!": "%21",
        $: "%24",
        "(": "%28",
        ")": "%29",
        "*": "%2A",
        "+": "%2B",
        ",": "%2C",
        ";": "%3B",
        "=": "%3D",

        // Unicode and extended characters
        " ": "%20", // Space (sometimes not encoded properly)
        "|": "%7C",
        "\\": "%5C",
        "^": "%5E",
        "`": "%60",
        "{": "%7B",
        "}": "%7D",
        "~": "%7E",
      };

      // Replace any remaining unsafe characters
      for (const [char, encoded_char] of Object.entries(xmlUnsafeChars)) {
        encoded = encoded.replace(new RegExp("\\" + char, "g"), encoded_char);
      }

      // Handle any remaining non-ASCII characters (Arabic, emoji, etc.)
      encoded = encoded.replace(/[^\x00-\x7F]/g, function (char) {
        return encodeURIComponent(char);
      });

      // Ensure all percent-encoded values are uppercase (RFC standard)
      encoded = encoded.replace(/%[0-9a-f]{2}/gi, function (match) {
        return match.toUpperCase();
      });

      // Final validation - remove any remaining problematic characters
      encoded = encoded.replace(/[^A-Za-z0-9\-_.~%]/g, "");

      return encoded;
    }

    // Helper function to ensure valid date
    function getValidDate(dateString) {
      if (!dateString) return new Date().toISOString();

      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return new Date().toISOString();
      }

      return date.toISOString();
    }

    // Validate URL for sitemap compliance
    function isValidSitemapUrl(url) {
      try {
        // Check URL length (Google limit: 2048 characters)
        if (!url || url.length > 2048) return false;

        // Check if it's a valid URL structure
        new URL(url);

        // Check for XML-breaking characters after encoding
        const xmlBreakers = ["<", ">", '"', "'", "&"];
        return !xmlBreakers.some((char) => url.includes(char));
      } catch (error) {
        return false;
      }
    }

    // Create a safe sitemap entry
    function createSitemapEntry(
      baseUrl,
      path,
      lastModified,
      changeFrequency = "weekly",
      priority = 0.8
    ) {
      const encodedPath = encodeUrlPath(path);
      const url = `${baseUrl}/${encodedPath}`;

      // Validate the URL before adding
      if (!isValidSitemapUrl(url)) {
        console.warn(`Invalid URL skipped in sitemap: ${url}`);
        return null;
      }

      return {
        loc: `/${encodedPath}`,
        lastmod: getValidDate(lastModified),
        changefreq: changeFrequency,
        priority,
      };
    }

    try {
      // Fetch products directly from database
      const products = await prisma.product.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true, createdAt: true },
      });
      console.log("Next-sitemap: Products found:", products.length);

      // Fetch categories directly from database
      const categories = await prisma.category.findMany({
        where: { status: "active" },
        select: { seoTitle: true, updatedAt: true, createdAt: true },
      });
      console.log("Next-sitemap: Categories found:", categories.length);

      // Add static routes
      const staticRoutes = [
        // Homepage
        {
          loc: "/",
          lastmod: new Date().toISOString(),
          changefreq: "weekly",
          priority: 1.0,
        },
        // Products Listing
        {
          loc: "/products",
          lastmod: new Date().toISOString(),
          changefreq: "daily",
          priority: 0.9,
        },
        // Shopping Pages
        {
          loc: "/cart",
          lastmod: new Date().toISOString(),
          changefreq: "monthly",
          priority: 0.7,
        },
        {
          loc: "/checkout",
          lastmod: new Date().toISOString(),
          changefreq: "monthly",
          priority: 0.7,
        },
        // Customer Pages
        {
          loc: "/order",
          lastmod: new Date().toISOString(),
          changefreq: "weekly",
          priority: 0.6,
        },
        {
          loc: "/order-success",
          lastmod: new Date().toISOString(),
          changefreq: "monthly",
          priority: 0.5,
        },
        // Custom Services
        {
          loc: "/custom-order",
          lastmod: new Date().toISOString(),
          changefreq: "monthly",
          priority: 0.7,
        },
        // Contact & Support
        {
          loc: "/contact",
          lastmod: new Date().toISOString(),
          changefreq: "monthly",
          priority: 0.6,
        },
      ];

      result.push(...staticRoutes);
      console.log(
        "Next-sitemap: Added static routes, total so far:",
        result.length
      );

      // Add category routes - safely handles ANY special characters
      categories.forEach((category) => {
        const entry = createSitemapEntry(
          "https://alaml-theta.vercel.app",
          `categories/${category.seoTitle}`,
          category.updatedAt || category.createdAt,
          "weekly",
          0.8
        );
        if (entry) result.push(entry);
      });
      console.log(
        "Next-sitemap: Added category routes, total so far:",
        result.length
      );

      // Add product routes - safely handles ANY special characters
      products.forEach((product) => {
        const entry = createSitemapEntry(
          "https://alaml-theta.vercel.app",
          `products/${product.slug}`,
          product.updatedAt || product.createdAt,
          "weekly",
          0.8
        );
        if (entry) result.push(entry);
      });
      console.log(
        "Next-sitemap: Added product routes, total now:",
        result.length
      );
    } catch (error) {
      console.error("Next-sitemap: Error fetching data from database:", error);
    }

    return result;
  },
  // Exclude dashboard routes
  exclude: ["/dashboard/**"],
  // Output directory
  outDir: "public",
};
