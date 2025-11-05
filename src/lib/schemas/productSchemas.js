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
 * Generate ProductsPageBreadcrumbList Schema for Products Page
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

/**
 * Generate LocalBusiness JSON-LD Schema (for Home page)
 * @returns {Object} LocalBusiness schema for JSON-LD
 */
export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "مكتبة الأمل",
    image: "https://alaml-theta.vercel.app/logo.png",
    description: "متجر إلكتروني متخصص في الأدوات المكتبية والقرطاسية",
    url: "https://alaml-theta.vercel.app",
    telephone: "+20-XXX-XXX-XXXX",
    address: {
      "@type": "PostalAddress",
      addressCountry: "EG",
      addressLocality: "مصر",
    },
    sameAs: [
      "https://www.facebook.com/alaml-store",
      "https://www.instagram.com/alaml_store",
      "https://twitter.com/alaml_store",
    ],
    priceRange: "EGP",
  };
}

/**
 * Generate WebSite JSON-LD Schema with SearchAction (for Home page)
 * @returns {Object} WebSite schema for JSON-LD
 */
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "مكتبة الأمل",
    url: "https://alaml-theta.vercel.app",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://alaml-theta.vercel.app/products?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    image: "https://alaml-theta.vercel.app/logo.png",
    description: "متجر إلكتروني متخصص في الأدوات المكتبية والقرطاسية",
  };
}

/**
 * Generate FAQPage JSON-LD Schema (for Home page)
 * @returns {Object} FAQPage schema for JSON-LD
 */
export function generateFAQSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "هل الشحن مجاني؟",
        acceptedAnswer: {
          "@type": "Answer",
          text: "نعم، نوفر شحن مجاني للطلبات التي تزيد عن 200 جنيه مصري.",
        },
      },
      {
        "@type": "Question",
        name: "هل هناك خدمة عملاء 24/7؟",
        acceptedAnswer: {
          "@type": "Answer",
          text: "نعم، فريق خدمة العملاء متاح لمساعدتك 24 ساعة يومياً، 7 أيام في الأسبوع.",
        },
      },
      {
        "@type": "Question",
        name: "هل تضمنون جودة المنتجات؟",
        acceptedAnswer: {
          "@type": "Answer",
          text: "نعم، نضمن 100% أصلية جودة أعلى لجميع منتجاتنا.",
        },
      },
    ],
  };
}

/**
 * Generate HomePageBreadcrumbList Schema
 * @returns {Object} BreadcrumbList schema for JSON-LD
 */
export function generateHomePageBreadcrumbSchema() {
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
    ],
  };
}

/**
 * Generate CategoryPage JSON-LD Schema
 * @param {Object} category - Category object with name, description
 * @param {Array} products - Array of products in the category
 * @returns {Object} CollectionPage schema for JSON-LD
 */
export function generateCategoryPageSchema(category, products) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} | مكتبة الأمل`,
    description:
      category.description || `تصفح جميع منتجات قسم ${category.name}`,
    url: `https://alaml-theta.vercel.app/categories/${category.seoTitle}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
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
 * Generate CategoryPage BreadcrumbList Schema
 * @param {Object} category - Category object with name and seoTitle
 * @returns {Object} BreadcrumbList schema for JSON-LD
 */
export function generateCategoryPageBreadcrumbSchema(category) {
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
        name: category.name,
        item: `https://alaml-theta.vercel.app/categories/${category.seoTitle}`,
      },
    ],
  };
}

/**
 * Generate ContactPoint JSON-LD Schema
 * @returns {Object} ContactPoint schema for JSON-LD
 */
export function generateContactPointSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPoint",
    contactType: "Customer Service",
    telephone: "+20-XXX-XXX-XXXX",
    email: "info@maktabat-alamal.com",
    availableLanguage: ["ar"],
    contactOption: "TollFree",
    areaServed: "EG",
    hoursAvailable: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "09:00",
      closes: "18:00",
    },
  };
}

/**
 * Generate Service JSON-LD Schema (for custom orders)
 * @returns {Object} Service schema for JSON-LD
 */
export function generateServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "طلب مخصص | مكتبة الأمل",
    description:
      "خدمة الطلبات المخصصة للأدوات المكتبية والقرطاسية حسب مواصفات العميل",
    provider: {
      "@type": "Organization",
      name: "مكتبة الأمل",
      url: "https://alaml-theta.vercel.app",
    },
    serviceType: "Custom Order Service",
    areaServed: {
      "@type": "Country",
      name: "Egypt",
    },
    availableChannel: {
      "@type": "ServiceChannel",
      availableLanguage: "ar",
      serviceUrl: "https://alaml-theta.vercel.app/custom-order",
    },
  };
}

/**
 * Generate Order JSON-LD Schema
 * @param {Object} order - Order object with details
 * @returns {Object} Order schema for JSON-LD
 */
export function generateOrderSchema(order) {
  return {
    "@context": "https://schema.org",
    "@type": "Order",
    orderNumber: order.id,
    orderStatus:
      order.status === "delivered" ? "OrderDelivered" : "OrderProcessing",
    orderDate: order.createdAt,
    customer: {
      "@type": "Person",
      name: order.customerName,
      email: order.customerEmail,
      telephone: order.customerPhone,
    },
    seller: {
      "@type": "Organization",
      name: "مكتبة الأمل",
      url: "https://alaml-theta.vercel.app",
    },
    orderedItem: order.items.map((item) => ({
      "@type": "OrderItem",
      orderQuantity: item.quantity,
      orderedItem: {
        "@type": "Product",
        name: item.productName,
        offers: {
          "@type": "Offer",
          price: item.price.toString(),
          priceCurrency: "EGP",
        },
      },
    })),
    paymentMethod: {
      "@type": "PaymentMethod",
      name: order.paymentMethod,
    },
    orderTotal: {
      "@type": "MonetaryAmount",
      value: order.finalAmount,
      currency: "EGP",
    },
  };
}

/**
 * Generate Order Collection Page JSON-LD Schema
 * @param {Array} orders - Array of orders
 * @returns {Object} CollectionPage schema for orders
 */
export function generateOrderCollectionSchema(orders) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "الطلبات | مكتبة الأمل",
    description: "عرض جميع طلباتك في مكتبة الأمل",
    url: "https://alaml-theta.vercel.app/order",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: orders.length,
      itemListElement: orders.map((order, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://alaml-theta.vercel.app/order/${order.id}`,
        name: `طلب رقم ${order.id}`,
        description: `طلب بتاريخ ${order.createdAt} - الحالة: ${order.status}`,
      })),
    },
  };
}

/**
 * Generate Order Confirmation JSON-LD Schema
 * @param {string} orderNumber - Order number
 * @returns {Object} Order confirmation schema
 */
export function generateOrderConfirmationSchema(orderNumber) {
  return {
    "@context": "https://schema.org",
    "@type": "Order",
    orderNumber: orderNumber,
    orderStatus: "OrderProcessing",
    seller: {
      "@type": "Organization",
      name: "مكتبة الأمل",
      url: "https://alaml-theta.vercel.app",
    },
    description: "تم استلام طلبك بنجاح وهو قيد المراجعة والتحضير للشحن",
  };
}
