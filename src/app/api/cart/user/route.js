import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Get a cart by userId
export async function GET(request) {
  try {
    const userId = request.headers.get("userid");

    console.log("user id :", userId);
    if (!userId || userId == undefined) {
      return NextResponse.json(
        { error: "User id is required" },
        { status: 400 }
      );
    }
    // Get the user's cart and its items
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
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
