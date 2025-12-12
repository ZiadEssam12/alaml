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

export async function GET() {
  try {
    const now = new Date();

    const [categoriesData, productsData, activeOffers] =
      await prisma.$transaction([
        prisma.category.findMany({
          where: {
            status: "active", // Only fetch active categories
          },
          include: {
            products: {
              where: {
                isActive: true, // Only count active products
              },
              select: {
                id: true, // Just to count
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        }),
        prisma.product.findMany({
          take: 10,
          where: {
            isActive: true,
            stockQuantity: { gt: 0 },
          },
          orderBy: { createdAt: "desc" },
        }),
        // Fetch latest active offers with their associated products
        prisma.offer.findMany({
          where: {
            isActive: true,
            isAutoApply: true,
            startDate: { lte: now },
            expirationDate: { gte: now },
            scope: { in: ["product", "category"] },
          },
          orderBy: { createdAt: "desc" },
          take: 20, // Get more offers to ensure we have enough products
          include: {
            product: {
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
                averageRating: true,
                ratingCount: true,
                category: {
                  select: {
                    seoTitle: true,
                  },
                },
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                products: {
                  where: {
                    isActive: true,
                    stockQuantity: { gt: 0 },
                  },
                  take: 5,
                  orderBy: { createdAt: "desc" },
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
                    averageRating: true,
                    ratingCount: true,
                    category: {
                      select: {
                        seoTitle: true,
                      },
                    },
                  },
                },
              },
            },
          },
        }),
      ]);

    // Filter categories that have at least one active product
    const categories = categoriesData
      .filter((category) => category.products.length > 0)
      .map((category) => ({
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        status: category.status,
        seoTitle: category.seoTitle,
        seoDescription: category.seoDescription,
        createdAt: category.createdAt,
      }));

    // Fetch review statistics for each product
    const products = await Promise.all(
      productsData.map(async (product) => {
        const reviewStats = await prisma.review.aggregate({
          where: { productId: product.id, status: "approved" },
          _avg: { rating: true },
          _count: { id: true },
        });

        return {
          ...product,
          averageRating: reviewStats._avg.rating || 0,
          ratingCount: reviewStats._count.id || 0,
        };
      })
    );

    // Build products with offers
    const productsWithOffersMap = new Map();

    for (const offer of activeOffers) {
      if (
        offer.scope === "product" &&
        offer.product &&
        offer.product.isActive
      ) {
        // Direct product offer
        const product = offer.product;
        if (!productsWithOffersMap.has(product.id)) {
          const discountedPrice = calculateDiscountedPrice(
            product.price,
            offer
          );
          productsWithOffersMap.set(product.id, {
            ...product,
            offer: {
              id: offer.id,
              title: offer.title,
              description: offer.description,
              type: offer.type,
              value: parseFloat(offer.value),
              originalPrice: parseFloat(product.price),
              discountedPrice,
              savings: parseFloat(product.price) - discountedPrice,
            },
          });
        }
      } else if (offer.scope === "category" && offer.category) {
        // Category offer - add products from this category
        for (const product of offer.category.products) {
          if (!productsWithOffersMap.has(product.id)) {
            const discountedPrice = calculateDiscountedPrice(
              product.price,
              offer
            );
            productsWithOffersMap.set(product.id, {
              ...product,
              offer: {
                id: offer.id,
                title: offer.title,
                description: offer.description,
                type: offer.type,
                value: parseFloat(offer.value),
                originalPrice: parseFloat(product.price),
                discountedPrice,
                savings: parseFloat(product.price) - discountedPrice,
              },
            });
          }
        }
      }
    }

    // Convert map to array and limit to 10 products
    const productsWithOffers = Array.from(productsWithOffersMap.values()).slice(
      0,
      10
    );

    return NextResponse.json(
      {
        data: {
          categories,
          products,
          productsWithOffers,
        },
        message: "Home data fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching home data:", error);
    return NextResponse.json(
      { error: "Failed to fetch home data" },
      { status: 500 }
    );
  }
}
