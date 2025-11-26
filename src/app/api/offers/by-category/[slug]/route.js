// GET /api/offers/by-category/[slug]
// Returns all offers for a specific category

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(process.env.DATABASE_PAGINATION_LIMIT || "10", 10);
    const now = new Date();

    // Special case: "all" returns all offers
    if (slug === "all") {
      const offers = await prisma.offer.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          isActive: true,
          startDate: { lte: now },
          expirationDate: { gte: now },
        },
        select: {
          id: true,
          title: true,
          description: true,
          scope: true,
          type: true,
          value: true,
          maxDiscountAmount: true,
          isAutoApply: true,
          startDate: true,
          expirationDate: true,
          category: {
            select: { id: true, name: true, slug: true },
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              imageUrls: true,
              price: true,
            },
          },
          variant: {
            select: { id: true, sku: true, price: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const total = await prisma.offer.count({
        where: {
          isActive: true,
          startDate: { lte: now },
          expirationDate: { gte: now },
        },
      });

      return NextResponse.json(
        {
          data: {
            category: { id: "all", name: "جميع العروض", slug: "all" },
            offers,
            pagination: {
              page,
              limit,
              total,
              totalPages: Math.ceil(total / limit),
            },
          },
        },
        { status: 200 }
      );
    }

    // Find category by slug
    const category = await prisma.category.findUnique({
      where: { slug: slug },
      select: { id: true, name: true, icon: true, color: true },
    });

    if (!category) {
      return NextResponse.json({ error: "الفئة غير موجودة" }, { status: 404 });
    }

    // Get all offers for this category
    const offers = await prisma.offer.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        isActive: true,
        startDate: { lte: now },
        expirationDate: { gte: now },
        categoryId: category.id,
        scope: "category",
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        value: true,
        maxDiscountAmount: true,
        isAutoApply: true,
        startDate: true,
        expirationDate: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Get total count for pagination
    const total = await prisma.offer.count({
      where: {
        isActive: true,
        startDate: { lte: now },
        expirationDate: { gte: now },
        categoryId: category.id,
        scope: "category",
      },
    });

    return NextResponse.json(
      {
        data: {
          category,
          offers,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching category offers:", error);
    return NextResponse.json(
      { error: "فشل في جلب عروض الفئة" },
      { status: 500 }
    );
  }
}
