import { getUserTokenSSR } from "@/lib/auth-helpers";
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
    const session = await getUserTokenSSR(request);

    const body = await request.json();
    const { item } = body;
    if (!session || !item) {
      return NextResponse.json(
        { error: "User id and item are required" },
        { status: 400 }
      );
    }

    let cart = await prisma.cart.findFirst({
      where: { userId: session.id },
      include: { items: true },
    });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.id },
        include: { items: true },
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: String(item.productId) },
    });
    if (existingItem) {
      return NextResponse.json(
        { error: "العنصر موجود بالفعل في السلة" },
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

    if (product.stockQuantity < item.quantity) {
      return NextResponse.json(
        { error: "الكمية المطلوبة غير متوفرة في المخزون" },
        { status: 409 }
      );
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        cart: { connect: { id: cart.id } },
        product: { connect: { id: item.productId } },
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        imageUrl: product.imageUrls?.[0] || null,
      },
    });

    // Fetch updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: true },
    });
    return NextResponse.json(
      { data: updatedCart, message: "تمت إضافة العنصر إلى السلة" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "فشل في إضافة العنصر إلى السلة" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    // Getting user id from headers
    const userId = request.headers.get("userid");
    if (!userId) {
      return NextResponse.json(
        { error: "معرف المستخدم مطلوب" },
        { status: 400 }
      );
    }

    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });
    if (!cart) {
      return NextResponse.json({ error: "السلة غير موجودة" }, { status: 404 });
    }

    // Remove all items from the cart
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: true },
    });

    return NextResponse.json(
      { data: updatedCart, message: "تمت إزالة جميع العناصر من السلة" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "فشل في حذف العنصر من السلة" },
      { status: 500 }
    );
  }
}
