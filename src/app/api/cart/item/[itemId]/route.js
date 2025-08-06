import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// DELETE: Delete a cart item by itemId
export async function DELETE(request, { params }) {
  try {
    const { itemId } = params;
    if (!itemId) {
      return NextResponse.json(
        { error: "Cart item id is required" },
        { status: 400 }
      );
    }
    await prisma.cartItem.delete({ where: { id: itemId } });
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
