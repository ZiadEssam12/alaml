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

    // Build Prisma where filter
    const where = {
      isActive: true,
    };
    if (categories.length > 0 && categories[0] !== "") {
      where.categoryID = { in: categories };
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

    const totalProducts = await prisma.product.count({ where });
    const maxPage = Math.ceil(totalProducts / limit);

    const products = await prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });

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
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
