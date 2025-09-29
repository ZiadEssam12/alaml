import { getUserTokenSSR } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Get a cart by userId
export async function GET(request) {
  try {
    const session = await getUserTokenSSR(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    let newUserId;
    if (!user) {
      const newUser = await prisma.user.create({
        data: { name: "anonymous", role: "user", email: null },
      });
      newUserId = newUser.id;
    }

    let cart = await prisma.cart.findFirst({
      where: { userId: newUserId || userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          user: { connect: { id: newUserId || userId } },
        },
        include: { items: true },
      });
    }

    return NextResponse.json(
      {
        data: cart,
        newUserId,
        message: "Cart fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}
