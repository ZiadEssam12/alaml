import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/reviews/user-permissions - Check if user can review a product
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "معرف المنتج مطلوب" }, { status: 400 });
  }

  try {
    // Get user session
    // TODO:: get users session
    if (!session?.user?.id) {
      return NextResponse.json({
        data: {
          hasPurchased: false,
          hasReviewed: false,
          canReview: false,
        },
      });
    }

    const userId = session.user.id;

    // Check if user has purchased the product and if they have already reviewed it
    const [hasPurchased, hasReviewed] = await Promise.all([
      // Check if user has a completed order with this product
      prisma.order.findFirst({
        where: {
          userId,
          status: { in: ["shipped", "delivered"] },
          items: {
            some: { productId },
          },
        },
        select: { id: true },
      }),

      // Check if user has already reviewed this product
      prisma.review.findFirst({
        where: { userId, productId },
        select: { id: true },
      }),
    ]);

    return NextResponse.json({
      data: {
        hasPurchased: !!hasPurchased,
        hasReviewed: !!hasReviewed,
        canReview: !!hasPurchased && !hasReviewed,
      },
    });
  } catch (error) {
    console.error("Error checking user review permissions:", error);
    return NextResponse.json(
      { error: "حدث خطأ في التحقق من صلاحيات المراجعة" },
      { status: 500 }
    );
  }
}
