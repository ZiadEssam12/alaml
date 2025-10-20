import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Get category by id with its products and pagination
export async function GET(request, { params }) {
  try {
    const { id: seoTitle } = await params;
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(process.env.DATABASE_PAGINATION_LIMIT || 10);
    const sort = searchParams.get("sort") || "new-to-old";

    if (!seoTitle) {
      return NextResponse.json({ error: "معرف الفئة مطلوب" }, { status: 400 });
    }

    // Build orderBy based on sort parameter
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
      default:
        orderBy = { createdAt: "desc" };
    }

    // Fetch category with active products in a single query
    const category = await prisma.category.findUnique({
      where: { seoTitle },
      include: {
        products: {
          where: { isActive: true },
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
            createdAt: true,
            updatedAt: true,
            // Use denormalized review data directly from product model
            averageRating: true,
            ratingCount: true,
            ratingSum: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Get total count of active products in category
    const total = await prisma.product.count({
      where: { categoryID: category.id, isActive: true },
    });

    // Transform products to include review stats
    const productsWithReviews = category.products.map((product) => ({
      ...product,
      totalReviews: product.ratingCount,
    }));

    return NextResponse.json(
      {
        data: {
          ...category,
          products: productsWithReviews,
        },
        pagination: {
          total,
          page,
          maxPage: Math.ceil(total / limit),
        },
        message: "Category fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error message :", error.message);
    return NextResponse.json(
      { error: "Failed to fetch category :" + error.message },
      { status: 500 }
    );
  }
}
