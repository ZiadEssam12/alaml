import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Reduced to 3 queries (down from 6) with optimized database operations
    const [
      // Combined stats query - order counts and revenue in one shot using raw SQL
      orderStats,
      // Combined count query for users, products, and categories
      counts,
      // Get last 5 orders
      lastOrders,
    ] = await Promise.all([
      // Single query to get order stats and revenue together
      prisma.$queryRaw`
        SELECT 
          status,
          COUNT(*) as count,
          COALESCE(SUM(CASE WHEN status = 'delivered' THEN "finalAmount" ELSE 0 END), 0) as deliveredRevenue
        FROM "Order"
        GROUP BY status
      `,

      // Single query to count all entities at once
      prisma.$queryRaw`
        SELECT 
          (SELECT COUNT(*) FROM "User") as "totalUsers",
          (SELECT COUNT(*) FROM "Product") as "totalProducts",
          (SELECT COUNT(*) FROM "Category") as "totalCategories"
      `,

      // Get last 5 orders efficiently
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
    ]);

    // Process order statistics from raw query
    const orderCounts = {
      total: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    let totalRevenue = 0;

    orderStats.forEach((stat) => {
      const count = Number(stat.count);
      orderCounts.total += count;
      orderCounts[stat.status] = count;
      totalRevenue += Number(stat.deliveredRevenue);
    });

    // Extract counts from aggregated result
    const countData = counts[0];
    const totalUsers = Number(countData.totalUsers);
    const totalProducts = Number(countData.totalProducts);
    const totalCategories = Number(countData.totalCategories);

    // Format the response
    const dashboardData = {
      totalOrders: orderCounts.total,
      pendingOrders: orderCounts.pending,
      completedOrders: orderCounts.delivered,
      cancelledOrders: orderCounts.cancelled,
      processingOrders: orderCounts.processing,
      shippedOrders: orderCounts.shipped,
      revenue: totalRevenue,
      users: totalUsers,
      products: totalProducts,
      categories: totalCategories,
      lastOrders: lastOrders.map((order) => ({
        id: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        total: order.finalAmount,
        status: order.status,
        createdAt: order.createdAt.toISOString().split("T")[0],
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
