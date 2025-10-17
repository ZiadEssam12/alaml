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

    // Use transaction for data consistency and atomicity
    const updatedItem = await prisma.$transaction(async (tx) => {
      // Get user cart
      const userCart = await tx.cart.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!userCart) {
        throw new Error("تعذر العثور على السلة");
      }

      // Get cart item
      const itemData = await tx.cartItem.findUnique({
        where: { id: itemId, cartId: userCart.id },
        select: { id: true, quantity: true, productId: true, cartId: true },
      });

      if (!itemData) {
        throw new Error("تعذر العثور على عنصر السلة");
      }

      // Get product
      const product = await tx.product.findUnique({
        where: { id: itemData.productId },
      });

      if (!product) {
        throw new Error("تعذر العثور على المنتج");
      }

      // Validate quantity
      if (
        itemData.quantity + quantity > product.stockQuantity ||
        itemData.quantity + quantity > product.maxQuantityPerUser
      ) {
        throw new Error("عدد الكمية غير كافٍ");
      }

      // Update cart item
      return await tx.cartItem.update({
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
    });

    return NextResponse.json(
      { data: updatedItem, message: "تم تحديث عنصر السلة بنجاح" },
      { status: 200 }
    );
  } catch (error) {
    console.log("error:", error.message);

    // Handle specific transaction errors
    if (error.message === "تعذر العثور على السلة") {
      return NextResponse.json({ error: "السلة غير موجودة" }, { status: 404 });
    }
    if (error.message === "تعذر العثور على عنصر السلة") {
      return NextResponse.json(
        { error: "عنصر السلة غير موجود" },
        { status: 404 }
      );
    }
    if (error.message === "تعذر العثور على المنتج") {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }
    if (error.message === "عدد الكمية غير كافٍ") {
      return NextResponse.json(
        { error: "عدد الكمية غير كافٍ" },
        { status: 403 }
      );
    }

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
