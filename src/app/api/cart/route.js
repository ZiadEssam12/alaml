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

export async function POST(request) {
  try {
    const userId = request.headers.get("userid");
    console.log("userid :", userId);

    const body = await request.json();
    const { item } = body;
    if (!userId || !item) {
      return NextResponse.json(
        { error: "User id and item are required" },
        { status: 400 }
      );
    }
    // Find or create cart for user
    let cart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: true },
      });
    }
    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: String(item.productId) },
    });
    if (existingItem) {
      return NextResponse.json(
        { error: "Item already exists in cart" },
        { status: 409 }
      );
    }
    // Add item to cart
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      select: { name: true, price: true, imageUrls: true },
    });
    if (!product) {
      return NextResponse.json(
        { error: "المنتج غير موجود في قاعدة البيانات" },
        { status: 404 }
      );
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        imageUrl: product.images?.[0] || null,
      },
    });

    // Fetch updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: true },
    });
    return NextResponse.json(
      { data: updatedCart, message: "Item added to cart" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}
