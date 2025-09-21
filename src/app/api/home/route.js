import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [categories, products] = await prisma.$transaction([
      prisma.category.findMany({
        take: 10,
      }),
      prisma.product.findMany({
        take: 10,
        where: {
          isActive: true,
        },
      }),
    ]);

    return NextResponse.json(
      {
        categories,
        products,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
