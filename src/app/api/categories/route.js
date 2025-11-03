import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
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
    });

    // Filter categories that have at least one active product
    const activeCategories = categories.filter(
      (category) => category.products.length > 0
    );

    // Remove the products array from response as it's only for filtering
    const response = activeCategories.map((category) => ({
      id: category.id,
      name: category.name,
      icon: category.icon,
      color: category.color,
      status: category.status,
      seoTitle: category.seoTitle,
      seoDescription: category.seoDescription,
      createdAt: category.createdAt,
    }));

    return NextResponse.json(
      {
        data: response,
        message: "Active categories fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
