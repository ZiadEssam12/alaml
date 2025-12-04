import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    const variants = await prisma.productVariant.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        price: true,
        product: {
          select: {
            name: true,
          },
        },
      },
      take: 10,
    });

    // Format the response to include product name
    const formattedVariants = variants.map((variant) => ({
      id: variant.id,
      name: `${variant.product.name} - ${variant.name}`,
      price: variant.price,
    }));

    return NextResponse.json({ results: formattedVariants }, { status: 200 });
  } catch (error) {
    console.error("Error fetching variants:", error);
    return NextResponse.json(
      { error: "Failed to fetch variants" },
      { status: 500 }
    );
  }
}
