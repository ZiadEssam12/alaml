import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Get a cart by userId
export async function GET(request) {
  try {
    const userId = request.headers.get("userid");
    if (!userId) {
      return NextResponse.json(
        { error: "User id is required" },
        { status: 400 }
      );
    }
    const { itemId, quantity } = await request.json();
    if (!itemId || !quantity) {
      return NextResponse.json(
        { error: "Item and quantity required" },
        { status: 400 }
      );
    }
    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: { userId, itemId },
    });
    if (existingItem) {
      return NextResponse.json(
        { error: "Item already exists in cart" },
        { status: 409 }
      );
    }
    // Add item to cart
    const cartItem = await prisma.cartItem.create({
      data: { userId, itemId, quantity },
    });
    return NextResponse.json(
      { data: cartItem, message: "Item added to cart" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}
