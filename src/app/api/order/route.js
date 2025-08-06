import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Get all orders with pagination (including cancelled)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(process.env.DATABASE_PAGINATION_LIMIT || 10);

    const totalOrders = await prisma.order.count();
    const maxPage = Math.ceil(totalOrders / limit);

    const orders = await prisma.order.findMany({
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

// POST: Create a new order
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingStreet,
      shippingCity,
      shippingZipCode,
      items,
      subtotal,
      shippingCost,
      discount,
      finalAmount,
      paymentMethod,
      notes,
    } = body;

    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        shippingStreet,
        shippingCity,
        shippingZipCode,
        subtotal,
        shippingCost,
        discount,
        finalAmount,
        paymentMethod,
        notes,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(
      { data: order, message: "Order created successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
