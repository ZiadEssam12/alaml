import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Get category by id with its products and pagination
export async function GET(request, { params }) {
  try {
    const { id: seoTitle } = await params;
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(process.env.DATABASE_PAGINATION_LIMIT || 10);

    if (!seoTitle) {
      return NextResponse.json({ error: "معرف الفئة مطلوب" }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { seoTitle },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const [total, productsData] = await Promise.all([
      prisma.product.count({
        where: { categoryID: category.id },
      }),
      prisma.product.findMany({
        where: { categoryID: category.id },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    // Fetch review statistics for each product
    const productsWithReviews = await Promise.all(
      productsData.map(async (product) => {
        const reviewStats = await prisma.review.aggregate({
          where: { productId: product.id, status: "approved" },
          _avg: { rating: true },
          _count: { id: true },
        });

        return {
          ...product,
          averageRating: reviewStats._avg.rating || 0,
          totalSales: reviewStats._count.id || 0,
        };
      })
    );

    const sort = searchParams.get("sort") || "new-to-old";
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
// Update category by id
export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data,
    });

    return NextResponse.json(
      {
        data: updatedCategory,
        message: "Category updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// Delete category by id
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Category deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
