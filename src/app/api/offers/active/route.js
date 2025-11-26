import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Get query parameters correctly
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const categoryId = searchParams.get("categoryId");
    const variantId = searchParams.get("variantId");

    // Validate: must provide at least one filter
    if (!productId && !categoryId && !variantId) {
      return NextResponse.json(
        { error: "معرف المنتج أو معرف الفئة أو معرف البديل مطلوب" },
        { status: 400 }
      );
    }

    const now = new Date();

    const offers = await prisma.offer.findMany({
      where: {
        // Must be active
        isActive: true,
        startDate: { lte: now },
        expirationDate: { gte: now },
        OR: [
          productId ? { productId: productId } : null,
          categoryId ? { categoryId: categoryId } : null,
          variantId ? { variantId: variantId } : null,
        ].filter(Boolean),
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        value: true,
        scope: true,
        maxDiscountAmount: true,
        isAutoApply: true,
        startDate: true,
        expirationDate: true,
      },
    });

    return NextResponse.json({ data: offers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching active offers:", error);
    return NextResponse.json(
      { error: "فشل في جلب العروض النشطة" },
      { status: 500 }
    );
  }
}
