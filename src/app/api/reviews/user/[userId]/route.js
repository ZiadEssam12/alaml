import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET /api/reviews/user/[userId] - Fetch all reviews by a specific user
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
  }

  const { userId } = await params;

  // Users can only view their own reviews (unless they are admin)
  if (session.user.role !== "admin" && session.user.id !== userId) {
    return NextResponse.json(
      { error: "غير مصرح لك بعرض تقييمات المستخدمين الآخرين" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const pageSize = parseInt(searchParams.get("pageSize")) || 10;
  const status = searchParams.get("status"); // Filter by status (optional)

  const skip = (page - 1) * pageSize;

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 }
      );
    }

    // Build where clause
    const where = { userId };
    if (status) {
      where.status = status;
    }

    // Get total count of user reviews
    const totalCount = await prisma.review.count({ where });

    // Fetch user reviews
    const reviews = await prisma.review.findMany({
      where,
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

    // Get status summary
    const statusSummary = await prisma.review.groupBy({
      by: ["status"],
      where: { userId },
      _count: {
        status: true,
      },
    });

    return NextResponse.json({
      data: {
        reviews,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages,
          hasNext,
          hasPrevious,
        },
        statusSummary: statusSummary.reduce((acc, curr) => {
          acc[curr.status] = curr._count.status;
          return acc;
        }, {}),
        userInfo: {
          id: user.id,
          name: user.name,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return NextResponse.json(
      { error: "حدث خطأ في جلب تقييمات المستخدم" },
      { status: 500 }
    );
  }
}
