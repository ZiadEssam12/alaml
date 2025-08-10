import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

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
      where: { id: itemId, cart: { connect: { id: userCart.id } } },
    });
    return NextResponse.json(
      { message: "تم حذف العنصر بنجاح" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "فشل حذف عنصر السلة" }, { status: 500 });
  }
}

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
    const { quantity, ...rest } = body;
    // Update the cart item for this user

    // Get user cart ID
    const userCart = await prisma.cart.findUnique({
      where: { userId },
      select: { id: true },
    });

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId, cart: { connect: { id: userCart.id } } },
      data: { quantity, ...rest },
    });
    return NextResponse.json(
      { data: updatedItem, message: "تم تحديث عنصر السلة بنجاح" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "فشل تحديث عنصر السلة" },
      { status: 500 }
    );
  }
}
