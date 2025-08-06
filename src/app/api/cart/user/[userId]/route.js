import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createCartToken } from "@/lib/cart-jwt";

// GET: Get a cart by userId
export async function GET(request, { params }) {
  try {
    const { userId } = params;
    if (!userId) {
      return NextResponse.json(
        { error: "User id is required" },
        { status: 400 }
      );
    }
    let cart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });
    if (!cart) {
      // Create a new cart with a UUID
      const cartId = uuidv4();
      cart = await prisma.cart.create({
        data: {
          id: cartId,
          userId,
        },
        include: { items: true },
      });
      // Create JWT
      return NextResponse.json(
        { data: cart, token: cartId, message: "Cart created and token issued" },
        { status: 201 }
      );
    }
    return NextResponse.json(
      { data: cart, message: "Cart fetched successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}
