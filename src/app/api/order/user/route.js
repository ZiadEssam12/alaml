import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Get all orders for a user with pagination
export async function GET(request) {
  try {
    const userId = request.headers.get("userid");
    if (!userId) {
      return NextResponse.json(
        { error: "User id is required" },
        { status: 400 }
      );
    }
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(process.env.DATABASE_PAGINATION_LIMIT || 10);

    const totalOrders = await prisma.order.count({ where: { userId } });
    const maxPage = Math.ceil(totalOrders / limit);

    const orders = await prisma.order.findMany({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    return NextResponse.json(
      {
        data: orders,
        page,
        maxPage,
        message: "Orders fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
