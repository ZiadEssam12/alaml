import { getUserTokenSSR } from "@/lib/auth-helpers";
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

export async function GET(request, { params }) {
  try {
    const session = await getUserTokenSSR(request);

    const role = session?.role;
    const userId = session?.id;

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Product id is required" },
        { status: 400 }
      );
    }

    // First get the product with all nested data in one query
    const product = await prisma.product.findUnique({
      where: { slug: id },
      include: {
        category: true,
        // Get reviews with stats in one query
        reviews: {
          where: { status: "approved" },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            userName: true,
            userId: true,
            rating: true,
            comment: true,
            createdAt: true,
          },
        },
        // Get options with values
        options: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            name: true,
            presentation: true,
            position: true,
            values: {
              orderBy: { position: "asc" },
              select: {
                id: true,
                value: true,
                hex: true,
                imageUrl: true,
                position: true,
              },
            },
          },
        },
        // Get variants with options
        variants: {
          select: {
            id: true,
            sku: true,
            price: true,
            stockQuantity: true,
            isActive: true,
            imageUrls: true,
            combinationHash: true,
            options: {
              select: {
                optionId: true,
                valueId: true,
                option: { select: { name: true, position: true } },
                value: {
                  select: {
                    value: true,
                    hex: true,
                    imageUrl: true,
                    position: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!product || (product.isActive === false && role !== "admin")) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Fetch only user-specific data and similar products in parallel (2 queries)
    const now = new Date();
    const [purchase, review, similarProducts, reviewStats, activeOffers] =
      await Promise.all([
        // Check if user has purchased
        userId
          ? prisma.order.findFirst({
              where: {
                userId,
                status: { in: ["shipped", "delivered"] },
                items: {
                  some: {
                    productId: product.id,
                  },
                },
              },
              select: { id: true },
            })
          : null,

        // Check if user has reviewed
        userId
          ? prisma.review.findFirst({
              where: { userId, productId: product.id },
              select: { id: true },
            })
          : null,

        // Get similar products
        prisma.product.findMany({
          where: {
            categoryID: product.categoryID,
            isActive: true,
            NOT: { id: product.id },
          },
          take: 4,
        }),

        // Get review stats and distribution
        prisma.review.groupBy({
          by: ["rating"],
          where: { productId: product.id, status: "approved" },
          _count: { rating: true },
        }),

        // Get active offers for this product (product-level and category-level)
        prisma.offer.findMany({
          where: {
            isActive: true,
            isAutoApply: true,
            startDate: { lte: now },
            expirationDate: { gte: now },
            OR: [
              { scope: "product", productId: product.id },
              { scope: "category", categoryId: product.categoryID },
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
            minCartAmount: true,
          },
        }),
      ]);

    // Extract data from nested queries
    const reviews = product.reviews;
    const options = product.options;
    const variants = product.variants;
    const totalCount = reviews.length; // Already limited to 5

    // Get variant IDs to fetch variant-level offers
    const variantIds = variants.map((v) => v.id);

    // Fetch variant-level offers if there are variants
    let variantOffers = [];
    if (variantIds.length > 0) {
      variantOffers = await prisma.offer.findMany({
        where: {
          isActive: true,
          isAutoApply: true,
          startDate: { lte: now },
          expirationDate: { gte: now },
          scope: "variant",
          variantId: { in: variantIds },
        },
        select: {
          id: true,
          title: true,
          description: true,
          scope: true,
          type: true,
          value: true,
          maxDiscountAmount: true,
          minCartAmount: true,
          variantId: true,
        },
      });
    }

    // Calculate product-level offer (best offer from product/category scope)
    const productBestOffer = getBestOffer(
      activeOffers,
      parseFloat(product.price)
    );
    const productDiscountedPrice = productBestOffer
      ? calculateDiscountedPrice(product.price, productBestOffer)
      : null;

    // Build offer data for response
    const offerData = {
      productOffer: productBestOffer
        ? {
            ...productBestOffer,
            originalPrice: parseFloat(product.price),
            discountedPrice: productDiscountedPrice,
            savings: parseFloat(product.price) - productDiscountedPrice,
          }
        : null,
      // Map variant offers by variantId
      variantOffers: variantOffers.reduce((acc, offer) => {
        acc[offer.variantId] = offer;
        return acc;
      }, {}),
      // All available offers for display
      allOffers: [...activeOffers, ...variantOffers],
    };

    // Enhance variants with their offer prices
    const enhancedVariants = variants.map((variant) => {
      // Check for variant-specific offer first, then fall back to product/category offer
      const variantSpecificOffer = variantOffers.find(
        (o) => o.variantId === variant.id
      );
      const applicableOffer = variantSpecificOffer || productBestOffer;

      const variantPrice = parseFloat(variant.price);
      const discountedPrice = applicableOffer
        ? calculateDiscountedPrice(variantPrice, applicableOffer)
        : null;

      return {
        ...variant,
        offer: applicableOffer
          ? {
              ...applicableOffer,
              originalPrice: variantPrice,
              discountedPrice,
              savings: discountedPrice ? variantPrice - discountedPrice : 0,
            }
          : null,
      };
    });

    // Calculate rating stats from fetched reviews and distribution
    const ratingStats = {
      _avg: {
        rating:
          reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0,
      },
      _count: { rating: product.ratingCount },
    };

    // Process rating distribution
    const distribution = Array(5).fill(0);
    reviewStats.forEach(({ rating, _count }) => {
      distribution[rating - 1] = _count.rating;
    });

    // Process user permissions
    const hasPurchased = !!purchase;
    const hasReviewed = !!review;

    const reviewsData = {
      reviews,
      stats: {
        averageRating: product.averageRating,
        totalReviews: product.ratingCount,
      },
      ratingDistribution: distribution,
      pagination: {
        page: 1,
        pageSize: 5,
        totalCount: product.ratingCount,
        totalPages: Math.ceil(product.ratingCount / 5),
        hasNext: product.ratingCount > 5,
        hasPrevious: false,
      },
    };

    const userPermissions = userId
      ? {
          hasPurchased: hasPurchased,
          hasReviewed: hasReviewed,
          canReview: hasPurchased && !hasReviewed,
          userReview: review?.status !== "approved" ? review : null,
        }
      : null;

    // Enhance product with offer pricing
    const enhancedProduct = {
      ...product,
      offer: offerData.productOffer,
    };

    return NextResponse.json(
      {
        data: {
          product: enhancedProduct,
          similarProducts,
          userPermissions,
          reviews: reviewsData,
          options,
          variants: enhancedVariants,
          offers: offerData,
        },
        message: "Product fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
