import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// PUT: Update a cart by id
export async function PUT(request, { params }) {
  try {
    const userId = request.headers.get("userid");
    if (!userId) {
      return NextResponse.json(
        { error: "User id is required" },
        { status: 400 }
      );
    }
    const { itemId } = await params;
    if (!itemId) {
      return NextResponse.json(
        { error: "Cart item id is required" },
        { status: 400 }
      );
    }
    const body = await request.json();
    const { quantity } = body;

    const userCart = await prisma.cart.findUnique({
      where: { userId },
      select: { id: true },
    });

    const itemData = await prisma.cartItem.findUnique({
      where: { id: itemId, cartId: userCart.id },
    });

    const product = await prisma.product.findUnique({
      where: { id: itemData.productId },
    });

    if (
      itemData.quantity + quantity > product.stockQuantity ||
      itemData.quantity + quantity > product.maxQuantityPerUser
    ) {
      return NextResponse.json(
        { error: "عدد الكمية غير كافٍ" },
        { status: 403 }
      );
    }

    const updatedItem = await prisma.cartItem.update({
      where: {
        id: itemId,
        cartId: userCart.id,
      },
      data: {
        quantity: {
          increment: quantity,
        },
      },
    });
    return NextResponse.json(
      { data: updatedItem, message: "تم تحديث عنصر السلة بنجاح" },
      { status: 200 }
    );
  } catch (error) {
    console.log("error:", error.message);
    return NextResponse.json(
      { error: "فشل تحديث عنصر السلة" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a cart item by itemId
export async function DELETE(request, { params }) {
  try {
    const userId = request.headers.get("userid");
    if (!userId) {
      return NextResponse.json(
        { error: "User id is required" },
        { status: 400 }
      );
    }
    const { itemId } = await params;
    if (!itemId) {
      return NextResponse.json(
        { error: "Cart item id is required" },
        { status: 400 }
      );
    }

    // Get user cart ID
    const userCart = await prisma.cart.findUnique({
      where: { userId },
      select: { id: true },
    });

    await prisma.cartItem.delete({
      where: { id: itemId, cartId: userCart.id },
    });

    return NextResponse.json(
      { message: "تم حذف العنصر بنجاح" },
      { status: 200 }
    );
  } catch (error) {
    console.log("error:", error.message);
    return NextResponse.json({ error: "فشل حذف عنصر السلة" }, { status: 500 });
  }
}
