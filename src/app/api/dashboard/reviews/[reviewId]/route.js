import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Helper function to check admin role
async function checkAdminPermission() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { error: "غير مصرح لك", status: 401 };
  }

  if (session.user.role !== "admin") {
    return { error: "غير مصرح لك بالوصول لهذه الصفحة", status: 403 };
  }

  return { session };
}

// DELETE /api/dashboard/reviews/[reviewId] - Permanently delete a review
export async function DELETE(req, { params }) {
  const permissionCheck = await checkAdminPermission();
  if (permissionCheck.error) {
    return NextResponse.json(
      { error: permissionCheck.error },
      { status: permissionCheck.status }
    );
  }

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
