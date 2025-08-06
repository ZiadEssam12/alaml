import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Get a single cart by id
export async function GET(request, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Cart id is required" },
        { status: 400 }
      );
    }
    const cart = await prisma.cart.findUnique({
      where: { id },
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

// PUT: Update a cart by id
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Cart id is required" },
        { status: 400 }
      );
    }
    const body = await request.json();
    const { userId, items } = body;
    // Remove existing items and add new ones
    await prisma.cartItem.deleteMany({ where: { cartId: id } });
    const cart = await prisma.cart.update({
      where: { id },
      data: {
        userId,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });
    return NextResponse.json(
      { data: cart, message: "Cart updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a cart by id
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Cart id is required" },
        { status: 400 }
      );
    }
    await prisma.cart.delete({ where: { id } });
    return NextResponse.json(
      { message: "Cart deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete cart" },
      { status: 500 }
    );
  }
}
