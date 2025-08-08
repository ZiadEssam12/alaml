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

    await prisma.cartItem.delete({ where: { id: itemId, userId } });
    return NextResponse.json(
      { message: "Cart item deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete cart item" },
      { status: 500 }
    );
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
    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId, userId },
      data: { quantity, ...rest },
    });
    return NextResponse.json(
      { data: updatedItem, message: "Cart item updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update cart item" },
      { status: 500 }
    );
  }
}
