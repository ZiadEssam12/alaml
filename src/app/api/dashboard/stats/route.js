import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [
      orderStats,
      totalUsers,
      totalProducts,
      totalCategories,
      lastOrders,
      revenue,
    ] = await Promise.all([
      // Get order counts by status in a single query
      prisma.order.groupBy({
        by: ["status"],
        _count: {
          id: true,
        },
      }),

      // Count total users
      prisma.user.count(),

      // Count total products
      prisma.product.count(),

      // Count total categories
      prisma.category.count(),

      // Get last 5 orders with user information
      prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          customerName: true,
          customerEmail: true,
          finalAmount: true,
          status: true,
          createdAt: true,
        },
      }),

      // Calculate total revenue from delivered orders
      prisma.order.aggregate({
        _sum: {
          finalAmount: true,
        },
        where: {
          status: "delivered",
        },
      }),
    ]);

    // Process order statistics
    const orderCounts = {
      total: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    orderStats.forEach((stat) => {
      orderCounts.total += stat._count.id;
      orderCounts[stat.status] = stat._count.id;
    });

    // Format the response
    const dashboardData = {
      totalOrders: orderCounts.total,
      pendingOrders: orderCounts.pending,
      completedOrders: orderCounts.delivered,
      cancelledOrders: orderCounts.cancelled,
      processingOrders: orderCounts.processing,
      shippedOrders: orderCounts.shipped,
      revenue: revenue._sum.finalAmount || 0,
      users: totalUsers,
      products: totalProducts,
      categories: totalCategories,
      lastOrders: lastOrders.map((order) => ({
        id: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        total: order.finalAmount,
        status: order.status,
        createdAt: order.createdAt.toISOString().split("T")[0], // Format date
      })),
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
