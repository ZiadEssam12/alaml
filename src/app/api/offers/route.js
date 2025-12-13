// base url /api/offers/
// GET /api/offers -> Get all categories with active offers + all offers

import prisma from "@/lib/prisma";
import { validateOfferForm } from "@/schema/dashboard/managingOffers";
import { NextResponse } from "next/server";

/**
 * GET /api/offers
 *
 * Purpose:
 * Fetch all categories that have active offers along with their associated offers,
 * PLUS the 10 most recent products that have active offers.
 * Used on the main offers page to display available discount categories and featured products.
 *
 * Query Parameters:
 * - page?: number (default: 1) - Pagination page number
 * - limit?: number (default: from env DATABASE_PAGINATION_LIMIT or 10)
 *
 * Response (200 OK):
 * {
 *   data: {
 *     categoriesWithOffers: [
 *       {
 *         id: string,
 *         name: string,
 *         icon: string,
 *         color: string,
 *         offers: [
 *           {
 *             id: string,
 *             title: string,
 *             value: decimal,
 *             type: "percentage" | "fixed" | "free_shipping",
 *             description: string | null,
 *             maxDiscountAmount: decimal | null,
 *             isAutoApply: boolean,
 *             startDate: DateTime,
 *             expirationDate: DateTime
 *           }
 *         ],
 *         _count: {
 *           offers: number (total count of offers)
 *         }
 *       }
 *     ],
 *     productsWithOffers: [
 *       {
 *         id: string,
 *         name: string,
 *         description: string | null,
 *         price: decimal,
 *         image: string | null,
 *         rating: decimal | null,
 *         _count: {
 *           reviews: number
 *         },
 *         offers: [...],
 *         variants: [...]
 *       }
 *     ],
 *     pagination: {
 *       page: number,
 *       limit: number
 *     }
 *   }
 * }
 *
 * Error Response (500 Internal Server Error):
 * {
 *   error: "فشل في جلب العروض" (Failed to fetch offers)
 * }
 *
 * Filters Applied:
 * - Only returns categories that have at least one active offer
 * - Only returns offers that are:
 *   - isActive: true
 *   - scope: "category"
 *   - Within the date window (startDate <= now <= expirationDate)
 * - Products are the 10 most recent products with active offers (product or variant scope)
 *
 * Example Usage:
 * GET /api/offers?page=1&limit=10
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(process.env.DATABASE_PAGINATION_LIMIT || "10", 10);
    const now = new Date();

    // Get all categories that have active offers
    const categoriesWithOffers = await prisma.category.findMany({
      where: {
        offers: {
          some: {
            isActive: true,
            startDate: { lte: now },
            expirationDate: { gte: now },
            scope: "category",
          },
        },
      },
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
        offers: {
          where: {
            isActive: true,
            startDate: { lte: now },
            expirationDate: { gte: now },
            scope: "category",
          },
          select: {
            id: true,
            title: true,
            value: true,
            type: true,
            description: true,
            maxDiscountAmount: true,
            isAutoApply: true,
            startDate: true,
            expirationDate: true,
          },
        },
        _count: {
          select: {
            offers: {
              where: {
                isActive: true,
                startDate: { lte: now },
                expirationDate: { gte: now },
                scope: "category",
              },
            },
          },
        },
      },
    });

    // Get 10 most recent products with active offers
    const productsWithOffers = await prisma.product.findMany({
      where: {
        OR: [
          // Products with direct offers
          {
            offers: {
              some: {
                isActive: true,
                startDate: { lte: now },
                expirationDate: { gte: now },
                scope: "product",
              },
            },
          },
          // Products with variant offers
          {
            variants: {
              some: {
                offers: {
                  some: {
                    isActive: true,
                    startDate: { lte: now },
                    expirationDate: { gte: now },
                    scope: "variant",
                  },
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrls: true,
        averageRating: true,
        createdAt: true,
        _count: {
          select: {
            reviews: true,
          },
        },
        offers: {
          where: {
            isActive: true,
            startDate: { lte: now },
            expirationDate: { gte: now },
            scope: "product",
          },
          select: {
            id: true,
            title: true,
            value: true,
            type: true,
            description: true,
            isAutoApply: true,
            expirationDate: true,
          },
        },
        variants: {
          select: {
            id: true,
            price: true,
            offers: {
              where: {
                isActive: true,
                startDate: { lte: now },
                expirationDate: { gte: now },
                scope: "variant",
              },
              select: {
                id: true,
                title: true,
                value: true,
                type: true,
                description: true,
                isAutoApply: true,
                expirationDate: true,
              },
            },
          },
          where: {
            offers: {
              some: {
                isActive: true,
                startDate: { lte: now },
                expirationDate: { gte: now },
                scope: "variant",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    const totalCategories = categoriesWithOffers.length;
    const totalPages = limit > 0 ? Math.ceil(totalCategories / limit) : 1;

    // Map categories to handle Decimal serialization
    const formattedCategories = categoriesWithOffers.map((category) => ({
      ...category,
      offers: category.offers.map((offer) => ({
        ...offer,
        value: Number(offer.value),
        maxDiscountAmount: offer.maxDiscountAmount
          ? Number(offer.maxDiscountAmount)
          : null,
      })),
    }));

    // Map products to match frontend expectations and handle Decimal serialization
    const formattedProducts = productsWithOffers.map((product) => ({
      ...product,
      image:
        product.imageUrls && product.imageUrls.length > 0
          ? product.imageUrls[0]
          : null,
      rating: product.averageRating,
      offers: product.offers.map((offer) => ({
        ...offer,
        value: Number(offer.value),
        maxDiscountAmount: offer.maxDiscountAmount
          ? Number(offer.maxDiscountAmount)
          : null,
      })),
      variants: product.variants.map((variant) => ({
        ...variant,
        price: Number(variant.price),
        offers: variant.offers.map((offer) => ({
          ...offer,
          value: Number(offer.value),
          maxDiscountAmount: offer.maxDiscountAmount
            ? Number(offer.maxDiscountAmount)
            : null,
        })),
      })),
    }));

    return NextResponse.json(
      {
        data: {
          categoriesWithOffers: formattedCategories,
          productsWithOffers: formattedProducts,
          pagination: { page, limit, maxPage: totalPages },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching offers:", error);
    return NextResponse.json({ error: "فشل في جلب العروض" }, { status: 500 });
  }
}

// title
// description
// scope
// productId
// categoryId
// variantId
// type
// value
// code
// isActive
// isAutoApply
// maxUsageCount
// perUserUsageCount
// maxDiscountAmount
// minCartAmount
// startDate
// expirationDate
export async function POST(request) {
  try {
    const data = await request.json();
    const validatedData = validateOfferForm(data);

    if (!validatedData.isValid) {
      return NextResponse.json(
        {
          error: "بيانات غير صالحة لإنشاء العرض",
          fieldsWithErrors: validatedData.errors || {},
        },
        { status: 400 }
      );
    }

    // Existence checks

    // Category existence check
    if (validatedData.data.scope === "category") {
      // check if the category exists
      const existsCategory = await prisma.category.findUnique({
        where: { id: validatedData.data.categoryId },
      });

      // else return error response
      if (!existsCategory) {
        return NextResponse.json(
          { error: "الفئة المحددة غير موجودة" },
          { status: 400 }
        );
      }
    }

    // Product existence check
    if (validatedData.data.scope === "product") {
      // check if the product exists
      const existsProduct = await prisma.product.findUnique({
        where: { id: validatedData.data.productId },
      });
      // else return error response
      if (!existsProduct) {
        return NextResponse.json(
          { error: "المنتج المحدد غير موجود" },
          { status: 400 }
        );
      }
    }

    // Variant existence check
    if (validatedData.data.scope === "variant") {
      // check if the variant exists
      const existsVariant = await prisma.productVariant.findUnique({
        where: { id: validatedData.data.variantId },
      });
      // else return error response
      if (!existsVariant) {
        return NextResponse.json(
          { error: "المتغير المحدد غير موجود" },
          { status: 400 }
        );
      }
    }

    // Overlapping date window check
    // based on the scope and the associated entity (categoryId, productId, variantId)
    const entityFilter = {
      ...(validatedData.data.scope === "category" && {
        categoryId: validatedData.data.categoryId,
      }),
      ...(validatedData.data.scope === "product" && {
        productId: validatedData.data.productId,
      }),
      ...(validatedData.data.scope === "variant" && {
        variantId: validatedData.data.variantId,
      }),
    };
    const overlapOffer = await prisma.offer.findFirst({
      where: {
        scope: validatedData.data.scope,
        isActive: true,
        ...entityFilter,
        NOT: [
          { expirationDate: { lt: validatedData.data.startDate } },
          { startDate: { gt: validatedData.data.expirationDate } },
        ],
      },
    });

    // If overlapping offer found, return error response
    if (overlapOffer) {
      return NextResponse.json(
        {
          error: "يوجد عرض آخر لنفس الكيان في نفس الفترة الزمنية.",
          existingOfferId: overlapOffer.id,
        },
        { status: 409 }
      );
    }

    const newOffer = await prisma.offer.create({
      data: {
        title: validatedData.data.title,
        description: validatedData.data.description,
        scope: validatedData.data.scope,
        productId: validatedData.data.productId || null,
        categoryId: validatedData.data.categoryId || null,
        variantId: validatedData.data.variantId || null,
        type: validatedData.data.type,
        value: validatedData.data.value,
        isActive: validatedData.data.isActive,
        isAutoApply: validatedData.data.isAutoApply,
        maxUsageCount: validatedData.data.maxUsageCount || null,
        perUserUsageCount: validatedData.data.perUserUsageCount || null,
        maxDiscountAmount: validatedData.data.maxDiscountAmount || null,
        minCartAmount: validatedData.data.minCartAmount || null,
        startDate: validatedData.data.startDate || new Date(),
        expirationDate: validatedData.data.expirationDate,
      },
    });

    return NextResponse.json({ data: newOffer }, { status: 201 });
  } catch (error) {
    console.error("Error creating offer:", error);
    return NextResponse.json({ error: "فشل في إنشاء العرض" }, { status: 500 });
  }
}
