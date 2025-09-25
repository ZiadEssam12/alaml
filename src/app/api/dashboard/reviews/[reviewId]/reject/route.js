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

// PUT /api/dashboard/reviews/[reviewId]/reject - Reject a review
export async function PUT(req, { params }) {
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
      select: { id: true, status: true, productName: true, userName: true },
    });

    if (!existingReview) {
      return NextResponse.json({ error: "التقييم غير موجود" }, { status: 404 });
    }

    // Update review status to rejected
    const rejectedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { status: "rejected" },
      include: {
        product: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: rejectedReview,
      message: "تم رفض التقييم بنجاح",
    });
  } catch (error) {
    console.error("Error rejecting review:", error);
    return NextResponse.json(
      { error: "حدث خطأ في رفض التقييم" },
      { status: 500 }
    );
  }
}
