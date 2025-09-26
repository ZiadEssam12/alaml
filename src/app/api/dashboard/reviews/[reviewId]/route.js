import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// DELETE /api/dashboard/reviews/[reviewId] - Permanently delete a review
export async function DELETE(req, { params }) {
  const { reviewId } = await params;

  try {
    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, productName: true, userName: true, status: true },
    });

    if (!existingReview) {
      return NextResponse.json({ error: "التقييم غير موجود" }, { status: 404 });
    }

    // Delete the review permanently
    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({
      message: "تم حذف التقييم نهائياً بنجاح",
      deletedReview: {
        id: reviewId,
        productName: existingReview.productName,
        userName: existingReview.userName,
        status: existingReview.status,
      },
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "حدث خطأ في حذف التقييم" },
      { status: 500 }
    );
  }
}
