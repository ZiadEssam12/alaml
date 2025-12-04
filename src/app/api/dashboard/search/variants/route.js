import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const productId = searchParams.get("productId") || "";

    // If no productId, return empty results (variants must be filtered by product)
    if (!productId) {
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    // Build the where clause - filter by productId first
    const whereClause = {
      productId: productId,
    };

    // Add search filters if query is provided
    if (query.trim()) {
      whereClause.OR = [
        // Search by SKU
        {
          sku: {
            contains: query,
            mode: "insensitive",
          },
        },
        // Search by option values (e.g., "Red", "Large")
        {
          options: {
            some: {
              value: {
                value: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          },
        },
      ];
    }

    const variants = await prisma.productVariant.findMany({
      where: whereClause,
      select: {
        id: true,
        sku: true,
        price: true,
        product: {
          select: {
            name: true,
          },
        },
        options: {
          select: {
            value: {
              select: {
                value: true,
              },
            },
          },
        },
      },
      take: 10,
    });

    // Format the response to include product name and variant options
    const formattedVariants = variants.map((variant) => {
      const optionValues = variant.options
        .map((opt) => opt.value.value)
        .join(" / ");
      return {
        id: variant.id,
        name: `${variant.product.name} - ${optionValues}`,
        price: variant.price,
      };
    });

    return NextResponse.json({ results: formattedVariants }, { status: 200 });
  } catch (error) {
    console.error("Error fetching variants:", error);
    return NextResponse.json(
      { error: "Failed to fetch variants" },
      { status: 500 }
    );
  }
}
