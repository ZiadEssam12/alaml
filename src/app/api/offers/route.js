// base url /api/offers/
// GET /api/offers -> Get all categories with active offers + all offers

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/offers
 *
 * Purpose:
 * Fetch all categories that have active offers along with their associated offers.
 * Used on the main offers page to display available discount categories.
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

    const totalCategories = categoriesWithOffers.length;
    const totalPages = limit > 0 ? Math.ceil(totalCategories / limit) : 1;

    return NextResponse.json(
      {
        data: {
          categoriesWithOffers,
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
