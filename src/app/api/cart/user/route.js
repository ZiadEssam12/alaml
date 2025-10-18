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

    // Use a transaction to ensure we create an anonymous user (if needed)
    // and get/create the cart in a single atomic operation.
    const { cart, newUserId } = await prisma.$transaction(async (tx) => {
      // Try to find the user
      const existingUser = await tx.user.findUnique({ where: { id: userId } });

      // If user doesn't exist, create an anonymous user
      let createdUserId = null;
      if (!existingUser) {
        const newUser = await tx.user.create({
          data: { name: "anonymous", role: "user", email: null },
        });
        createdUserId = newUser.id;
      }

      const targetUserId = createdUserId || userId;

      // Upsert the cart: atomically return existing cart or create a new one
      const cart = await tx.cart.upsert({
        where: { userId: targetUserId },
        create: { user: { connect: { id: targetUserId } } },
        update: {}, // No changes needed when updating
        include: { items: true },
      });

      return { cart, newUserId: createdUserId };
    });

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
