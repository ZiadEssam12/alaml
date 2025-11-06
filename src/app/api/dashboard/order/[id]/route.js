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
      couponCode: order.coupon?.code || null,
      couponType: order.coupon?.type || null,
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

  // If cancelling the order, restore product quantities
  if (status === "cancelled") {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (order) {
      // Restore quantities for all items in the order
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        });
      }
    }
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({
    data: updated,
    message:
      status === "cancelled"
        ? "تم إلغاء الطلب واستعادة كمية المنتج"
        : "تم تحديث حالة الطلب",
  });
}
