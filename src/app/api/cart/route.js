import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Get all carts with pagination
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(process.env.DATABASE_PAGINATION_LIMIT || 10);

    const totalCarts = await prisma.cart.count();
    const maxPage = Math.ceil(totalCarts / limit);

    const carts = await prisma.cart.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    return NextResponse.json(
      {
        data: carts,
        page,
        maxPage,
        message: "Carts fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch carts" },
      { status: 500 }
    );
  }
}

// POST: Create a new cart
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, items } = body;

    const cart = await prisma.cart.create({
      data: {
        userId,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(
      { data: cart, message: "Cart created successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create cart" },
      { status: 500 }
    );
  }
}
