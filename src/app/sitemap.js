const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

async function getProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/product`, {
      next: { revalidate: 86400 }, // Cache for 1 day
    });
    if (!response.ok) return [];
    const data = await response.json();
    // Filter out products with invalid slugs
    return (data.data || []).filter(
      (product) =>
        product.slug &&
        typeof product.slug === "string" &&
        product.slug.trim() !== ""
    );
  } catch (error) {
    console.error("Error fetching products for sitemap:", error);
    return [];
  }
}

async function getCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      next: { revalidate: 86400 }, // Cache for 1 day
    });
    if (!response.ok) return [];
    const data = await response.json();
    // Filter out categories with invalid seoTitle
    return (data.data || []).filter(
      (category) =>
        category.seoTitle &&
        typeof category.seoTitle === "string" &&
        category.seoTitle.trim() !== ""
    );
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error);
    return [];
  }
}

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
    url,
    lastModified: getValidDate(lastModified),
    changeFrequency,
    priority,
  };
}

export default async function sitemap() {
  const baseUrl = "https://alaml-theta.vercel.app";

  try {
    const [products, categories] = await Promise.all([
      getProducts(),
      getCategories(),
    ]);

    const staticRoutes = [
      // Homepage
      {
        url: baseUrl,
        lastModified: new Date().toISOString(),
        changeFrequency: "weekly",
        priority: 1.0,
      },

      // Products Listing
      {
        url: `${baseUrl}/products`,
        lastModified: new Date().toISOString(),
        changeFrequency: "daily",
        priority: 0.9,
      },

      // Shopping Pages
      {
        url: `${baseUrl}/cart`,
        lastModified: new Date().toISOString(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: `${baseUrl}/checkout`,
        lastModified: new Date().toISOString(),
        changeFrequency: "monthly",
        priority: 0.7,
      },

      // Customer Pages
      {
        url: `${baseUrl}/order`,
        lastModified: new Date().toISOString(),
        changeFrequency: "weekly",
        priority: 0.6,
      },
      {
        url: `${baseUrl}/order-success`,
        lastModified: new Date().toISOString(),
        changeFrequency: "monthly",
        priority: 0.5,
      },

      // Custom Services
      {
        url: `${baseUrl}/custom-order`,
        lastModified: new Date().toISOString(),
        changeFrequency: "monthly",
        priority: 0.7,
      },

      // Contact & Support
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date().toISOString(),
        changeFrequency: "monthly",
        priority: 0.6,
      },
    ];

    // Dynamic category routes - safely handles ANY special characters
    const categoryRoutes = categories
      .map((category) =>
        createSitemapEntry(
          `${baseUrl}/categories`,
          category.seoTitle,
          category.updatedAt || category.createdAt,
          "weekly",
          0.8
        )
      )
      .filter(Boolean); // Remove null entries (invalid URLs)

    // Dynamic product routes - safely handles ANY special characters
    const productRoutes = products
      .map((product) =>
        createSitemapEntry(
          `${baseUrl}/products`,
          product.slug,
          product.updatedAt || product.createdAt,
          "weekly",
          0.8
        )
      )
      .filter(Boolean); // Remove null entries (invalid URLs)

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch (error) {
    console.error("Error generating sitemap:", error);

    // Return minimal sitemap if there's an error
    return [
      {
        url: baseUrl,
        lastModified: new Date().toISOString(),
        changeFrequency: "weekly",
        priority: 1.0,
      },
    ];
  }
}
