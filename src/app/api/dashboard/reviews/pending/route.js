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

// GET /api/admin/reviews/pending - Fetch only pending reviews for moderation
export async function GET(req) {
  const permissionCheck = await checkAdminPermission();
  if (permissionCheck.error) {
    return NextResponse.json({ error: permissionCheck.error }, { status: permissionCheck.status });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const pageSize = parseInt(searchParams.get("pageSize")) || 10;

  const skip = (page - 1) * pageSize;

  try {
    // Get total count of pending reviews
    const totalCount = await prisma.review.count({ 
      where: { status: "pending" } 
    });

    // Fetch pending reviews with pagination
    const pendingReviews = await prisma.review.findMany({
      where: { status: "pending" },
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return NextResponse.json({
      data: {
        reviews: pendingReviews,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages,
          hasNext,
          hasPrevious,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching pending reviews:", error);
    return NextResponse.json({ error: "حدث خطأ في جلب التقييمات المعلقة" }, { status: 500 });
  }
}