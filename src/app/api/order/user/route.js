import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Get all order items for a specific order by user id
export async function GET(request) {
  try {
    const userId = request.headers.get("userid");
    const { searchParams } = new URL(request.url);
    const orderId = (await params).id;

    if (!userId) {
      return NextResponse.json(
        { error: "User id is required" },
        { status: 400 }
      );
    }
    if (!orderId) {
      return NextResponse.json(
        { error: "Order id is required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        data: {
          order,
        },
        message: "Order and items fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch order items" },
      { status: 500 }
    );
  }
}
