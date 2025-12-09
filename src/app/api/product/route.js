import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Helper function to calculate discounted price
function calculateDiscountedPrice(originalPrice, offer) {
  if (!offer) return null;

  const price = parseFloat(originalPrice);
  const value = parseFloat(offer.value);

  if (offer.type === "percentage") {
    const discount = price * (value / 100);
    const maxDiscount = offer.maxDiscountAmount
      ? parseFloat(offer.maxDiscountAmount)
      : null;
    const actualDiscount = maxDiscount
      ? Math.min(discount, maxDiscount)
      : discount;
    return Math.max(0, price - actualDiscount);
  } else if (offer.type === "fixed") {
    return Math.max(0, price - value);
  }

  return price;
}

// Helper function to get the best offer (highest discount)
function getBestOffer(offers, price) {
  if (!offers || offers.length === 0) return null;

  let bestOffer = null;
  let bestDiscount = 0;

  for (const offer of offers) {
    const discountedPrice = calculateDiscountedPrice(price, offer);
    const discount = price - discountedPrice;

    if (discount > bestDiscount) {
      bestDiscount = discount;
      bestOffer = offer;
    }
  }

  return bestOffer;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(process.env.DATABASE_PAGINATION_LIMIT || 10);

    const categories = searchParams.get("categories")?.split(",") || [];
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock") === "true";
    const q = searchParams.get("q") || "";
    const sort = searchParams.get("sort") || "new-to-old";
    const rating = searchParams.get("rating");

    // Build orderBy based on sort
    let orderBy = {};
    switch (sort) {
      case "new-to-old":
        orderBy = { createdAt: "desc" };
        break;
      case "old-to-new":
        orderBy = { createdAt: "asc" };
        break;
      case "low-to-high":
        orderBy = { price: "asc" };
        break;
      case "high-to-low":
        orderBy = { price: "desc" };
        break;
      case "rating-high-to-low":
        orderBy = { averageRating: "desc" };
        break;
      case "rating-low-to-high":
        orderBy = { averageRating: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    // Build Prisma where filter
    const where = {
      isActive: true,
    };
    if (categories.length > 0 && categories[0] !== "") {
      where.category = { seoTitle: { in: categories } };
    }
    if (minPrice) {
      where.price = { ...(where.price || {}), gte: Number(minPrice) };
    }
    if (maxPrice) {
      where.price = { ...(where.price || {}), lte: Number(maxPrice) };
    }
    if (inStock) {
      where.stockQuantity = { gt: 0 };
    }
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const [totalProducts, productsData] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          imageUrls: true,
          stockQuantity: true,
          maxQuantityPerUser: true,
          isActive: true,
          categoryID: true,
          category: {
            select: {
              seoTitle: true,
            },
          },
          createdAt: true,
          updatedAt: true,
          // Include denormalized rating fields
          ratingCount: true,
          ratingSum: true,
          averageRating: true,
        },
      }),
    ]);

    // Get product IDs and category IDs for offer lookup
    const productIds = productsData.map((p) => p.id);
    const categoryIds = [...new Set(productsData.map((p) => p.categoryID))];

    // Fetch active offers for these products and categories
    const now = new Date();
    const activeOffers = await prisma.offer.findMany({
      where: {
        isActive: true,
        isAutoApply: true,
        startDate: { lte: now },
        expirationDate: { gte: now },
        OR: [
          { scope: "product", productId: { in: productIds } },
          { scope: "category", categoryId: { in: categoryIds } },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        scope: true,
        type: true,
        value: true,
        maxDiscountAmount: true,
        productId: true,
        categoryId: true,
      },
    });

    // Group offers by product and category
    const productOffers = {};
    const categoryOffers = {};

    for (const offer of activeOffers) {
      if (offer.scope === "product" && offer.productId) {
        if (!productOffers[offer.productId]) {
          productOffers[offer.productId] = [];
        }
        productOffers[offer.productId].push(offer);
      } else if (offer.scope === "category" && offer.categoryId) {
        if (!categoryOffers[offer.categoryId]) {
          categoryOffers[offer.categoryId] = [];
        }
        categoryOffers[offer.categoryId].push(offer);
      }
    }

    // Enhance products with offer data
    let products = productsData.map((product) => {
      const price = parseFloat(product.price);

      // Combine product-level and category-level offers
      const applicableOffers = [
        ...(productOffers[product.id] || []),
        ...(categoryOffers[product.categoryID] || []),
      ];

      // Get the best offer
      const bestOffer = getBestOffer(applicableOffers, price);
      const discountedPrice = bestOffer
        ? calculateDiscountedPrice(price, bestOffer)
        : null;

      return {
        ...product,
        totalSales: product.ratingCount,
        offer: bestOffer
          ? {
              id: bestOffer.id,
              title: bestOffer.title,
              description: bestOffer.description,
              type: bestOffer.type,
              value: parseFloat(bestOffer.value),
              originalPrice: price,
              discountedPrice,
              savings: discountedPrice ? price - discountedPrice : 0,
            }
          : null,
      };
    });

    // Filter by rating if provided (must be done before Prisma query for best performance)
    if (rating) {
      where.averageRating = { gte: Number(rating) };
    }

    const maxPage = Math.ceil(totalProducts / limit);

    return NextResponse.json(
      {
        data: products,
        pagination: {
          page,
          maxPage,
        },
        message: "Products fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("error :", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
