import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Get order info by id and userId
export async function GET(request, { params }) {
  try {
    const userId = request.headers.get("userid");
    const { id } = await params;
    if (!userId || !id) {
      return NextResponse.json(
        { error: "User id and order id are required" },
        { status: 400 }
      );
    }
    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: { items: true, user: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(
      { data: order, message: "Order fetched successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
