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
    // Get userId from headers
    const userId = request.headers.get("userid");
    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId in headers" },
        { status: 400 }
      );
    }

    const cardId = await prisma.cart.findUnique({
      where: { userId: userId },
      select: { id: true },
    });

    // Get cart items for user
    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: cardId.id },
      include: { product: true },
    });
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: "السلة فارغة لا يمكن إنشاء طلب جديد" },
        { status: 400 }
      );
    }
    const shippingCost = 30;
    let subtotal = 0;
    const itemsWithTotal = cartItems.map((item) => {
      const price = item.product.price;
      const total = price * item.quantity;
      subtotal += total;
      return {
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price,
        total,
      };
    });

    const discount = 0;
    const finalAmount = subtotal + shippingCost - discount;

    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingStreet,
      shippingCity,
      shippingZipCode,
      paymentMethod,
      notes,
    } = body;

    // Create order
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
        userId,
        items: {
          create: itemsWithTotal,
        },
      },
      include: { items: true },
    });

    // Empty the cart after order is placed
    await prisma.cartItem.deleteMany({ where: { cartId: cardId.id } });

    return NextResponse.json(
      { orderId: order.id, success: true, message: "Order created successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
