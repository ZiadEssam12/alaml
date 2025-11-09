import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

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

    // Products already have denormalized rating values, just add totalSales
    let products = productsData.map((product) => ({
      ...product,
      totalSales: product.ratingCount,
    }));

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
