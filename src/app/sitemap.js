const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

async function getProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/product`, {
      next: { revalidate: 86400 }, // Cache for 1 day
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
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
    return data.data || [];
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error);
    return [];
  }
}

export default async function sitemap() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE || "https://alaml-theta.vercel.app";
  const products = await getProducts();
  const categories = await getCategories();

  const staticRoutes = [
    // Homepage
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },

    // Products Listing
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },

    // Shopping Pages
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },

    // Customer Pages
    {
      url: `${baseUrl}/order`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/order-success`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },

    // Custom Services
    {
      url: `${baseUrl}/custom-order`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },

    // Contact & Support
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Dynamic category routes
  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: category.updatedAt
      ? new Date(category.updatedAt)
      : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Dynamic product routes
  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
