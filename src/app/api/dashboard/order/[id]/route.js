import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/dashboard/order/[id]
export async function GET(req, { params }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: true,
      coupon: {
        select: {
          code: true,
          type: true,
        },
      },
    },
  });

  if (!order)
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({
    data: {
      ...order,
      couponCode: order.coupon?.code || null, // Add coupon code
      couponType: order.coupon?.type || null, // Add coupon type
    },
  });
}

// PATCH /api/dashboard/order/[id]
export async function PATCH(req, { params }) {
  const { id } = await params;
  const body = await req.json();
  const { status } = body;
  if (!status)
    return NextResponse.json({ error: "Status is required" }, { status: 400 });
  const updated = await prisma.order.update({
    where: { id },
    data: { status },
  });
  return NextResponse.json({ data: updated });
}
