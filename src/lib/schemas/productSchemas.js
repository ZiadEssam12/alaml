/**
 * Generate Product JSON-LD Schema
 * @param {Object} product - Product object with name, description, price, etc.
 * @returns {Object} Product schema for JSON-LD
 */
export function generateProductSchema(product) {
  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.imageUrls,
    description: product.description,
    brand: {
      "@type": "Brand",
      name: "مكتبة الأمل",
    },
    offers: {
      "@type": "Offer",
      url: `https://alaml-theta.vercel.app/products/${product.slug}`,
      priceCurrency: "EGP",
      price: product.price.toString(),
      availability:
        product.stockQuantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "مكتبة الأمل",
        url: "https://alaml-theta.vercel.app",
      },
    },
    category: product.category?.name || "أدوات مكتبية",
    sku: product.id,
  };

  // Add rating if available
  if (product.averageRating > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.averageRating.toFixed(1),
      ratingCount: product.ratingCount,
      reviewCount: product.ratingCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

/**
 * Generate Organization JSON-LD Schema
 * @returns {Object} Organization schema for JSON-LD
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "مكتبة الأمل",
    url: "https://alaml-theta.vercel.app",
    logo: "https://alaml-theta.vercel.app/logo.png",
    sameAs: [
      "https://www.facebook.com/alaml-store",
      "https://www.instagram.com/alaml_store",
      "https://twitter.com/alaml_store",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      availableLanguage: ["ar"],
    },
  };
}

/**
 * Generate BreadcrumbList JSON-LD Schema
 * @param {Object} product - Product object with category and slug
 * @returns {Object} BreadcrumbList schema for JSON-LD
 */
export function generateBreadcrumbSchema(product) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "الرئيسية",
        item: "https://alaml-theta.vercel.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "المنتجات",
        item: "https://alaml-theta.vercel.app/products",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.category?.name || "قرطاسية",
        item: `https://alaml-theta.vercel.app/categories/${product.category?.seoTitle}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: `https://alaml-theta.vercel.app/products/${product.slug}`,
      },
    ],
  };
}

/**
 * Generate CollectionPage JSON-LD Schema (for products listing)
 * @param {Array} products - Array of products
 * @param {number} totalProducts - Total number of products
 * @returns {Object} CollectionPage schema for JSON-LD
 */
export function generateCollectionPageSchema(products, totalProducts) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "جميع المنتجات | مكتبة الأمل",
    description:
      "تصفح جميع منتجاتنا من الأدوات المكتبية والقرطاسية الإلكترونية",
    url: "https://alaml-theta.vercel.app/products",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: totalProducts,
      itemListElement: products.slice(0, 12).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://alaml-theta.vercel.app/products/${product.slug}`,
        name: product.name,
        image: product.imageUrls[0],
        offers: {
          "@type": "Offer",
          priceCurrency: "EGP",
          price: product.price.toString(),
          availability:
            product.stockQuantity > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
        },
      })),
    },
  };
}

/**
 * Generate BreadcrumbList Schema for Products Page
 * @returns {Object} BreadcrumbList schema for JSON-LD
 */
export function generateProductsPageBreadcrumbSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "الرئيسية",
        item: "https://alaml-theta.vercel.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "المنتجات",
        item: "https://alaml-theta.vercel.app/products",
      },
    ],
  };
}
