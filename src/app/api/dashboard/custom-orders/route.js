import { getUserTokenSSR } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - Fetch all custom orders with pagination (admin only)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Number(searchParams.get("limit") || 10);
    const skip = (page - 1) * limit;

    const [customOrders, total] = await Promise.all([
      prisma.customOrder.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.customOrder.count(),
    ]);

    const maxPage = Math.ceil(total / limit);

    return NextResponse.json(
      {
        data: customOrders,
        pagination: {
          page,
          limit,
          total,
          maxPage,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching custom orders:", error);
    return NextResponse.json({ error: "فشل في جلب الطلبات" }, { status: 500 });
  }
}
